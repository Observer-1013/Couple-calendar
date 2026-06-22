import { useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Calendar } from './components/Calendar';
import { RightPanel } from './components/RightPanel';
import { TopNav } from './components/TopNav';
import { AuthScreen } from './components/AuthScreen';
import { CoupleSetup } from './components/CoupleSetup';
import { SettingsModal } from './components/SettingsModal';
import { ChangelogModal } from './components/ChangelogModal';
import { CHANGELOG_ENTRIES } from './data/changelog';
import { useCoupleSyncStore } from './lib/useCoupleSyncStore';
import { useSupabaseSession } from './lib/useSupabaseSession';
import { CalendarEvent, Message, ViewMode } from './types';

const CHANGELOG_LAST_SEEN_KEY = 'couplesync-changelog-last-seen';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const auth = useSupabaseSession();
  const store = useCoupleSyncStore(auth.session);
  
  // Sidebar states
  const [leftOpen, setLeftOpen] = useState(() => (
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches
  ));
  const [rightOpen, setRightOpen] = useState(() => (
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches
  ));
  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const closePanelsOnMobile = () => {
      if (!mobileQuery.matches) return;
      setLeftOpen(false);
      setRightOpen(false);
    };

    closePanelsOnMobile();
    mobileQuery.addEventListener('change', closePanelsOnMobile);
    return () => mobileQuery.removeEventListener('change', closePanelsOnMobile);
  }, []);
  const [rightTab, setRightTab] = useState<'inbox' | 'todos'>('inbox');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (
    typeof window === 'undefined' ? 'light' : (localStorage.getItem('couplesync-theme') as 'light' | 'dark') || 'light'
  ));
  const [undoMessage, setUndoMessage] = useState<string | null>(null);
  const undoActionRef = useRef<(() => void) | null>(null);
  const undoTimerRef = useRef<number | null>(null);
  const [messageToSchedule, setMessageToSchedule] = useState<Message | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState({
    date: store.currentDate.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
  });
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventDraft, setEventDraft] = useState({
    title: '',
    date: store.currentDate.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    allDay: false,
    owner: 'both' as 'both' | 'him' | 'her',
    layerId: '',
  });
  const currentUserRole = store.workspace?.role || 'him';
  const appReadyForChangelog = !auth.isConfigured || Boolean(auth.session && !store.loading && !store.setupRequired);

  useEffect(() => {
    localStorage.setItem('couplesync-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!appReadyForChangelog || CHANGELOG_ENTRIES.length === 0) return;

    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    const latestId = CHANGELOG_ENTRIES[0].id;
    const nextSeenValue = `${today}:${latestId}`;

    if (localStorage.getItem(CHANGELOG_LAST_SEEN_KEY) === nextSeenValue) return;
    localStorage.setItem(CHANGELOG_LAST_SEEN_KEY, nextSeenValue);
    setChangelogOpen(true);
  }, [appReadyForChangelog]);

  const showUndo = (message: string, undo: () => void) => {
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    undoActionRef.current = undo;
    setUndoMessage(message);
    undoTimerRef.current = window.setTimeout(() => {
      undoActionRef.current = null;
      setUndoMessage(null);
    }, 6000);
  };

  const openScheduleDialog = (message: Message) => {
    setMessageToSchedule(message);
    setScheduleDraft({
      date: store.currentDate.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
    });
    setEventDraft(previous => ({ ...previous, owner: 'both', layerId: '' }));
  };

  const saveScheduledMessage = () => {
    if (!messageToSchedule || !scheduleDraft.date) return;
    void store.addEventFromMessage(
      messageToSchedule,
      scheduleDraft.date,
      scheduleDraft.startTime,
      scheduleDraft.endTime,
      eventDraft.owner,
      eventDraft.layerId || undefined,
    );
    setMessageToSchedule(null);
  };

  const scheduleMessageOnDate = (messageId: string, date: string) => {
    const message = store.messages.find(item => item.id === messageId);
    if (!message) return;
    void store.addEventFromMessage(message, date, '09:00', '10:00');
  };

  const openEventDialog = (date: string) => {
    setEditingEventId(null);
    setEventDraft({
      title: '',
      date,
      startTime: '09:00',
      endTime: '10:00',
      allDay: false,
      owner: 'both',
      layerId: '',
    });
    setCreatingEvent(true);
  };

  const openEventEditor = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    setEventDraft({
      title: event.title,
      date: event.date,
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '10:00',
      allDay: Boolean(event.allDay || !event.startTime),
      owner: event.user,
      layerId: event.layerId || '',
    });
    setCreatingEvent(true);
  };

  const saveEvent = () => {
    if (!eventDraft.title.trim() || !eventDraft.date) return;
    if (editingEventId) {
      void store.updateCalendarEvent(editingEventId, {
        title: eventDraft.title,
        date: eventDraft.date,
        startTime: eventDraft.startTime,
        endTime: eventDraft.endTime,
        allDay: eventDraft.allDay,
        owner: eventDraft.owner,
        layerId: eventDraft.layerId || undefined,
      });
    } else {
      void store.addCalendarEvent(eventDraft.title, eventDraft.date, eventDraft.startTime, eventDraft.endTime, eventDraft.owner, eventDraft.layerId || undefined, eventDraft.allDay);
    }
    setCreatingEvent(false);
    setEditingEventId(null);
  };

  const deleteEditingEvent = () => {
    if (!editingEventId) return;
    const event = store.events.find(item => item.id === editingEventId);
    if (!event) return;
    void store.deleteCalendarEvent(editingEventId);
    setCreatingEvent(false);
    setEditingEventId(null);
    showUndo('Event deleted', () => void store.restoreCalendarEvent(event));
  };

  const deleteTodoWithUndo = (todoId: string) => {
    const todo = store.todos.find(item => item.id === todoId);
    if (!todo) return;
    void store.deleteTodo(todoId);
    showUndo('Task deleted', () => void store.restoreTodo(todo));
  };

  const deleteMessageWithUndo = (messageId: string) => {
    const message = store.messages.find(item => item.id === messageId);
    if (!message) return;
    void store.deleteInboxMessage(messageId);
    showUndo('Message deleted', () => void store.restoreInboxMessage(message));
  };

  const localDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatShortDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const roleLabel = (role: CalendarEvent['user']) => {
    if (role === 'him') return store.userNames.him;
    if (role === 'her') return store.userNames.her;
    return 'Shared';
  };

  const todayKey = localDateKey();
  const todayEvents = store.events.filter(event => event.date === todayKey);
  const todayTodos = store.todos.filter(todo => todo.date === todayKey);
  const openTodos = store.todos.filter(todo => !todo.completed);
  const todaysHabitLogs = store.habits.filter(habit => habit.date === todayKey);
  const searchTerm = searchQuery.trim().toLowerCase();
  const searchResults = searchTerm ? [
    ...store.events
      .filter(event => [
        event.title,
        event.date,
        event.startTime,
        event.endTime,
        event.source,
        roleLabel(event.user),
      ].filter(Boolean).join(' ').toLowerCase().includes(searchTerm))
      .map(event => ({
        id: `event-${event.id}`,
        type: 'Event',
        title: event.title,
        detail: `${formatShortDate(event.date)} · ${event.allDay ? 'All day' : `${event.startTime || 'Any time'}${event.endTime ? `-${event.endTime}` : ''}`} · ${roleLabel(event.user)}`,
        onSelect: () => {
          store.setCurrentDate(new Date(`${event.date}T12:00:00`));
          openEventEditor(event);
        },
      })),
    ...store.todos
      .filter(todo => [
        todo.text,
        todo.date,
        todo.assignee,
        todo.completed ? 'completed' : 'open',
      ].filter(Boolean).join(' ').toLowerCase().includes(searchTerm))
      .map(todo => ({
        id: `todo-${todo.id}`,
        type: 'To-Do',
        title: todo.text,
        detail: `${todo.date ? formatShortDate(todo.date) : 'Flexible'} · ${todo.assignee === 'both' ? 'Shared' : todo.assignee === 'him' ? store.userNames.him : store.userNames.her} · ${todo.completed ? 'Completed' : 'Open'}`,
        onSelect: () => {
          if (todo.date) store.setCurrentDate(new Date(`${todo.date}T12:00:00`));
          setRightTab('todos');
        },
      })),
    ...store.messages
      .filter(message => [
        message.content,
        message.category,
        message.from === 'him' ? store.userNames.him : store.userNames.her,
      ].join(' ').toLowerCase().includes(searchTerm))
      .map(message => ({
        id: `message-${message.id}`,
        type: 'Inbox',
        title: message.content,
        detail: `${message.category} · ${message.from === 'him' ? store.userNames.him : store.userNames.her}`,
        onSelect: () => setRightTab('inbox'),
      })),
  ] : [];

  if (auth.isConfigured && (auth.loading || (auth.session && store.loading))) {
    return (
      <div className="h-screen w-screen bg-[#f7f9fb] flex items-center justify-center font-sans text-sm text-[#72787c]">
        Loading CoupleSync...
      </div>
    );
  }

  if (auth.isConfigured && !auth.session) {
    return (
      <AuthScreen 
        loading={auth.loading}
        error={auth.error}
        signInWithGitHub={auth.signInWithGitHub}
      />
    );
  }

  if (auth.isConfigured && auth.session && store.setupRequired) {
    return (
      <CoupleSetup
        loading={store.setupLoading}
        error={store.error}
        createCouple={store.createCouple}
        joinCouple={store.joinCouple}
        signOut={auth.signOut}
      />
    );
  }

  return (
    <div data-theme={theme} className="h-screen w-screen bg-[#f7f9fb] flex flex-col font-sans overflow-hidden">
      
      <TopNav 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        userNames={store.userNames} 
        openSettings={() => setSettingsOpen(true)}
        onOpenSearch={() => {
          setSearchOpen(true);
          setNotificationsOpen(false);
        }}
        onOpenNotifications={() => {
          setNotificationsOpen(previous => !previous);
          setSearchOpen(false);
        }}
        onSignOut={auth.session ? auth.signOut : undefined}
      />

      {notificationsOpen && (
        <div className="fixed right-4 md:right-6 top-20 z-40 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-white/70 bg-white/95 backdrop-blur-md shadow-lg p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-display font-semibold text-[#191c1e]">Today</h2>
              <p className="text-xs text-[#72787c]">{formatShortDate(todayKey)} · {auth.isConfigured ? 'Supabase mode' : 'Demo mode'}</p>
            </div>
            <button onClick={() => setNotificationsOpen(false)} className="rounded-md px-2 py-1 text-xs font-semibold text-[#72787c] hover:bg-black/5 transition-colors">
              Close
            </button>
          </div>
          <div className="space-y-2">
            <div className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#a0a5a9] mb-2">Calendar</div>
              {todayEvents.length > 0 ? todayEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => {
                    openEventEditor(event);
                    setNotificationsOpen(false);
                  }}
                  className="block w-full text-left rounded-lg px-2 py-1.5 text-sm text-[#42474c] hover:bg-[#446172]/10"
                >
                  <span className="font-medium text-[#191c1e]">{event.title}</span>
                  <span className="block text-xs text-[#72787c]">{event.allDay ? 'All day' : event.startTime || 'Any time'} · {roleLabel(event.user)}</span>
                </button>
              )) : <p className="text-sm text-[#72787c]">No events today.</p>}
            </div>
            <div className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#a0a5a9] mb-2">To-Dos</div>
              <p className="text-sm text-[#42474c]">{todayTodos.length} scheduled today · {openTodos.length} open overall</p>
            </div>
            <div className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#a0a5a9] mb-2">Habits</div>
              <p className="text-sm text-[#42474c]">{todaysHabitLogs.length} logged today</p>
            </div>
          </div>
        </div>
      )}

      {store.error && (
        <div className="mx-4 md:mx-6 mt-3 rounded-xl border border-[#f0d8d8] bg-[#fff7f7] px-4 py-3 text-sm text-[#8f3d3d] flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Sync issue</p>
            <p className="mt-0.5 break-words">{store.error}</p>
          </div>
          <button
            onClick={store.clearError}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-[#8f3d3d] hover:bg-[#8f3d3d]/10 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Layers) */}
        <Sidebar 
          layers={store.layers}
          activeLayers={store.activeLayers}
          toggleLayer={store.toggleLayer}
          toggleAll={store.toggleAllLayers}
          isOpen={leftOpen}
          setIsOpen={setLeftOpen}
          userNames={store.userNames}
          createCustomLayer={store.createCustomLayer}
          habitDefinitions={store.habitDefinitions}
          createHabitDefinition={store.createHabitDefinition}
          todos={store.todos}
          currentUserRole={currentUserRole}
          addNewTodo={store.addNewTodo}
          toggleTodo={store.toggleTodo}
          deleteTodo={deleteTodoWithUndo}
          workspace={store.workspace}
          isBackendConfigured={auth.isConfigured}
          calendarConnections={store.calendarConnections}
          calendarActionLoading={store.calendarActionLoading}
          connectGoogleCalendar={store.startGoogleCalendarConnect}
          syncGoogleCalendar={store.syncGoogleCalendar}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-[#f7f9fb] rounded-tl-3xl shadow-[-10px_-10px_30px_rgba(0,0,0,0.01)] relative z-10 ml-[-4px]">
          <Calendar 
            currentDate={store.currentDate} 
            setCurrentDate={store.setCurrentDate}
            todos={store.todos}
            toggleTodo={store.toggleTodo}
            habits={store.habits}
            habitDefinitions={store.habitDefinitions}
            events={store.events}
            layers={store.layers}
            activeLayers={store.activeLayers}
            viewMode={viewMode}
            currentUserRole={currentUserRole}
            userNames={store.userNames}
            onTodoDropToDate={store.assignTodoToDate}
            onMessageDropToDate={scheduleMessageOnDate}
            addHabitLog={store.addHabitLog}
            openEventDialog={openEventDialog}
            openEventEditor={openEventEditor}
          />
        </main>

        {/* Right Sidebar (Inbox & ToDos via Tab or Stack) */}
        <RightPanel 
          isOpen={rightOpen}
          setIsOpen={setRightOpen}
          messages={store.messages}
          todos={store.todos}
          activeTab={rightTab}
          setActiveTab={setRightTab}
          addEventFromMessage={openScheduleDialog}
          addInboxMessage={store.addInboxMessage}
          addNewTodo={store.addNewTodo}
          assignTodoToDate={store.assignTodoToDate}
          unassignTodoFromDate={store.unassignTodoFromDate}
          replyToMessage={store.replyToMessage}
          toggleTodo={store.toggleTodo}
          deleteTodo={deleteTodoWithUndo}
          deleteInboxMessage={deleteMessageWithUndo}
          userNames={store.userNames}
        />

      </div>

      {settingsOpen && (
        <SettingsModal
          userNames={store.userNames}
          workspace={store.workspace}
          layers={store.layers}
          habitDefinitions={store.habitDefinitions}
          theme={theme}
          setTheme={setTheme}
          changeNames={names => void store.changeNames(names)}
          updateLayerColor={store.updateLayerColor}
          updateHabitDefinition={store.updateHabitDefinition}
          openChangelog={() => setChangelogOpen(true)}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {changelogOpen && (
        <ChangelogModal onClose={() => setChangelogOpen(false)} />
      )}

      {messageToSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191c1e]/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white shadow-lg p-5">
            <h2 className="text-xl font-display font-semibold text-[#191c1e] mb-1">Schedule Message</h2>
            <p className="text-sm text-[#42474c] mb-5 line-clamp-2">{messageToSchedule.content}</p>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">Date</span>
                <input
                  type="date"
                  value={scheduleDraft.date}
                  onChange={event => setScheduleDraft(previous => ({ ...previous, date: event.target.value }))}
                  className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">Start</span>
                  <input
                    type="time"
                    value={scheduleDraft.startTime}
                    onChange={event => setScheduleDraft(previous => ({ ...previous, startTime: event.target.value }))}
                    className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">End</span>
                  <input
                    type="time"
                    value={scheduleDraft.endTime}
                    onChange={event => setScheduleDraft(previous => ({ ...previous, endTime: event.target.value }))}
                    className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">Owner</span>
                  <select
                    value={eventDraft.owner}
                    onChange={event => setEventDraft(previous => ({ ...previous, owner: event.target.value as 'both' | 'him' | 'her' }))}
                    className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                  >
                    <option value="both">Shared</option>
                    <option value="him">{store.userNames.him}</option>
                    <option value="her">{store.userNames.her}</option>
                  </select>
                  <span className="mt-1 block text-[10px] text-[#a0a5a9]">Controls default schedule color and filtering when no layer is selected.</span>
                </label>
                <label className="block">
                  <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">Layer</span>
                  <select
                    value={eventDraft.layerId}
                    onChange={event => setEventDraft(previous => ({ ...previous, layerId: event.target.value }))}
                    className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                  >
                    <option value="">Default</option>
                    {store.layers.filter(layer => layer.type === 'schedule' || layer.type === 'custom').map(layer => (
                      <option key={layer.id} value={layer.databaseId || layer.id}>
                        {layer.id === 'him_schedule' ? `${store.userNames.him}'s Schedule` : layer.id === 'her_schedule' ? `${store.userNames.her}'s Schedule` : layer.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setMessageToSchedule(null)} className="h-9 rounded-lg px-3 text-sm font-medium text-[#72787c] hover:bg-black/5 transition-colors">Cancel</button>
              <button onClick={saveScheduledMessage} className="h-9 rounded-lg bg-[#446172] px-4 text-sm font-semibold text-white hover:bg-[#446172]/90 transition-colors">Create Event</button>
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#191c1e]/20 backdrop-blur-sm p-4 pt-20">
          <div className="w-full max-w-xl rounded-2xl border border-white/70 bg-white shadow-lg p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-display font-semibold text-[#191c1e]">Search CoupleSync</h2>
                <p className="text-xs text-[#72787c] mt-0.5">Find events, tasks, and inbox notes.</p>
              </div>
              <button onClick={() => setSearchOpen(false)} className="h-8 rounded-lg px-3 text-xs font-semibold text-[#72787c] hover:bg-black/5 transition-colors">
                Close
              </button>
            </div>
            <input
              autoFocus
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              className="w-full h-11 rounded-xl border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
              placeholder="Search events, todos, messages..."
            />
            <div className="mt-4 max-h-[50vh] overflow-y-auto no-scrollbar space-y-2">
              {!searchTerm && (
                <div className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-4 text-sm text-[#72787c]">
                  Type a keyword to search across your calendar data.
                </div>
              )}
              {searchTerm && searchResults.length === 0 && (
                <div className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-4 text-sm text-[#72787c]">
                  No matching events, tasks, or messages.
                </div>
              )}
              {searchResults.map(result => (
                <button
                  key={result.id}
                  onClick={() => {
                    result.onSelect();
                    setSearchOpen(false);
                  }}
                  className="w-full rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-3 text-left hover:border-[#446172]/30 hover:bg-[#446172]/5 transition-colors"
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#a0a5a9]">{result.type}</span>
                  <span className="block mt-1 text-sm font-semibold text-[#191c1e] line-clamp-1">{result.title}</span>
                  <span className="block mt-0.5 text-xs text-[#72787c] line-clamp-1">{result.detail}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {creatingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191c1e]/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white shadow-lg p-5">
            <h2 className="text-xl font-display font-semibold text-[#191c1e] mb-1">{editingEventId ? 'Edit Event' : 'New Event'}</h2>
            <p className="text-xs text-[#72787c] mb-5">{editingEventId ? 'Update the calendar event details.' : 'Create a shared calendar event.'}</p>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">Title</span>
                <input
                  value={eventDraft.title}
                  onChange={event => setEventDraft(previous => ({ ...previous, title: event.target.value }))}
                  className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                  placeholder="Dinner date, class, call..."
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">Date</span>
                <input
                  type="date"
                  value={eventDraft.date}
                  onChange={event => setEventDraft(previous => ({ ...previous, date: event.target.value }))}
                  className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                />
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 py-2 text-sm text-[#42474c]">
                <input
                  type="checkbox"
                  checked={eventDraft.allDay}
                  onChange={event => setEventDraft(previous => ({ ...previous, allDay: event.target.checked }))}
                  className="h-4 w-4 accent-[#446172]"
                />
                <span>All-day event</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">Start</span>
                  <input
                    type="time"
                    value={eventDraft.startTime}
                    disabled={eventDraft.allDay}
                    onChange={event => setEventDraft(previous => ({ ...previous, startTime: event.target.value }))}
                    className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172] disabled:text-[#a0a5a9] disabled:bg-[#f1f3f4]"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">End</span>
                  <input
                    type="time"
                    value={eventDraft.endTime}
                    disabled={eventDraft.allDay}
                    onChange={event => setEventDraft(previous => ({ ...previous, endTime: event.target.value }))}
                    className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172] disabled:text-[#a0a5a9] disabled:bg-[#f1f3f4]"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">Owner</span>
                  <select
                    value={eventDraft.owner}
                    onChange={event => setEventDraft(previous => ({ ...previous, owner: event.target.value as 'both' | 'him' | 'her' }))}
                    className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                  >
                    <option value="both">Shared</option>
                    <option value="him">{store.userNames.him}</option>
                    <option value="her">{store.userNames.her}</option>
                  </select>
                  <span className="mt-1 block text-[10px] text-[#a0a5a9]">Controls default schedule color and filtering when no layer is selected.</span>
                </label>
                <label className="block">
                  <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">Layer</span>
                  <select
                    value={eventDraft.layerId}
                    onChange={event => setEventDraft(previous => ({ ...previous, layerId: event.target.value }))}
                    className="w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                  >
                    <option value="">Default</option>
                    {store.layers.filter(layer => layer.type === 'schedule' || layer.type === 'custom').map(layer => (
                      <option key={layer.id} value={layer.databaseId || layer.id}>
                        {layer.id === 'him_schedule' ? `${store.userNames.him}'s Schedule` : layer.id === 'her_schedule' ? `${store.userNames.her}'s Schedule` : layer.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="flex justify-between gap-2 mt-5">
              {editingEventId ? (
                <button onClick={deleteEditingEvent} className="h-9 rounded-lg px-3 text-sm font-semibold text-[#a65d5d] hover:bg-[#a65d5d]/10 transition-colors">Delete</button>
              ) : <span />}
              <div className="flex justify-end gap-2">
              <button onClick={() => {
                setCreatingEvent(false);
                setEditingEventId(null);
              }} className="h-9 rounded-lg px-3 text-sm font-medium text-[#72787c] hover:bg-black/5 transition-colors">Cancel</button>
              <button onClick={saveEvent} className="h-9 rounded-lg bg-[#446172] px-4 text-sm font-semibold text-white hover:bg-[#446172]/90 transition-colors">{editingEventId ? 'Save Event' : 'Create Event'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {undoMessage && (
        <div className="fixed bottom-5 left-1/2 z-50 flex w-[min(360px,calc(100vw-2rem))] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-white/60 bg-[#191c1e] px-4 py-3 text-sm text-white shadow-lg">
          <span>{undoMessage}</span>
          <button
            onClick={() => {
              undoActionRef.current?.();
              undoActionRef.current = null;
              setUndoMessage(null);
              if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
            }}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-[#c8e6d9] hover:bg-white/10 transition-colors"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
