import { useState } from 'react';
import { Message, MessageCategory, ToDo, User, UserNames } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { PanelRightClose, MessageSquareShare, Reply, CalendarPlus, Plus, Calendar as CalendarIcon, CheckSquare, Send, Undo2 } from 'lucide-react';
import { setCalendarDragData } from '../lib/calendarDrag';

interface RightPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: Message[];
  todos: ToDo[];
  activeTab: 'inbox' | 'todos';
  setActiveTab: (tab: 'inbox' | 'todos') => void;
  addEventFromMessage: (message: Message) => void;
  addInboxMessage: (content: string, category: MessageCategory) => void;
  addNewTodo: (assignee: User | 'both', text: string) => void;
  assignTodoToDate: (todoId: string, date: string) => void;
  unassignTodoFromDate: (todoId: string) => void;
  replyToMessage: (messageId: string, content: string) => void;
  toggleTodo: (todoId: string) => void;
  userNames: UserNames;
}

export function RightPanel({ isOpen, setIsOpen, messages, todos, activeTab, setActiveTab, addEventFromMessage, addInboxMessage, addNewTodo, assignTodoToDate, unassignTodoFromDate, replyToMessage, toggleTodo, userNames }: RightPanelProps) {
  const [todoFilter, setTodoFilter] = useState<'all' | 'him' | 'her'>('all');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState<MessageCategory>('idea');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [todoText, setTodoText] = useState('');
  const [todoAssignee, setTodoAssignee] = useState<User | 'both'>('both');

  if (!isOpen) {
    return (
      <div className="w-16 h-full flex flex-col items-center py-6 border-l border-[#eceef0] bg-[#f7f9fb]/50 shrink-0">
        <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-black/5 rounded-full mb-8" title="Expand Right Panel">
          <PanelRightClose className="w-5 h-5 text-[#446172] transform rotate-180" />
        </button>
        <div className="space-y-6">
          <MessageSquareShare className="w-5 h-5 text-[#72787c]" />
          <CheckSquare className="w-5 h-5 text-[#72787c]" />
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

  const matchesTodoFilter = (todo: ToDo) => {
     if (todoFilter === 'all') return true;
     return todo.assignee === todoFilter || todo.assignee === 'both';
  };

  const flexibleTodos = todos.filter(todo => !todo.date).filter(matchesTodoFilter);
  const scheduledTodos = todos.filter(todo => todo.date).filter(matchesTodoFilter);

  const formatTodoDate = (date: string) => format(new Date(`${date}T00:00:00`), 'MMM d');

  return (
    <aside className="fixed md:static right-0 top-0 z-40 w-[min(320px,calc(100vw-3rem))] md:w-[320px] h-full flex flex-col bg-[#f5f7f9]/95 md:bg-[#f5f7f9] backdrop-blur-md md:backdrop-blur-0 border-l border-[#eceef0] shrink-0 p-6 shadow-2xl md:shadow-[-10px_0_30px_rgba(0,0,0,0.02)] md:relative">
      
      <button 
        onClick={() => setIsOpen(false)} 
        className="absolute left-4 top-6 p-1.5 hover:bg-black/5 rounded-md text-[#72787c] transition-colors"
        title="Collapse Panel"
      >
        <PanelRightClose className="w-4 h-4" />
      </button>

      <div className="flex items-start justify-between mb-2 pl-8">
        <div className="flex items-center gap-2">
          {activeTab === 'inbox' ? <MessageSquareShare className="w-5 h-5 text-[#446172]" /> : <CheckSquare className="w-5 h-5 text-[#446172]" />}
          <h2 className="text-xl font-display font-semibold text-[#191c1e]">
            {activeTab === 'inbox' ? 'Couple Inbox' : 'To-Do Box'}
          </h2>
        </div>
      </div>
      
      {activeTab === 'inbox' && (
        <p className="text-xs text-[#72787c] italic mb-6 pl-8">Share notes or drag to schedule</p>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 mt-4 p-1 bg-white/50 rounded-lg border border-[#eceef0]">
        <button 
          onClick={() => setActiveTab('inbox')}
          className={cn("flex-1 text-xs py-1.5 font-medium rounded-md transition-colors", activeTab === 'inbox' ? "bg-white shadow-sm text-[#191c1e]" : "text-[#72787c]")}
        >
          Inbox
        </button>
        <button 
          onClick={() => setActiveTab('todos')}
          className={cn("flex-1 text-xs py-1.5 font-medium rounded-md transition-colors", activeTab === 'todos' ? "bg-white shadow-sm text-[#191c1e]" : "text-[#72787c]")}
        >
          To-Dos
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
        {activeTab === 'inbox' && (
          <div className="bg-white p-3 rounded-xl shadow-sm border border-[#eceef0] space-y-3">
            <textarea
              value={newMessage}
              onChange={event => setNewMessage(event.target.value)}
              rows={3}
              placeholder="Write an idea, plan, or note..."
              className="w-full resize-none rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 py-2 text-sm outline-none focus:border-[#446172]"
            />
            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={event => setNewCategory(event.target.value as MessageCategory)}
                className="h-8 rounded-md border border-[#eceef0] bg-white px-2 text-xs text-[#42474c] outline-none"
              >
                <option value="idea">Idea</option>
                <option value="plan">Plan</option>
                <option value="love">Love</option>
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
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white", msg.from === 'him' ? "bg-[#446172]" : "bg-[#8cb3a1]")}>
                  {msg.from === 'him' ? userNames.him.charAt(0) : userNames.her.charAt(0)}
                </div>
                <span className="text-xs font-semibold capitalize">{msg.from === 'him' ? userNames.him : userNames.her}</span>
              </div>
              <span className="text-[10px] text-[#a0a5a9]">
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
              draggable
              onDragStart={event => setCalendarDragData(event, { type: 'todo', id: todo.id })}
              className="bg-white p-3 rounded-lg shadow-sm border border-[#eceef0] flex items-start gap-2 group cursor-grab active:cursor-grabbing"
            >
               <div className="relative mt-0.5">
                 <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="peer appearance-none w-4 h-4 border border-[#c2c7cc] rounded checked:bg-[#446172] checked:border-[#446172] cursor-pointer" />
                 {todo.completed && <CheckSquare className="w-3 h-3 text-white absolute inset-0 m-auto pointer-events-none" strokeWidth={3} />}
               </div>
               <div className="flex-1 min-w-0">
                 <p className={cn("text-sm", todo.completed && "line-through text-[#a0a5a9]")}>{todo.text}</p>
                 <div className="flex items-center justify-between mt-2">
                   <span className="text-[10px] font-medium text-[#72787c] capitalize px-1.5 py-0.5 bg-black/5 rounded inline-block">
                     {todo.assignee === 'him' ? userNames.him : todo.assignee === 'her' ? userNames.her : 'Shared'}
                   </span>
                   <button onClick={() => assignTodoToDate(todo.id, format(new Date(), 'yyyy-MM-dd'))} className="text-[10px] flex items-center gap-1 text-[#446172] opacity-0 group-hover:opacity-100 hover:bg-[#446172]/10 px-1.5 py-0.5 rounded transition-all">
                     <CalendarIcon className="w-3 h-3" /> Today
                   </button>
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
                draggable
                onDragStart={event => setCalendarDragData(event, { type: 'todo', id: todo.id })}
                className="bg-white p-3 rounded-lg shadow-sm border border-[#eceef0] flex items-start gap-2 group cursor-grab active:cursor-grabbing"
              >
                <div className="relative mt-0.5">
                  <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="peer appearance-none w-4 h-4 border border-[#c2c7cc] rounded checked:bg-[#446172] checked:border-[#446172] cursor-pointer" />
                  {todo.completed && <CheckSquare className="w-3 h-3 text-white absolute inset-0 m-auto pointer-events-none" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", todo.completed && "line-through text-[#a0a5a9]")}>{todo.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-medium text-[#72787c] capitalize px-1.5 py-0.5 bg-black/5 rounded inline-block">
                      {todo.assignee === 'him' ? userNames.him : todo.assignee === 'her' ? userNames.her : 'Shared'}
                    </span>
                    <div className="flex items-center gap-1">
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
