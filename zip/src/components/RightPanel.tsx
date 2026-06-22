import { useState } from 'react';
import { useEffect } from 'react';
import { HabitRecord, Message, MessageCategory, RightPanelTab, ToDo, User, UserNames, WeatherLocation } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { PanelRightClose, MessageSquareShare, Reply, CalendarPlus, Plus, Calendar as CalendarIcon, Check, CheckSquare, Send, Undo2, Trash2, X } from 'lucide-react';
import { Activity, LocateFixed, MapPin, Pencil, RefreshCw } from 'lucide-react';
import { setCalendarDragData } from '../lib/calendarDrag';
import { describeWeatherCode, fetchWeatherForecast, geocodeCity, WeatherForecast } from '../lib/weather';

interface RightPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: Message[];
  todos: ToDo[];
  habits: HabitRecord[];
  activeTab: RightPanelTab;
  setActiveTab: (tab: RightPanelTab) => void;
  addEventFromMessage: (message: Message) => void;
  addInboxMessage: (content: string, category: MessageCategory) => void;
  addNewTodo: (assignee: User | 'both', text: string) => void;
  assignTodoToDate: (todoId: string, date: string) => void;
  unassignTodoFromDate: (todoId: string) => void;
  replyToMessage: (messageId: string, content: string) => void;
  toggleTodo: (todoId: string) => void;
  updateTodoText: (todoId: string, text: string) => void;
  deleteTodo: (todoId: string) => void;
  deleteInboxMessage: (messageId: string) => void;
  currentUserRole: User;
  isBackendConfigured: boolean;
  profileLocationFieldsReady: boolean;
  profileLocations: Record<User, WeatherLocation | null>;
  updateWeatherLocation: (location: WeatherLocation) => Promise<{ ok: boolean; error?: string }>;
  userNames: UserNames;
}

const PANEL_TABS: { id: RightPanelTab; label: string; title: string; Icon: typeof MessageSquareShare }[] = [
  { id: 'inbox', label: 'Inbox', title: 'Couple Inbox', Icon: MessageSquareShare },
  { id: 'todos', label: 'To-Dos', title: 'To-Do Box', Icon: CheckSquare },
  { id: 'status', label: 'Status', title: '个人状况', Icon: Activity },
];

const MESSAGE_CATEGORY_OPTIONS: { value: MessageCategory; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'plan', label: 'Plan' },
  { value: 'love', label: 'Love' },
  { value: 'mood', label: 'Mood' },
];

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
const PARTNER_ROLES: User[] = ['him', 'her'];

function getMessageCategoryLabel(category: MessageCategory) {
  return MESSAGE_CATEGORY_OPTIONS.find(option => option.value === category)?.label ?? category;
}

function getRecentDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return {
      key: format(date, 'yyyy-MM-dd'),
      label: WEEKDAY_LABELS[date.getDay()],
    };
  });
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 300000,
      timeout: 10000,
    });
  });
}

export function RightPanel({ isOpen, setIsOpen, messages, todos, habits, activeTab, setActiveTab, addEventFromMessage, addInboxMessage, addNewTodo, assignTodoToDate, unassignTodoFromDate, replyToMessage, toggleTodo, updateTodoText, deleteTodo, deleteInboxMessage, currentUserRole, isBackendConfigured, profileLocationFieldsReady, profileLocations, updateWeatherLocation, userNames }: RightPanelProps) {
  const [todoFilter, setTodoFilter] = useState<'all' | 'him' | 'her'>('all');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState<MessageCategory>('idea');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [todoText, setTodoText] = useState('');
  const [todoAssignee, setTodoAssignee] = useState<User | 'both'>('both');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState('');
  const [cityDraft, setCityDraft] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSaving, setLocationSaving] = useState<'city' | 'browser' | null>(null);
  const [weatherByRole, setWeatherByRole] = useState<Partial<Record<User, WeatherForecast>>>({});
  const [weatherErrors, setWeatherErrors] = useState<Partial<Record<User, string>>>({});
  const [weatherLoadingRoles, setWeatherLoadingRoles] = useState<User[]>([]);
  const recentDays = getRecentDays();
  const recentDayKeys = new Set(recentDays.map(day => day.key));
  const locationSignature = PARTNER_ROLES
    .map(role => {
      const location = profileLocations[role];
      return `${role}:${location?.latitude ?? ''}:${location?.longitude ?? ''}`;
    })
    .join('|');

  useEffect(() => {
    let cancelled = false;

    PARTNER_ROLES.forEach(role => {
      const location = profileLocations[role];
      if (location?.latitude == null || location.longitude == null) {
        setWeatherByRole(previous => {
          const next = { ...previous };
          delete next[role];
          return next;
        });
        return;
      }

      setWeatherLoadingRoles(previous => previous.includes(role) ? previous : [...previous, role]);
      setWeatherErrors(previous => ({ ...previous, [role]: undefined }));

      fetchWeatherForecast(location)
        .then(forecast => {
          if (cancelled) return;
          setWeatherByRole(previous => ({ ...previous, [role]: forecast }));
        })
        .catch(caught => {
          if (cancelled) return;
          setWeatherErrors(previous => ({
            ...previous,
            [role]: caught instanceof Error ? caught.message : '天气加载失败',
          }));
        })
        .finally(() => {
          if (cancelled) return;
          setWeatherLoadingRoles(previous => previous.filter(item => item !== role));
        });
    });

    return () => {
      cancelled = true;
    };
  }, [locationSignature, profileLocations]);

  const openTab = (tab: RightPanelTab) => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  const saveCityLocation = async () => {
    if (!cityDraft.trim()) return;
    setLocationSaving('city');
    setLocationError(null);
    try {
      const location = await geocodeCity(cityDraft);
      const result = await updateWeatherLocation(location);
      if (!result.ok) {
        setLocationError(result.error || '位置保存失败');
        return;
      }
      setCityDraft('');
    } catch (caught) {
      setLocationError(caught instanceof Error ? caught.message : '位置保存失败');
    } finally {
      setLocationSaving(null);
    }
  };

  const saveBrowserLocation = async () => {
    setLocationSaving('browser');
    setLocationError(null);
    try {
      if (!navigator.geolocation) throw new Error('当前浏览器不支持定位授权');
      const position = await getCurrentPosition();
      const result = await updateWeatherLocation({
        city: '当前位置',
        country: null,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        updatedAt: new Date().toISOString(),
      });
      if (!result.ok) {
        setLocationError(result.error || '位置保存失败');
      }
    } catch (caught) {
      setLocationError(caught instanceof Error ? caught.message : '无法获取当前位置');
    } finally {
      setLocationSaving(null);
    }
  };

  if (!isOpen) {
    return (
      <div className="w-16 h-full flex flex-col items-center py-6 border-l border-[#eceef0] bg-[#f7f9fb]/50 shrink-0">
        <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-black/5 rounded-full mb-8" title="Expand Right Panel">
          <PanelRightClose className="w-5 h-5 text-[#446172] transform rotate-180" />
        </button>
        <div className="space-y-6">
          {PANEL_TABS.map(({ id, title, Icon }) => (
            <button
              key={id}
              onClick={() => openTab(id)}
              className="p-2 rounded-full text-[#72787c] hover:bg-black/5 hover:text-[#446172] transition-colors"
              title={title}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const submitMessage = () => {
    if (!newMessage.trim()) return;
    addInboxMessage(newMessage, newCategory);
    setNewMessage('');
  };

  const submitReply = (messageId: string) => {
    if (!replyText.trim()) return;
    replyToMessage(messageId, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const submitTodo = () => {
    if (!todoText.trim()) return;
    addNewTodo(todoAssignee, todoText);
    setTodoText('');
  };

  const startTodoEdit = (todo: ToDo) => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  };

  const cancelTodoEdit = () => {
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  const saveTodoEdit = () => {
    if (!editingTodoId || !editingTodoText.trim()) return;
    updateTodoText(editingTodoId, editingTodoText);
    cancelTodoEdit();
  };

  const matchesTodoFilter = (todo: ToDo) => {
     if (todoFilter === 'all') return true;
     return todo.assignee === todoFilter || todo.assignee === 'both';
  };

  const flexibleTodos = todos.filter(todo => !todo.date).filter(matchesTodoFilter);
  const scheduledTodos = todos.filter(todo => todo.date).filter(matchesTodoFilter);

  const formatTodoDate = (date: string) => format(new Date(`${date}T00:00:00`), 'MMM d');
  const activeTabConfig = PANEL_TABS.find(tab => tab.id === activeTab) ?? PANEL_TABS[0];
  const ActiveIcon = activeTabConfig.Icon;

  return (
    <aside className="fixed md:static right-0 top-0 z-40 w-[min(320px,calc(100vw-3rem))] md:w-[320px] h-full flex flex-col bg-[#f5f7f9]/95 md:bg-[#f5f7f9] backdrop-blur-md md:backdrop-blur-0 border-l border-[#eceef0] shrink-0 p-6 shadow-2xl md:shadow-[-10px_0_30px_rgba(0,0,0,0.02)] md:relative">
      
      <button 
        onClick={() => setIsOpen(false)} 
        className="absolute left-3 top-6 p-2 hover:bg-black/5 rounded-full text-[#72787c] transition-colors"
        title="Collapse Panel"
      >
        <PanelRightClose className="w-5 h-5" />
      </button>

      <div className="absolute left-3 top-[92px] flex flex-col gap-6">
        {PANEL_TABS.map(({ id, title, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "p-2 rounded-full transition-colors",
              activeTab === id ? "bg-[#446172]/10 text-[#446172]" : "text-[#72787c] hover:bg-black/5 hover:text-[#446172]",
            )}
            title={title}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      <div className="flex items-start justify-between mb-2 pl-8">
        <div className="flex items-center gap-2">
          <ActiveIcon className="w-5 h-5 text-[#446172]" />
          <h2 className="text-xl font-display font-semibold text-[#191c1e]">
            {activeTabConfig.title}
          </h2>
        </div>
      </div>
      
      {activeTab === 'inbox' && (
        <p className="text-xs text-[#72787c] italic mb-6 pl-8">Share notes or drag to schedule</p>
      )}
      {activeTab === 'status' && (
        <p className="text-xs text-[#72787c] italic mb-6 pl-8">最近 7 天打卡和双方天气</p>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 mt-4 p-1 bg-white/50 rounded-lg border border-[#eceef0]">
        {PANEL_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn("flex-1 text-xs py-1.5 font-medium rounded-md transition-colors", activeTab === id ? "bg-white shadow-sm text-[#191c1e]" : "text-[#72787c]")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
        {activeTab === 'status' && (
          <div className="space-y-4">
            {PARTNER_ROLES.map(role => {
              const roleLogs = habits.filter(log => log.user === role && recentDayKeys.has(log.date));
              const location = profileLocations[role];
              const weather = weatherByRole[role];
              const isWeatherLoading = weatherLoadingRoles.includes(role);
              const weatherError = weatherErrors[role];

              return (
                <section key={role} className="rounded-xl border border-[#eceef0] bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#191c1e]">{userNames[role]}</h3>
                      <p className="mt-0.5 text-xs text-[#72787c]">最近 7 天打卡</p>
                    </div>
                    <div className="rounded-lg bg-[#446172]/10 px-2.5 py-1 text-right">
                      <div className="text-lg font-semibold leading-none text-[#446172]">{roleLogs.length}</div>
                      <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#72787c]">次</div>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-7 gap-1.5">
                    {recentDays.map(day => {
                      const count = roleLogs.filter(log => log.date === day.key).length;
                      return (
                        <div key={day.key} className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-medium text-[#a0a5a9]">{day.label}</span>
                          <span
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold",
                              count > 0 ? "border-[#8cb3a1] bg-[#c8e6d9] text-[#476456]" : "border-[#eceef0] bg-[#fbfcfd] text-[#c2c7cc]",
                            )}
                            title={`${day.key}: ${count} 次`}
                          >
                            {count > 0 ? count : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-lg border border-[#eceef0] bg-[#fbfcfd] p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#42474c]">
                      <MapPin className="h-3.5 w-3.5 text-[#446172]" />
                      <span>{location ? `${location.city}${location.country ? ` · ${location.country}` : ''}` : '未设置天气位置'}</span>
                    </div>
                    {!location && (
                      <p className="text-xs leading-relaxed text-[#a0a5a9]">
                        {role === currentUserRole ? '在下方设置你的城市或使用当前位置。' : '等待对方设置位置后显示天气。'}
                      </p>
                    )}
                    {location && isWeatherLoading && (
                      <div className="flex items-center gap-2 text-xs text-[#72787c]">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        正在加载天气
                      </div>
                    )}
                    {location && weatherError && !isWeatherLoading && (
                      <p className="text-xs text-[#a65d5d]">{weatherError}</p>
                    )}
                    {location && weather && !isWeatherLoading && (
                      <div className="space-y-3">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <div className="text-2xl font-semibold leading-none text-[#191c1e]">{weather.currentTemperature}°</div>
                            <div className="mt-1 text-xs text-[#72787c]">{describeWeatherCode(weather.currentWeatherCode)}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            {weather.days.map(day => (
                              <div key={day.date} className="rounded-md bg-white px-1.5 py-1">
                                <div className="text-[9px] text-[#a0a5a9]">{format(new Date(`${day.date}T00:00:00`), 'M/d')}</div>
                                <div className="mt-0.5 text-[10px] font-semibold text-[#42474c]">{day.min}°/{day.max}°</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}

            <section className="rounded-xl border border-[#eceef0] bg-white p-4 shadow-sm">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-[#191c1e]">我的天气位置</h3>
                <p className="mt-0.5 text-xs text-[#72787c]">保存到你的 profile，对方也能看到你的天气。</p>
              </div>

              {!isBackendConfigured && (
                <p className="mb-3 rounded-lg bg-[#f7f9fb] px-2.5 py-2 text-xs text-[#72787c]">
                  当前是 Demo 模式，位置只会临时保存在本地状态里。
                </p>
              )}
              {isBackendConfigured && !profileLocationFieldsReady && (
                <p className="mb-3 rounded-lg bg-[#fff7f7] px-2.5 py-2 text-xs text-[#8f3d3d]">
                  需要先在 Supabase SQL Editor 运行天气位置 migration，才能保存城市。
                </p>
              )}
              {locationError && (
                <p className="mb-3 rounded-lg bg-[#fff7f7] px-2.5 py-2 text-xs text-[#8f3d3d]">{locationError}</p>
              )}

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={cityDraft}
                    onChange={event => setCityDraft(event.target.value)}
                    className="min-w-0 flex-1 h-9 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                    placeholder="输入城市，例如 London"
                  />
                  <button
                    onClick={saveCityLocation}
                    disabled={Boolean(locationSaving) || (isBackendConfigured && !profileLocationFieldsReady)}
                    className="h-9 rounded-lg bg-[#446172]/10 px-3 text-xs font-semibold text-[#446172] hover:bg-[#446172]/20 transition-colors disabled:opacity-50"
                  >
                    保存
                  </button>
                </div>
                <button
                  onClick={saveBrowserLocation}
                  disabled={Boolean(locationSaving) || (isBackendConfigured && !profileLocationFieldsReady)}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#eceef0] bg-[#fbfcfd] text-xs font-semibold text-[#42474c] hover:bg-white transition-colors disabled:opacity-50"
                >
                  {locationSaving === 'browser' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
                  使用当前位置
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'inbox' && (
          <div className="bg-white p-3 rounded-xl shadow-sm border border-[#eceef0] space-y-3">
            <textarea
              value={newMessage}
              onChange={event => setNewMessage(event.target.value)}
              rows={3}
              placeholder="Write an idea, plan, mood, or note..."
              className="w-full resize-none rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 py-2 text-sm outline-none focus:border-[#446172]"
            />
            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={event => setNewCategory(event.target.value as MessageCategory)}
                className="h-8 rounded-md border border-[#eceef0] bg-white px-2 text-xs text-[#42474c] outline-none"
              >
                {MESSAGE_CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button
                onClick={submitMessage}
                className="ml-auto h-8 rounded-md bg-[#446172] px-3 text-xs font-semibold text-white flex items-center gap-1.5 hover:bg-[#446172]/90 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        )}

        {activeTab === 'inbox' && messages.map(msg => (
          <div
            key={msg.id}
            draggable
            onDragStart={event => setCalendarDragData(event, { type: 'message', id: msg.id })}
            className="bg-white p-4 rounded-xl shadow-sm border border-[#eceef0] cursor-grab active:cursor-grabbing"
          >
            <div className="flex justify-between items-center gap-2 mb-2">
              <div className="min-w-0 flex flex-1 items-center gap-2">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white", msg.from === 'him' ? "bg-[#446172]" : "bg-[#8cb3a1]")}>
                  {msg.from === 'him' ? userNames.him.charAt(0) : userNames.her.charAt(0)}
                </div>
                <span className="min-w-0 truncate text-xs font-semibold capitalize">{msg.from === 'him' ? userNames.him : userNames.her}</span>
                <span className="shrink-0 rounded-full bg-[#446172]/10 px-2 py-0.5 text-[10px] font-semibold text-[#446172]">
                  {getMessageCategoryLabel(msg.category)}
                </span>
              </div>
              <span className="shrink-0 text-[10px] text-[#a0a5a9]">
                {msg.timestamp.includes('ago') ? msg.timestamp : format(new Date(msg.timestamp), 'MMM d, h:mm a')}
              </span>
            </div>
            <p className="text-sm text-[#191c1e] mb-3">{msg.content}</p>
            {msg.replies && msg.replies.length > 0 && (
              <div className="space-y-2 mb-3 border-l-2 border-[#eceef0] pl-3">
                {msg.replies.map(reply => (
                  <div key={reply.id} className="text-xs">
                    <div className="flex items-center justify-between gap-2 text-[#72787c] mb-0.5">
                      <span className="font-semibold">{reply.from === 'him' ? userNames.him : userNames.her}</span>
                      <span className="text-[10px]">{format(new Date(reply.timestamp), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="text-[#42474c]">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 text-[#72787c]">
              <button onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)} className="flex items-center gap-1 text-xs font-medium hover:text-[#446172] transition-colors line-clamp-1">
                <Reply className="w-3.5 h-3.5" /> 回复
              </button>
              <button onClick={() => addEventFromMessage(msg)} className="flex items-center gap-1 text-xs font-medium hover:text-[#446172] transition-colors line-clamp-1">
                <CalendarPlus className="w-3.5 h-3.5" /> 转化为日程
              </button>
              <button onClick={() => deleteInboxMessage(msg.id)} className="ml-auto flex items-center gap-1 text-xs font-medium text-[#a65d5d] hover:bg-[#a65d5d]/10 px-1.5 py-0.5 rounded transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> 删除
              </button>
            </div>
            {replyingTo === msg.id && (
              <div className="mt-3 flex gap-2">
                <input
                  value={replyText}
                  onChange={event => setReplyText(event.target.value)}
                  className="min-w-0 flex-1 h-8 rounded-md border border-[#eceef0] bg-[#fbfcfd] px-2 text-xs outline-none focus:border-[#446172]"
                  placeholder="Reply..."
                />
                <button onClick={() => submitReply(msg.id)} className="h-8 rounded-md bg-[#446172] px-2.5 text-xs font-semibold text-white">
                  Send
                </button>
              </div>
            )}
          </div>
        ))}

        {activeTab === 'todos' && (
          <div className="mb-4">
            <div className="flex gap-2 mb-4 bg-[#eceef0]/50 p-1 rounded-md">
              {(['all', 'him', 'her'] as const).map(filterMode => (
                 <button
                    key={filterMode}
                    onClick={() => setTodoFilter(filterMode)}
                    className={cn("flex-1 text-[10px] py-1 font-semibold uppercase tracking-wider rounded transition-colors", todoFilter === filterMode ? "bg-white shadow-sm text-[#446172]" : "text-[#72787c] hover:bg-black/5")}
                 >
                    {filterMode === 'all' ? 'All' : filterMode === 'him' ? userNames.him : userNames.her}
                 </button>
              ))}
            </div>

            <div className="space-y-2 bg-white p-3 rounded-xl border border-[#eceef0] shadow-sm">
              <input
                value={todoText}
                onChange={event => setTodoText(event.target.value)}
                className="w-full h-9 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                placeholder="New flexible task..."
              />
              <div className="flex gap-2">
                <select
                  value={todoAssignee}
                  onChange={event => setTodoAssignee(event.target.value as User | 'both')}
                  className="min-w-0 flex-1 h-8 rounded-md border border-[#eceef0] bg-white px-2 text-xs text-[#42474c] outline-none"
                >
                  <option value="both">Shared</option>
                  <option value="him">{userNames.him}</option>
                  <option value="her">{userNames.her}</option>
                </select>
                <button onClick={submitTodo} className="h-8 rounded-md bg-[#446172]/10 text-[#446172] px-3 text-xs font-semibold hover:bg-[#446172]/20 transition-colors flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'todos' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-[#a0a5a9] uppercase">Flexible</span>
              <span className="text-[10px] text-[#a0a5a9]">{flexibleTodos.length}</span>
            </div>
            {flexibleTodos.map(todo => (
            <div
              key={todo.id}
              draggable={editingTodoId !== todo.id}
              onDragStart={event => setCalendarDragData(event, { type: 'todo', id: todo.id })}
              className={cn("bg-white p-3 rounded-lg shadow-sm border border-[#eceef0] flex items-start gap-2 group", editingTodoId === todo.id ? "cursor-default" : "cursor-grab active:cursor-grabbing")}
            >
               <div className="relative mt-0.5">
                 <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="peer appearance-none w-4 h-4 border border-[#c2c7cc] rounded checked:bg-[#446172] checked:border-[#446172] cursor-pointer" />
                 {todo.completed && <CheckSquare className="w-3 h-3 text-white absolute inset-0 m-auto pointer-events-none" strokeWidth={3} />}
               </div>
               <div className="flex-1 min-w-0">
                 {editingTodoId === todo.id ? (
                   <input
                     value={editingTodoText}
                     onChange={event => setEditingTodoText(event.target.value)}
                     onKeyDown={event => {
                       if (event.key === 'Enter') saveTodoEdit();
                       if (event.key === 'Escape') cancelTodoEdit();
                     }}
                     className="h-8 w-full rounded-md border border-[#eceef0] bg-[#fbfcfd] px-2 text-sm outline-none focus:border-[#446172]"
                     autoFocus
                   />
                 ) : (
                   <p className={cn("text-sm", todo.completed && "line-through text-[#a0a5a9]")}>{todo.text}</p>
                 )}
                 <div className="flex items-center justify-between mt-2">
                   <span className="text-[10px] font-medium text-[#72787c] capitalize px-1.5 py-0.5 bg-black/5 rounded inline-block">
                     {todo.assignee === 'him' ? userNames.him : todo.assignee === 'her' ? userNames.her : 'Shared'}
                   </span>
                   <div className="flex flex-wrap items-center justify-end gap-1">
                     {editingTodoId === todo.id ? (
                       <>
                         <button onClick={cancelTodoEdit} className="text-[10px] flex items-center gap-1 text-[#72787c] hover:bg-black/5 px-1.5 py-0.5 rounded transition-colors">
                           <X className="w-3 h-3" /> Cancel
                         </button>
                         <button onClick={saveTodoEdit} className="text-[10px] flex items-center gap-1 text-[#446172] hover:bg-[#446172]/10 px-1.5 py-0.5 rounded transition-colors">
                           <Check className="w-3 h-3" /> Save
                         </button>
                       </>
                     ) : (
                       <>
                         <button onClick={() => startTodoEdit(todo)} className="text-[10px] flex items-center gap-1 text-[#72787c] opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-[#446172]/10 hover:text-[#446172] px-1.5 py-0.5 rounded transition-all">
                           <Pencil className="w-3 h-3" /> Edit
                         </button>
                         <button onClick={() => assignTodoToDate(todo.id, format(new Date(), 'yyyy-MM-dd'))} className="text-[10px] flex items-center gap-1 text-[#446172] opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-[#446172]/10 px-1.5 py-0.5 rounded transition-all">
                           <CalendarIcon className="w-3 h-3" /> Today
                         </button>
                         <button onClick={() => deleteTodo(todo.id)} className="text-[10px] flex items-center gap-1 text-[#a65d5d] opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-[#a65d5d]/10 px-1.5 py-0.5 rounded transition-all">
                           <Trash2 className="w-3 h-3" /> Delete
                         </button>
                       </>
                     )}
                   </div>
                 </div>
               </div>
            </div>
            ))}
            {flexibleTodos.length === 0 && (
              <div className="rounded-lg bg-white/40 px-3 py-3 text-center text-xs text-[#a0a5a9]">
                No flexible tasks.
              </div>
            )}
          </div>
        )}

        {activeTab === 'todos' && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-[#a0a5a9] uppercase">Scheduled</span>
              <span className="text-[10px] text-[#a0a5a9]">{scheduledTodos.length}</span>
            </div>
            {scheduledTodos.map(todo => (
              <div
                key={todo.id}
                draggable={editingTodoId !== todo.id}
                onDragStart={event => setCalendarDragData(event, { type: 'todo', id: todo.id })}
                className={cn("bg-white p-3 rounded-lg shadow-sm border border-[#eceef0] flex items-start gap-2 group", editingTodoId === todo.id ? "cursor-default" : "cursor-grab active:cursor-grabbing")}
              >
                <div className="relative mt-0.5">
                  <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="peer appearance-none w-4 h-4 border border-[#c2c7cc] rounded checked:bg-[#446172] checked:border-[#446172] cursor-pointer" />
                  {todo.completed && <CheckSquare className="w-3 h-3 text-white absolute inset-0 m-auto pointer-events-none" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  {editingTodoId === todo.id ? (
                    <input
                      value={editingTodoText}
                      onChange={event => setEditingTodoText(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === 'Enter') saveTodoEdit();
                        if (event.key === 'Escape') cancelTodoEdit();
                      }}
                      className="h-8 w-full rounded-md border border-[#eceef0] bg-[#fbfcfd] px-2 text-sm outline-none focus:border-[#446172]"
                      autoFocus
                    />
                  ) : (
                    <p className={cn("text-sm", todo.completed && "line-through text-[#a0a5a9]")}>{todo.text}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-medium text-[#72787c] capitalize px-1.5 py-0.5 bg-black/5 rounded inline-block">
                      {todo.assignee === 'him' ? userNames.him : todo.assignee === 'her' ? userNames.her : 'Shared'}
                    </span>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {editingTodoId === todo.id ? (
                        <>
                          <button onClick={cancelTodoEdit} className="text-[10px] flex items-center gap-1 text-[#72787c] hover:bg-black/5 px-1.5 py-0.5 rounded transition-colors">
                            <X className="w-3 h-3" /> Cancel
                          </button>
                          <button onClick={saveTodoEdit} className="text-[10px] flex items-center gap-1 text-[#446172] hover:bg-[#446172]/10 px-1.5 py-0.5 rounded transition-colors">
                            <Check className="w-3 h-3" /> Save
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startTodoEdit(todo)} className="text-[10px] flex items-center gap-1 text-[#72787c] hover:text-[#446172] hover:bg-[#446172]/10 px-1.5 py-0.5 rounded transition-colors">
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <span className="text-[10px] flex items-center gap-1 text-[#446172] bg-[#446172]/10 px-1.5 py-0.5 rounded">
                            <CalendarIcon className="w-3 h-3" /> {todo.date ? formatTodoDate(todo.date) : ''}
                          </span>
                          <button
                            onClick={() => unassignTodoFromDate(todo.id)}
                            className="text-[10px] flex items-center gap-1 text-[#72787c] hover:text-[#446172] hover:bg-[#446172]/10 px-1.5 py-0.5 rounded transition-colors"
                            title="Move back to flexible list"
                          >
                            <Undo2 className="w-3 h-3" /> Flexible
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-[10px] flex items-center gap-1 text-[#a65d5d] hover:bg-[#a65d5d]/10 px-1.5 py-0.5 rounded transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {scheduledTodos.length === 0 && (
              <div className="rounded-lg bg-white/40 px-3 py-3 text-center text-xs text-[#a0a5a9]">
                No scheduled tasks.
              </div>
            )}
          </div>
        )}
      </div>

    </aside>
  );
}
