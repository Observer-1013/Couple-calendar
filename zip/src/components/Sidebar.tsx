import { useState } from 'react';
import { CalendarConnection, CoupleWorkspace, HabitDefinition, Layer, ToDo, User as UserRole, UserNames } from '../types';
import { cn } from '../lib/utils';
import { User, Heart, CheckCircle2, Plus, MailOpen, Archive, Menu, PanelLeftClose, Copy, Wifi, WifiOff, CalendarSync, ExternalLink, RefreshCw } from 'lucide-react';

interface SidebarProps {
  layers: Layer[];
  activeLayers: string[];
  toggleLayer: (id: string) => void;
  toggleAll: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userNames: UserNames;
  createCustomLayer: (name: string, color: string) => void;
  habitDefinitions: HabitDefinition[];
  createHabitDefinition: (name: string, color: string) => void;
  todos: ToDo[];
  currentUserRole: UserRole;
  addNewTodo: (assignee: UserRole, text: string) => void;
  toggleTodo: (todoId: string) => void;
  workspace: CoupleWorkspace | null;
  isBackendConfigured: boolean;
  calendarConnections: CalendarConnection[];
  calendarActionLoading: boolean;
  connectGoogleCalendar: () => void;
  syncGoogleCalendar: () => void;
}

export function Sidebar({ layers, activeLayers, toggleLayer, toggleAll, isOpen, setIsOpen, userNames, createCustomLayer, habitDefinitions, createHabitDefinition, todos, currentUserRole, addNewTodo, toggleTodo, workspace, isBackendConfigured, calendarConnections, calendarActionLoading, connectGoogleCalendar, syncGoogleCalendar }: SidebarProps) {
  const isAllVisible = activeLayers.length === layers.length;
  const [isCreating, setIsCreating] = useState(false);
  const [layerName, setLayerName] = useState('');
  const [layerColor, setLayerColor] = useState('#c8e6d9');
  const [habitName, setHabitName] = useState('');
  const [habitColor, setHabitColor] = useState('#4ade80');
  const [personalTaskText, setPersonalTaskText] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);

  const personalTodos = todos.filter(todo => !todo.date && todo.assignee === currentUserRole);
  const currentUserName = currentUserRole === 'him' ? userNames.him : userNames.her;
  const statusLabel = isBackendConfigured ? 'Supabase connected' : 'Demo mode';
  const WorkspaceStatusIcon = isBackendConfigured ? Wifi : WifiOff;
  const googleConnection = calendarConnections.find(connection => connection.provider === 'google');
  const googleStatus = googleConnection
    ? googleConnection.syncStatus === 'error'
      ? 'Error'
      : googleConnection.lastSyncedAt
        ? 'Synced'
        : 'Connected'
    : 'Not connected';
  const googleLastSynced = googleConnection?.lastSyncedAt
    ? new Date(googleConnection.lastSyncedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

  const copyInviteCode = async () => {
    if (!workspace?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(workspace.inviteCode);
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 1400);
    } catch {
      setCopiedInvite(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="w-16 h-full flex flex-col items-center py-6 border-r border-[#eceef0] bg-[#f7f9fb]/50 shrink-0">
        <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-black/5 rounded-full mb-8" title="Expand Sidebar">
          <Menu className="w-5 h-5 text-[#446172]" />
        </button>
        <div className="space-y-6">
          <User className="w-5 h-5 text-[#72787c]" />
          <Heart className="w-5 h-5 text-[#72787c]" />
          <CheckCircle2 className="w-5 h-5 text-[#72787c]" />
          <CalendarSync className="w-5 h-5 text-[#72787c]" />
        </div>
      </div>
    );
  }

  const getLayerName = (layer: Layer) => {
    if (layer.id === 'him_schedule') return `${userNames.him}'s Schedule`;
    if (layer.id === 'her_schedule') return `${userNames.her}'s Schedule`;
    return layer.name;
  };

  return (
    <aside className="w-[280px] h-full flex flex-col bg-[#f7f9fb]/50 border-r border-[#eceef0] shrink-0 overflow-y-auto no-scrollbar relative">
      <button 
        onClick={() => setIsOpen(false)} 
        className="absolute right-4 top-6 p-1.5 hover:bg-black/5 rounded-md text-[#72787c] transition-colors"
        title="Collapse Sidebar"
      >
        <PanelLeftClose className="w-4 h-4" />
      </button>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#446172] text-white flex items-center justify-center font-display font-medium shadow-sm">
            U
          </div>
          <div className="pr-6">
            <h2 className="text-xl font-display font-semibold text-[#191c1e] tracking-tight hover:text-[#446172] transition-colors cursor-pointer" onClick={() => setIsOpen(false)}>Our Layers</h2>
            <p className="text-xs text-[#72787c]">Manage visibility</p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-[#eceef0] bg-white/60 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#42474c]">
            <WorkspaceStatusIcon className="w-3.5 h-3.5 text-[#446172]" />
            <span>{statusLabel}</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-[#191c1e] truncate">
            {workspace?.coupleName || 'Local Demo Workspace'}
          </div>
          <div className="mt-1 text-[11px] text-[#72787c]">
            Role: {currentUserRole === 'him' ? userNames.him : userNames.her}
          </div>
          {workspace?.inviteCode && (
            <button
              onClick={copyInviteCode}
              className="mt-3 w-full h-8 rounded-lg bg-[#446172]/10 text-[#446172] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#446172]/20 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedInvite ? 'Copied' : `Invite: ${workspace.inviteCode}`}
            </button>
          )}
        </div>

        <div className="mb-6 rounded-xl border border-[#eceef0] bg-white/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[#42474c]">
              <CalendarSync className="w-3.5 h-3.5 text-[#446172]" />
              <span>Google Calendar</span>
            </div>
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              googleConnection?.syncStatus === 'error' ? "text-[#a65d5d]" : "text-[#72787c]",
            )}>
              {googleStatus}
            </span>
          </div>
          {googleLastSynced && (
            <div className="mt-1 text-[11px] text-[#72787c]">
              Last sync: {googleLastSynced}
            </div>
          )}
          {googleConnection?.lastSyncError && (
            <div className="mt-2 rounded-lg bg-[#fff7f7] px-2 py-1.5 text-[11px] text-[#8f3d3d]">
              {googleConnection.lastSyncError}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            {googleConnection ? (
              <button
                onClick={syncGoogleCalendar}
                disabled={calendarActionLoading}
                className="flex-1 h-8 rounded-lg bg-[#446172]/10 text-[#446172] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#446172]/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", calendarActionLoading && "animate-spin")} />
                Sync Now
              </button>
            ) : (
              <button
                onClick={connectGoogleCalendar}
                disabled={!isBackendConfigured || !workspace || calendarActionLoading}
                className="flex-1 h-8 rounded-lg bg-[#446172]/10 text-[#446172] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#446172]/20 transition-colors disabled:opacity-50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Visibility Controls */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-semibold tracking-widest text-[#a0a5a9] uppercase">Visibility</span>
          <button onClick={toggleAll} className="text-xs font-medium text-[#446172] hover:underline">
            {isAllVisible ? 'Hide All' : 'Show All'}
          </button>
        </div>

        {/* Layers List */}
        <div className="space-y-2">
          {layers.map(layer => {
            const isActive = activeLayers.includes(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-sm",
                  isActive ? "bg-[#c8e6d9]/60 text-[#191c1e] shadow-sm" : "text-[#72787c] hover:bg-white/50"
                )}
              >
                <div className="flex items-center gap-3">
                  {layer.type === 'schedule' && layer.owner === 'him' && <User className={cn("w-4 h-4", isActive ? "text-[#476456]" : "")} />}
                  {layer.type === 'schedule' && layer.owner === 'her' && <User className={cn("w-4 h-4", isActive ? "text-[#476456]" : "")} />}
                  {layer.type === 'habits' && <Heart className={cn("w-4 h-4", isActive ? "text-[#476456]" : "")} />}
                  {layer.type === 'todos' && <CheckCircle2 className={cn("w-4 h-4", isActive ? "text-[#476456]" : "")} />}
                  {layer.type === 'custom' && <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: layer.color || '#c8e6d9' }} />}
                  <span className="font-medium">{getLayerName(layer)}</span>
                </div>
                {layer.type === 'todos' && (
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider", isActive ? "bg-[#476456]/10 text-[#476456]" : "bg-black/5 text-[#a0a5a9]")}>MY TASKS</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="block text-[10px] font-semibold tracking-widest text-[#a0a5a9] uppercase">My Tasks</span>
              <span className="text-[10px] text-[#a0a5a9]">Personal list for {currentUserName}</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-[#72787c]" />
          </div>

          <div className="space-y-2 mb-3">
            {personalTodos.map(todo => (
              <button
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                className="w-full rounded-lg bg-white/60 px-2.5 py-2 text-left flex items-start gap-2 hover:bg-white transition-colors"
              >
                <span className={cn(
                  "w-3 h-3 rounded border flex-shrink-0 mt-0.5",
                  todo.completed ? "bg-[#446172] border-[#446172]" : "border-[#a0a5a9] bg-white",
                )} />
                <span className={cn("min-w-0 flex-1 text-xs text-[#42474c]", todo.completed && "line-through text-[#a0a5a9]")}>
                  {todo.text}
                </span>
              </button>
            ))}
            {personalTodos.length === 0 && (
              <div className="rounded-lg bg-white/40 px-2.5 py-2 text-xs text-[#a0a5a9]">
                No personal tasks.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#eceef0] bg-white/70 p-3 space-y-2">
            <input
              value={personalTaskText}
              onChange={event => setPersonalTaskText(event.target.value)}
              className="w-full h-9 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
              placeholder="New personal task"
            />
            <button
              onClick={() => {
                addNewTodo(currentUserRole, personalTaskText);
                setPersonalTaskText('');
              }}
              className="w-full h-8 rounded-lg bg-[#446172]/10 text-[#446172] text-xs font-semibold hover:bg-[#446172]/20 transition-colors"
            >
              Add Personal Task
            </button>
          </div>
        </div>

        {/* Add Layer Button */}
        {isCreating ? (
          <div className="mt-8 rounded-xl border border-[#eceef0] bg-white/70 p-3 space-y-3">
            <input
              value={layerName}
              onChange={event => setLayerName(event.target.value)}
              className="w-full h-9 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
              placeholder="Layer name"
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={layerColor}
                onChange={event => setLayerColor(event.target.value)}
                className="w-9 h-8 rounded border border-[#eceef0] bg-white"
                title="Layer color"
              />
              <button
                onClick={() => {
                  createCustomLayer(layerName, layerColor);
                  setLayerName('');
                  setIsCreating(false);
                }}
                className="flex-1 h-8 rounded-lg bg-[#446172] text-white text-xs font-semibold"
              >
                Save Layer
              </button>
              <button onClick={() => setIsCreating(false)} className="h-8 px-2 rounded-lg text-xs font-medium text-[#72787c] hover:bg-black/5">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsCreating(true)} className="mt-8 w-full flex items-center justify-center gap-2 bg-[#446172] text-white py-2.5 rounded-xl text-xs font-semibold tracking-wide shadow-sm hover:bg-[#446172]/90 transition-colors">
            <Plus className="w-4 h-4" />
            CREATE CUSTOM LAYER
          </button>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold tracking-widest text-[#a0a5a9] uppercase">Habits</span>
            <span className="text-[10px] text-[#a0a5a9]">{habitDefinitions.length}</span>
          </div>
          <div className="space-y-1.5 mb-3">
            {habitDefinitions.filter(habit => habit.active).map(habit => (
              <div key={habit.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-white/50 text-xs text-[#42474c]">
                <span className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: habit.color }} />
                <span className="truncate">{habit.name}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-[#eceef0] bg-white/70 p-3 space-y-2">
            <input
              value={habitName}
              onChange={event => setHabitName(event.target.value)}
              className="w-full h-9 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
              placeholder="New habit"
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={habitColor}
                onChange={event => setHabitColor(event.target.value)}
                className="w-9 h-8 rounded border border-[#eceef0] bg-white"
                title="Habit color"
              />
              <button
                onClick={() => {
                  createHabitDefinition(habitName, habitColor);
                  setHabitName('');
                }}
                className="flex-1 h-8 rounded-lg bg-[#446172]/10 text-[#446172] text-xs font-semibold hover:bg-[#446172]/20 transition-colors"
              >
                Add Habit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <button className="flex items-center gap-3 text-sm text-[#72787c] hover:text-[#446172] transition-colors w-full">
          <MailOpen className="w-4 h-4" />
          <span className="font-medium">Couple Inbox</span>
        </button>
        <button className="flex items-center gap-3 text-sm text-[#72787c] hover:text-[#446172] transition-colors w-full">
          <Archive className="w-4 h-4" />
          <span className="font-medium">Archived</span>
        </button>
      </div>
    </aside>
  );
}
