import { useCallback, useEffect, useRef, useState } from 'react';
import { mockEvents, mockHabits, mockMessages, mockTodos } from '../mockData';
import { CalendarConnection, CalendarEvent, CoupleWorkspace, HabitDefinition, HabitRecord, Layer, Message, MessageCategory, ToDo, User, UserNames } from '../types';
import { isSupabaseConfigured, supabase, type Session } from './supabase';

const DEFAULT_NAMES: UserNames = { him: 'Leo', her: 'Aria' };

const INITIAL_LAYERS: Layer[] = [
  { id: 'him_schedule', slug: 'him_schedule', name: 'His Schedule', type: 'schedule', owner: 'him', color: '#d1e6e0' },
  { id: 'her_schedule', slug: 'her_schedule', name: 'Her Schedule', type: 'schedule', owner: 'her', color: '#f0e6eb' },
  { id: 'shared_habits', slug: 'shared_habits', name: 'Shared Habits', type: 'habits', owner: 'both', color: '#e0e5ed' },
  { id: 'todos', slug: 'todos', name: 'To-Dos', type: 'todos', owner: 'both', color: '#d8dadc' },
];

const INITIAL_HABIT_DEFINITIONS: HabitDefinition[] = [
  { id: 'vocabulary', name: 'Vocabulary', color: '#4ade80', owner: 'both', active: true },
  { id: 'shower', name: 'Shower', color: '#d8dadc', owner: 'both', active: true },
  { id: 'exercise', name: 'Exercise', color: '#a65d5d', owner: 'both', active: true },
];

function readUserName(session: Session | null) {
  const metadata = session?.user.user_metadata;
  return (
    metadata?.full_name ||
    metadata?.name ||
    metadata?.user_name ||
    session?.user.email?.split('@')[0] ||
    'Me'
  );
}

function toTime(value: string | null | undefined) {
  if (!value) return undefined;
  return value.slice(0, 5);
}

function opposite(role: User): User {
  return role === 'him' ? 'her' : 'him';
}

function tableError(error: { message?: string } | null) {
  if (error) throw new Error(error.message || 'Supabase request failed');
}

function nowIso() {
  return new Date().toISOString();
}

function todayAtNoon() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
}

export function useCoupleSyncStore(session: Session | null) {
  const dbMode = Boolean(isSupabaseConfigured && supabase && session);
  const [currentDate, setCurrentDate] = useState(todayAtNoon);
  const [userNames, setUserNames] = useState<UserNames>(DEFAULT_NAMES);
  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS);
  const [activeLayers, setActiveLayers] = useState<string[]>(INITIAL_LAYERS.map(layer => layer.id));
  const [todos, setTodos] = useState<ToDo[]>(mockTodos);
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [habits, setHabits] = useState<HabitRecord[]>(mockHabits);
  const [habitDefinitions, setHabitDefinitions] = useState<HabitDefinition[]>(INITIAL_HABIT_DEFINITIONS);
  const [calendarConnections, setCalendarConnections] = useState<CalendarConnection[]>([]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [workspace, setWorkspace] = useState<CoupleWorkspace | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [loading, setLoading] = useState(dbMode);
  const [setupLoading, setSetupLoading] = useState(false);
  const [calendarActionLoading, setCalendarActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSetLiveDateRef = useRef(false);
  const layerIdsRef = useRef<string[]>(INITIAL_LAYERS.map(layer => layer.id));
  const reloadRef = useRef<() => void>(() => {});

  const ensureProfile = useCallback(async () => {
    if (!supabase || !session) return;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', session.user.id)
      .maybeSingle();

    tableError(profileError);

    if (!profile) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: session.user.id,
        display_name: readUserName(session),
        avatar_url: session.user.user_metadata?.avatar_url ?? null,
      });
      tableError(insertError);
    }
  }, [session]);

  const loadCoupleData = useCallback(async (nextWorkspace: CoupleWorkspace) => {
    if (!supabase) return;

    const coupleId = nextWorkspace.coupleId;
    const [
      membersResult,
      layersResult,
      eventsResult,
      habitDefinitionsResult,
      habitsResult,
      todosResult,
      messagesResult,
      calendarConnectionsResult,
    ] = await Promise.all([
      supabase.from('couple_members').select('user_id, role').eq('couple_id', coupleId),
      supabase.from('layers').select('*').eq('couple_id', coupleId).order('sort_order', { ascending: true }),
      supabase.from('events').select('*').eq('couple_id', coupleId).order('event_date', { ascending: true }).order('start_time', { ascending: true }),
      supabase.from('habit_definitions').select('*').eq('couple_id', coupleId).order('sort_order', { ascending: true }),
      supabase.from('habit_logs').select('id, habit_id, habit_date, owner_role, habit_definitions(name, color)').eq('couple_id', coupleId),
      supabase.from('todos').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false }),
      supabase.from('inbox_messages').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false }),
      supabase.from('calendar_connections').select('id, provider, provider_account_id, scopes, sync_status, last_synced_at, last_sync_error').eq('couple_id', coupleId).eq('user_id', session?.user.id ?? ''),
    ]);

    tableError(membersResult.error);
    tableError(layersResult.error);
    tableError(eventsResult.error);
    tableError(habitDefinitionsResult.error);
    tableError(habitsResult.error);
    tableError(todosResult.error);
    tableError(messagesResult.error);
    tableError(calendarConnectionsResult.error);

    const memberRows = membersResult.data ?? [];
    const profileIds = memberRows.map((member: any) => member.user_id).filter(Boolean);
    const profilesResult = profileIds.length
      ? await supabase.from('profiles').select('id, display_name').in('id', profileIds)
      : { data: [], error: null };

    tableError(profilesResult.error);

    const profilesById = new Map((profilesResult.data ?? []).map((profile: any) => [profile.id, profile]));
    const nextNames: UserNames = { ...DEFAULT_NAMES };

    memberRows.forEach((member: any) => {
      if (member.role === 'him' || member.role === 'her') {
        const profile = profilesById.get(member.user_id);
        nextNames[member.role] = profile?.display_name || (member.user_id === session?.user.id ? readUserName(session) : nextNames[member.role]);
      }
    });

    setUserNames(nextNames);

    const nextLayers: Layer[] = (layersResult.data ?? []).map((layer: any) => ({
      id: layer.slug || layer.id,
      databaseId: layer.id,
      slug: layer.slug,
      name: layer.name,
      type: layer.type,
      owner: layer.owner_role,
      color: layer.color,
      isVisibleByDefault: layer.is_visible_by_default,
    }));

    const resolvedLayers = nextLayers.length ? nextLayers : INITIAL_LAYERS;
    const previousLayerIds = new Set(layerIdsRef.current);
    setLayers(resolvedLayers);
    setActiveLayers(previous => {
      const validIds = new Set(resolvedLayers.map(layer => layer.id));
      const validPrevious = previous.filter(id => validIds.has(id));

      if (previous.length > 0 && validPrevious.length === 0) {
        return resolvedLayers
          .filter(layer => layer.isVisibleByDefault !== false)
          .map(layer => layer.id);
      }

      const nextActive = new Set(validPrevious);
      resolvedLayers.forEach(layer => {
        if (!previousLayerIds.has(layer.id) && layer.isVisibleByDefault !== false) {
          nextActive.add(layer.id);
        }
      });

      return Array.from(nextActive);
    });
    layerIdsRef.current = resolvedLayers.map(layer => layer.id);

    setEvents((eventsResult.data ?? []).map((event: any) => ({
      id: event.id,
      title: event.title,
      date: event.event_date,
      startTime: toTime(event.start_time),
      endTime: toTime(event.end_time),
      allDay: event.all_day,
      user: event.owner_role,
      layerId: event.layer_id,
      source: event.source,
    })));

    setHabitDefinitions((habitDefinitionsResult.data ?? []).map((definition: any) => ({
      id: definition.id,
      name: definition.name,
      color: definition.color,
      owner: definition.owner_role,
      active: definition.is_active,
    })));

    setHabits((habitsResult.data ?? []).map((log: any) => {
      const definition = Array.isArray(log.habit_definitions) ? log.habit_definitions[0] : log.habit_definitions;
      const ownerRole: User = log.owner_role === 'her' ? 'her' : 'him';
      return {
        id: log.id,
        date: log.habit_date,
        habitId: log.habit_id,
        habit: definition?.name || 'Habit',
        name: definition?.name || 'Habit',
        color: definition?.color,
        user: ownerRole,
      };
    }));

    setTodos((todosResult.data ?? []).map((todo: any) => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      date: todo.scheduled_date || undefined,
      assignee: todo.assignee_role,
    })));

    setCalendarConnections((calendarConnectionsResult.data ?? []).map((connection: any) => ({
      id: connection.id,
      provider: connection.provider,
      providerAccountId: connection.provider_account_id,
      scopes: connection.scopes ?? [],
      syncStatus: connection.sync_status ?? 'idle',
      lastSyncedAt: connection.last_synced_at,
      lastSyncError: connection.last_sync_error,
    })));

    const messageRows = messagesResult.data ?? [];
    const repliesByParent = new Map<string, Message[]>();
    messageRows
      .filter((message: any) => message.parent_id)
      .forEach((message: any) => {
        const reply: Message = {
          id: message.id,
          from: message.sender_role,
          to: opposite(message.sender_role),
          category: message.category,
          content: message.content,
          timestamp: message.created_at,
          parentId: message.parent_id,
          convertedEventId: message.converted_event_id,
        };
        repliesByParent.set(message.parent_id, [...(repliesByParent.get(message.parent_id) ?? []), reply]);
      });

    setMessages(messageRows
      .filter((message: any) => !message.parent_id && !message.converted_event_id)
      .map((message: any) => ({
        id: message.id,
        from: message.sender_role,
        to: opposite(message.sender_role),
        category: message.category,
        content: message.content,
        timestamp: message.created_at,
        parentId: message.parent_id,
        convertedEventId: message.converted_event_id,
        replies: repliesByParent.get(message.id) ?? [],
      })));
  }, [session]);

  const loadWorkspace = useCallback(async () => {
    if (!dbMode || !supabase || !session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ensureProfile();

      const { data: memberRows, error: memberError } = await supabase
        .from('couple_members')
        .select('couple_id, role, couples(id, name, invite_code)')
        .eq('user_id', session.user.id)
        .limit(1);

      tableError(memberError);

      if (!memberRows || memberRows.length === 0) {
        setWorkspace(null);
        setSetupRequired(true);
        return;
      }

      const member = memberRows[0] as any;
      const couple = Array.isArray(member.couples) ? member.couples[0] : member.couples;
      const nextWorkspace: CoupleWorkspace = {
        coupleId: member.couple_id,
        coupleName: couple?.name || 'Our Calendar',
        inviteCode: couple?.invite_code || '',
        role: member.role,
      };

      setWorkspace(nextWorkspace);
      setSetupRequired(false);

      if (!hasSetLiveDateRef.current) {
        setCurrentDate(new Date());
        hasSetLiveDateRef.current = true;
      }

      await loadCoupleData(nextWorkspace);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load CoupleSync data');
    } finally {
      setLoading(false);
    }
  }, [dbMode, ensureProfile, loadCoupleData, session]);

  useEffect(() => {
    reloadRef.current = () => {
      void loadWorkspace();
    };
  }, [loadWorkspace]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!dbMode || !supabase || !workspace?.coupleId) return;

    const filter = `couple_id=eq.${workspace.coupleId}`;
    const channel = supabase
      .channel(`couplesync-${workspace.coupleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'layers', filter }, () => reloadRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter }, () => reloadRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_definitions', filter }, () => reloadRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs', filter }, () => reloadRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter }, () => reloadRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbox_messages', filter }, () => reloadRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_connections', filter }, () => reloadRef.current())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [dbMode, workspace?.coupleId]);

  const createCouple = useCallback(async (name: string, role: User) => {
    if (!supabase) return;
    setSetupLoading(true);
    setError(null);
    try {
      const { error: createError } = await supabase.rpc('create_couple_workspace', {
        p_name: name,
        p_role: role,
      });
      tableError(createError);
      await loadWorkspace();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to create workspace');
    } finally {
      setSetupLoading(false);
    }
  }, [loadWorkspace]);

  const joinCouple = useCallback(async (inviteCode: string, role: User) => {
    if (!supabase) return;
    setSetupLoading(true);
    setError(null);
    try {
      const { error: joinError } = await supabase.rpc('join_couple_by_invite_code', {
        p_invite_code: inviteCode,
        p_role: role,
      });
      tableError(joinError);
      await loadWorkspace();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to join workspace');
    } finally {
      setSetupLoading(false);
    }
  }, [loadWorkspace]);

  const toggleLayer = useCallback((id: string) => {
    setActiveLayers(previous =>
      previous.includes(id) ? previous.filter(layerId => layerId !== id) : [...previous, id],
    );
  }, []);

  const toggleAllLayers = useCallback(() => {
    setActiveLayers(previous => (previous.length === layers.length ? [] : layers.map(layer => layer.id)));
  }, [layers]);

  const createCustomLayer = useCallback(async (name: string, color: string) => {
    const layerName = name.trim();
    if (!layerName) return;

    if (dbMode && supabase && workspace) {
      const { error: insertError } = await supabase.from('layers').insert({
        couple_id: workspace.coupleId,
        name: layerName,
        type: 'custom',
        owner_role: 'both',
        color,
        sort_order: layers.length * 10 + 50,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      reloadRef.current();
      return;
    }

    const newLayer: Layer = {
      id: `custom_${Date.now()}`,
      name: layerName,
      type: 'custom',
      owner: 'both',
      color,
    };
    setLayers(previous => [...previous, newLayer]);
    setActiveLayers(previous => [...previous, newLayer.id]);
  }, [dbMode, layers.length, workspace]);

  const updateLayerColor = useCallback(async (id: string, color: string) => {
    const layer = layers.find(item => item.id === id || item.databaseId === id);
    if (!layer) return;

    setLayers(previous => previous.map(item => (
      item.id === layer.id ? { ...item, color } : item
    )));

    if (dbMode && supabase && layer.databaseId) {
      const { error: updateError } = await supabase
        .from('layers')
        .update({ color })
        .eq('id', layer.databaseId);

      if (updateError) {
        setError(updateError.message);
        reloadRef.current();
      }
    }
  }, [dbMode, layers]);

  const createHabitDefinition = useCallback(async (name: string, color: string) => {
    const habitName = name.trim();
    if (!habitName) return;

    if (dbMode && supabase && workspace) {
      const { error: insertError } = await supabase.from('habit_definitions').insert({
        couple_id: workspace.coupleId,
        name: habitName,
        color,
        owner_role: 'both',
        sort_order: habitDefinitions.length * 10 + 50,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      reloadRef.current();
      return;
    }

    setHabitDefinitions(previous => [
      ...previous,
      {
        id: `habit_${Date.now()}`,
        name: habitName,
        color,
        owner: 'both',
        active: true,
      },
    ]);
  }, [dbMode, habitDefinitions.length, workspace]);

  const updateHabitDefinition = useCallback(async (id: string, updates: Partial<Pick<HabitDefinition, 'name' | 'color' | 'active'>>) => {
    const definition = habitDefinitions.find(habit => habit.id === id);
    if (!definition) return;
    const nextName = updates.name?.trim();
    const nextUpdates = {
      name: nextName || definition.name,
      color: updates.color || definition.color,
      active: updates.active ?? definition.active,
    };

    setHabitDefinitions(previous => previous.map(habit => (
      habit.id === id ? { ...habit, ...nextUpdates } : habit
    )));
    setHabits(previous => previous.map(log => (
      log.habitId === id
        ? { ...log, habit: nextUpdates.name, name: nextUpdates.name, color: nextUpdates.color }
        : log
    )));

    if (dbMode && supabase) {
      const { error: updateError } = await supabase
        .from('habit_definitions')
        .update({
          name: nextUpdates.name,
          color: nextUpdates.color,
          is_active: nextUpdates.active,
        })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        reloadRef.current();
      }
    }
  }, [dbMode, habitDefinitions]);

  const addHabitLog = useCallback(async (date: string, habitId: string) => {
    const definition = habitDefinitions.find(habit => habit.id === habitId);
    if (!definition) return;
    const loggerRole = workspace?.role || 'him';

    const existingLog = habits.find(log => (
      log.date === date
      && log.user === loggerRole
      && (log.habitId === habitId || log.habit === definition.id || log.name === definition.name)
    ));
    if (existingLog) return;

    if (dbMode && supabase && workspace && session) {
      const { error: insertError } = await supabase.from('habit_logs').upsert({
        couple_id: workspace.coupleId,
        habit_id: habitId,
        habit_date: date,
        owner_role: loggerRole,
        logged_by: session.user.id,
      }, {
        onConflict: 'couple_id,habit_id,habit_date,owner_role',
        ignoreDuplicates: true,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      reloadRef.current();
      return;
    }

    setHabits(previous => [
      ...previous,
      {
        id: `habit_log_${Date.now()}`,
        date,
        habitId,
        habit: definition.name,
        name: definition.name,
        color: definition.color,
        user: loggerRole,
      },
    ]);
  }, [dbMode, habitDefinitions, habits, session, workspace]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(item => item.id === id);
    if (!todo) return;

    const nextCompleted = !todo.completed;
    setTodos(previous => previous.map(item => item.id === id ? { ...item, completed: nextCompleted } : item));

    if (dbMode && supabase && session) {
      const { error: updateError } = await supabase
        .from('todos')
        .update({
          completed: nextCompleted,
          completed_by: nextCompleted ? session.user.id : null,
          completed_at: nextCompleted ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        reloadRef.current();
      }
    }
  }, [dbMode, session, todos]);

  const assignTodoToDate = useCallback(async (id: string, dateStr: string) => {
    setTodos(previous => previous.map(item => item.id === id ? { ...item, date: dateStr } : item));

    if (dbMode && supabase) {
      const { error: updateError } = await supabase
        .from('todos')
        .update({ scheduled_date: dateStr })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        reloadRef.current();
      }
    }
  }, [dbMode]);

  const unassignTodoFromDate = useCallback(async (id: string) => {
    setTodos(previous => previous.map(item => item.id === id ? { ...item, date: undefined } : item));

    if (dbMode && supabase) {
      const { error: updateError } = await supabase
        .from('todos')
        .update({ scheduled_date: null })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        reloadRef.current();
      }
    }
  }, [dbMode]);

  const addEventFromMessage = useCallback(async (msg: Message, dateInput: string, startTime = '09:00', endTime = '10:00', owner: User | 'both' = 'both', layerId?: string) => {
    const layer = layers.find(item => item.id === layerId || item.databaseId === layerId);

    if (dbMode && supabase && workspace && session) {
      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          couple_id: workspace.coupleId,
          title: msg.content,
          event_date: dateInput,
          start_time: startTime || null,
          end_time: endTime || null,
          all_day: !startTime,
          owner_role: owner,
          layer_id: layer?.databaseId ?? null,
          created_by: session.user.id,
        })
        .select('id')
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      const { error: messageUpdateError } = await supabase
        .from('inbox_messages')
        .update({ converted_event_id: data?.id ?? null })
        .eq('id', msg.id);

      if (messageUpdateError) {
        setError(messageUpdateError.message);
      }

      reloadRef.current();
      return;
    }

    const newEvent: CalendarEvent = {
      id: `ev_${Date.now()}`,
      title: msg.content,
      date: dateInput,
      startTime,
      endTime,
      allDay: !startTime,
      user: owner,
      layerId: layer?.id ?? layerId ?? null,
    };
    setEvents(previous => [...previous, newEvent]);
    setMessages(previous => previous.filter(message => message.id !== msg.id));
  }, [dbMode, layers, session, workspace]);

  const addCalendarEvent = useCallback(async (title: string, dateInput: string, startTime?: string, endTime?: string, owner: User | 'both' = 'both', layerId?: string, allDay = false) => {
    const eventTitle = title.trim();
    if (!eventTitle || !dateInput) return;
    const layer = layers.find(item => item.id === layerId || item.databaseId === layerId);

    if (dbMode && supabase && workspace && session) {
      const { error: insertError } = await supabase
        .from('events')
        .insert({
          couple_id: workspace.coupleId,
          title: eventTitle,
          event_date: dateInput,
          start_time: allDay ? null : startTime || null,
          end_time: allDay ? null : endTime || null,
          all_day: allDay,
          owner_role: owner,
          layer_id: layer?.databaseId ?? null,
          created_by: session.user.id,
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      reloadRef.current();
      return;
    }

    const newEvent: CalendarEvent = {
      id: `ev_${Date.now()}`,
      title: eventTitle,
      date: dateInput,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      allDay,
      user: owner,
      layerId: layer?.id ?? layerId ?? null,
    };
    setEvents(previous => [...previous, newEvent]);
  }, [dbMode, layers, session, workspace]);

  const updateCalendarEvent = useCallback(async (
    id: string,
    updates: {
      title: string;
      date: string;
      startTime?: string;
      endTime?: string;
      allDay?: boolean;
      owner: User | 'both';
      layerId?: string;
    },
  ) => {
    const eventTitle = updates.title.trim();
    if (!eventTitle || !updates.date) return;
    const layer = layers.find(item => item.id === updates.layerId || item.databaseId === updates.layerId);

    if (dbMode && supabase) {
      const { error: updateError } = await supabase
        .from('events')
        .update({
          title: eventTitle,
          event_date: updates.date,
          start_time: updates.allDay ? null : updates.startTime || null,
          end_time: updates.allDay ? null : updates.endTime || null,
          all_day: Boolean(updates.allDay),
          owner_role: updates.owner,
          layer_id: layer?.databaseId ?? null,
        })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      reloadRef.current();
      return;
    }

    setEvents(previous => previous.map(event => (
      event.id === id
        ? {
          ...event,
          title: eventTitle,
          date: updates.date,
          startTime: updates.allDay ? undefined : updates.startTime,
          endTime: updates.allDay ? undefined : updates.endTime,
          allDay: Boolean(updates.allDay),
          user: updates.owner,
          layerId: layer?.id ?? updates.layerId ?? null,
        }
        : event
    )));
  }, [dbMode, layers]);

  const deleteCalendarEvent = useCallback(async (id: string) => {
    const event = events.find(item => item.id === id);
    if (!event) return;

    setEvents(previous => previous.filter(item => item.id !== id));

    if (dbMode && supabase) {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
        reloadRef.current();
      }
    }
  }, [dbMode, events]);

  const restoreCalendarEvent = useCallback(async (event: CalendarEvent) => {
    setEvents(previous => previous.some(item => item.id === event.id) ? previous : [...previous, event]);
    const layer = layers.find(item => item.id === event.layerId || item.databaseId === event.layerId);

    if (dbMode && supabase && workspace && session) {
      const { error: insertError } = await supabase
        .from('events')
        .insert({
          id: event.id,
          couple_id: workspace.coupleId,
          title: event.title,
          event_date: event.date,
          start_time: event.allDay ? null : event.startTime || null,
          end_time: event.allDay ? null : event.endTime || null,
          all_day: Boolean(event.allDay),
          owner_role: event.user,
          layer_id: layer?.databaseId ?? null,
          source: event.source || 'manual',
          created_by: session.user.id,
        });

      if (insertError) {
        setError(insertError.message);
        reloadRef.current();
      }
    }
  }, [dbMode, layers, session, workspace]);

  const addNewTodo = useCallback(async (assignee: User | 'both', text: string, isFlexible: boolean = true) => {
    const taskText = text.trim();
    if (!taskText) return;
    const scheduledDate = isFlexible ? undefined : currentDate.toISOString().split('T')[0];

    if (dbMode && supabase && workspace && session) {
      const { error: insertError } = await supabase.from('todos').insert({
        couple_id: workspace.coupleId,
        text: taskText,
        completed: false,
        assignee_role: assignee,
        scheduled_date: scheduledDate ?? null,
        created_by: session.user.id,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      reloadRef.current();
      return;
    }

    const newTodo: ToDo = {
      id: `td_${Date.now()}`,
      text: taskText,
      completed: false,
      assignee,
      date: scheduledDate,
    };
    setTodos(previous => [...previous, newTodo]);
  }, [currentDate, dbMode, session, workspace]);

  const deleteTodo = useCallback(async (id: string) => {
    const todo = todos.find(item => item.id === id);
    if (!todo) return;

    setTodos(previous => previous.filter(item => item.id !== id));

    if (dbMode && supabase) {
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
        reloadRef.current();
      }
    }
  }, [dbMode, todos]);

  const restoreTodo = useCallback(async (todo: ToDo) => {
    setTodos(previous => previous.some(item => item.id === todo.id) ? previous : [...previous, todo]);

    if (dbMode && supabase && workspace && session) {
      const { error: insertError } = await supabase
        .from('todos')
        .insert({
          id: todo.id,
          couple_id: workspace.coupleId,
          text: todo.text,
          completed: todo.completed,
          scheduled_date: todo.date ?? null,
          assignee_role: todo.assignee,
          created_by: session.user.id,
          completed_by: todo.completed ? session.user.id : null,
          completed_at: todo.completed ? new Date().toISOString() : null,
        });

      if (insertError) {
        setError(insertError.message);
        reloadRef.current();
      }
    }
  }, [dbMode, session, workspace]);

  const addInboxMessage = useCallback(async (content: string, category: MessageCategory) => {
    const messageContent = content.trim();
    if (!messageContent) return;
    const senderRole = workspace?.role || 'him';

    if (dbMode && supabase && workspace && session) {
      const { error: insertError } = await supabase.from('inbox_messages').insert({
        couple_id: workspace.coupleId,
        sender_id: session.user.id,
        sender_role: senderRole,
        category,
        content: messageContent,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      reloadRef.current();
      return;
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      from: senderRole,
      to: opposite(senderRole),
      category,
      content: messageContent,
      timestamp: nowIso(),
      replies: [],
    };
    setMessages(previous => [newMessage, ...previous]);
  }, [dbMode, session, workspace]);

  const replyToMessage = useCallback(async (parentId: string, content: string) => {
    const replyContent = content.trim();
    if (!replyContent) return;
    const senderRole = workspace?.role || 'her';

    if (dbMode && supabase && workspace && session) {
      const { error: insertError } = await supabase.from('inbox_messages').insert({
        couple_id: workspace.coupleId,
        parent_id: parentId,
        sender_id: session.user.id,
        sender_role: senderRole,
        category: 'idea',
        content: replyContent,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      reloadRef.current();
      return;
    }

    const reply: Message = {
      id: `reply_${Date.now()}`,
      from: senderRole,
      to: opposite(senderRole),
      category: 'idea',
      content: replyContent,
      timestamp: nowIso(),
      parentId,
    };
    setMessages(previous => previous.map(message => (
      message.id === parentId
        ? { ...message, replies: [...(message.replies ?? []), reply] }
        : message
    )));
  }, [dbMode, session, workspace]);

  const deleteInboxMessage = useCallback(async (id: string) => {
    const message = messages.find(item => item.id === id);
    if (!message) return;

    setMessages(previous => previous.filter(item => item.id !== id));

    if (dbMode && supabase) {
      const { error: deleteError } = await supabase
        .from('inbox_messages')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
        reloadRef.current();
      }
    }
  }, [dbMode, messages]);

  const restoreInboxMessage = useCallback(async (message: Message) => {
    setMessages(previous => previous.some(item => item.id === message.id) ? previous : [message, ...previous]);

    if (dbMode && supabase && workspace && session) {
      const { error: insertError } = await supabase.from('inbox_messages').insert({
        id: message.id,
        couple_id: workspace.coupleId,
        parent_id: null,
        sender_id: session.user.id,
        sender_role: message.from,
        category: message.category,
        content: message.content,
        converted_event_id: message.convertedEventId ?? null,
        created_at: message.timestamp,
      });

      if (insertError) {
        setError(insertError.message);
        reloadRef.current();
        return;
      }

      const replies = message.replies ?? [];
      if (replies.length > 0) {
        const { error: repliesError } = await supabase.from('inbox_messages').insert(replies.map(reply => ({
          id: reply.id,
          couple_id: workspace.coupleId,
          parent_id: message.id,
          sender_id: session.user.id,
          sender_role: reply.from,
          category: reply.category,
          content: reply.content,
          converted_event_id: reply.convertedEventId ?? null,
          created_at: reply.timestamp,
        })));

        if (repliesError) {
          setError(repliesError.message);
          reloadRef.current();
        }
      }
    }
  }, [dbMode, session, workspace]);

  const changeNames = useCallback(async (nextNames: UserNames) => {
    if (dbMode && supabase && session) {
      const role = workspace?.role;
      const nextName = role ? nextNames[role].trim() : readUserName(session);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: nextName })
        .eq('id', session.user.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      if (role) setUserNames(previous => ({ ...previous, [role]: nextName }));
      return;
    }

    setUserNames({
      him: nextNames.him.trim() || userNames.him,
      her: nextNames.her.trim() || userNames.her,
    });
  }, [dbMode, session, userNames, workspace?.role]);

  const startGoogleCalendarConnect = useCallback(async () => {
    if (!dbMode || !session) {
      setError('Connect Supabase and sign in before linking Google Calendar.');
      return;
    }

    setCalendarActionLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/google/connect', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const contentType = response.headers.get('content-type') || '';
      const body = contentType.includes('application/json') ? await response.json() : null;

      if (!response.ok || !body?.authUrl) {
        throw new Error(body?.error || 'Google Calendar API is not available. Use Vercel dev or a deployed Vercel app for this step.');
      }

      window.location.assign(body.authUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to start Google Calendar connection');
    } finally {
      setCalendarActionLoading(false);
    }
  }, [dbMode, session]);

  const syncGoogleCalendar = useCallback(async () => {
    if (!dbMode || !session) {
      setError('Connect Supabase and sign in before syncing Google Calendar.');
      return;
    }

    setCalendarActionLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/google/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const contentType = response.headers.get('content-type') || '';
      const body = contentType.includes('application/json') ? await response.json() : null;

      if (!response.ok) {
        throw new Error(body?.error || 'Unable to sync Google Calendar');
      }

      reloadRef.current();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sync Google Calendar');
    } finally {
      setCalendarActionLoading(false);
    }
  }, [dbMode, session]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    activeLayers,
    addCalendarEvent,
    addHabitLog,
    addInboxMessage,
    addEventFromMessage,
    addNewTodo,
    assignTodoToDate,
    calendarActionLoading,
    calendarConnections,
    changeNames,
    clearError,
    createHabitDefinition,
    createCustomLayer,
    createCouple,
    currentDate,
    error,
    events,
    habits,
    habitDefinitions,
    deleteCalendarEvent,
    deleteInboxMessage,
    deleteTodo,
    layers,
    loading,
    messages,
    replyToMessage,
    restoreCalendarEvent,
    restoreInboxMessage,
    restoreTodo,
    setupLoading,
    setupRequired,
    setCurrentDate,
    todos,
    toggleAllLayers,
    toggleLayer,
    toggleTodo,
    unassignTodoFromDate,
    startGoogleCalendarConnect,
    syncGoogleCalendar,
    updateCalendarEvent,
    updateHabitDefinition,
    updateLayerColor,
    userNames,
    workspace,
    joinCouple,
  };
}
