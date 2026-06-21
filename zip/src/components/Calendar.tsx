import { useState, type DragEvent } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { HabitDefinition, HabitRecord, ToDo, CalendarEvent, ViewMode, UserNames, Layer, User } from '../types';
import { readCalendarDragData } from '../lib/calendarDrag';

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  todos: ToDo[];
  toggleTodo: (id: string) => void;
  habits: HabitRecord[];
  habitDefinitions: HabitDefinition[];
  events: CalendarEvent[];
  layers: Layer[];
  activeLayers: string[];
  viewMode: ViewMode;
  currentUserRole: User;
  userNames: UserNames;
  onTodoDropToDate: (todoId: string, date: string) => void;
  onMessageDropToDate: (messageId: string, date: string) => void;
  addHabitLog: (date: string, habitId: string) => void;
  openEventDialog: (date: string) => void;
  openEventEditor: (event: CalendarEvent) => void;
}

export function Calendar({ currentDate, setCurrentDate, todos, toggleTodo, habits, habitDefinitions, events, layers, activeLayers, viewMode, currentUserRole, userNames, onTodoDropToDate, onMessageDropToDate, addHabitLog, openEventDialog, openEventEditor }: CalendarProps) {
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);
  const [habitMenuDate, setHabitMenuDate] = useState<string | null>(null);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  let startDate = startOfWeek(monthStart);
  let endDate = endOfWeek(monthEnd);

  if (viewMode === 'Week') {
    startDate = startOfWeek(currentDate);
    endDate = endOfWeek(currentDate);
  } else if (viewMode === 'Day') {
    startDate = currentDate;
    endDate = currentDate;
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const hours = Array.from({length: 24}, (_, i) => i);

  const showLayer = (layerId: string) => activeLayers.includes(layerId);
  const findEventLayer = (event: CalendarEvent) => {
    if (event.layerId) {
      const layer = layers.find(item => item.id === event.layerId || item.databaseId === event.layerId);
      if (layer) return layer;
    }
    if (event.user === 'him') return layers.find(layer => layer.id === 'him_schedule');
    if (event.user === 'her') return layers.find(layer => layer.id === 'her_schedule');
    return undefined;
  };

  const isEventVisible = (event: CalendarEvent) => {
    const layer = findEventLayer(event);
    if (layer) return showLayer(layer.id);
    if (event.user === 'both') return showLayer('him_schedule') || showLayer('her_schedule');
    return showLayer(`${event.user}_schedule`);
  };

  const getEventStyle = (event: CalendarEvent) => {
    const layer = findEventLayer(event);
    const fallbackColor = event.user === 'both' ? '#e0e5ed' : event.user === 'him' ? '#d1e6e0' : '#f0e6eb';
    const accent = event.user === 'both' ? '#72787c' : event.user === 'him' ? '#446172' : '#a65d5d';
    return {
      backgroundColor: layer?.color || fallbackColor,
      color: '#191c1e',
      borderLeft: `3px solid ${layer?.color || accent}`,
    };
  };

  const getDotsForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    let dots = habits.filter(h => h.date === formattedDate);
    if (!showLayer('shared_habits')) {
       dots = dots.filter(h => showLayer(h.user + '_schedule'));
    }
    return dots;
  };

  const getEventsForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return events.filter(e => {
        if (e.date !== formattedDate) return false;
        return isEventVisible(e);
    });
  };

  const getTodosForDate = (date: Date) => {
    if (!showLayer('todos')) return [];
    const formattedDate = format(date, 'yyyy-MM-dd');
    return todos.filter(t => t.date === formattedDate);
  };

  const isHabitLogged = (date: string, habit: HabitDefinition) => habits.some(log => (
    log.date === date
    && log.user === currentUserRole
    && (log.habitId === habit.id || log.habit === habit.id || log.name === habit.name)
  ));

  const getHabitLabel = (record: HabitRecord) => {
    const habitName = record.name || record.habit;
    const userName = record.user === 'him' ? userNames.him : userNames.her;
    return `${habitName} by ${userName}`;
  };

  const handleDateDrop = (event: DragEvent<HTMLDivElement>, date: Date) => {
    event.preventDefault();
    setDropTargetDate(null);
    const payload = readCalendarDragData(event);
    if (!payload) return;

    const formattedDate = format(date, 'yyyy-MM-dd');
    if (payload.type === 'todo') onTodoDropToDate(payload.id, formattedDate);
    if (payload.type === 'message') onMessageDropToDate(payload.id, formattedDate);
  };

  const getDateDropProps = (date: Date, enabled = true) => {
    const formattedDate = format(date, 'yyyy-MM-dd');

    return {
      onDragEnter: () => enabled && setDropTargetDate(formattedDate),
      onDragLeave: () => setDropTargetDate(previous => previous === formattedDate ? null : previous),
      onDragOver: (event: DragEvent<HTMLDivElement>) => {
        if (!enabled) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      },
      onDrop: (event: DragEvent<HTMLDivElement>) => enabled && handleDateDrop(event, date),
    };
  };

  const renderTodoButton = (todo: ToDo) => (
    <button
      key={todo.id}
      onClick={() => toggleTodo(todo.id)}
      className="group w-full text-left text-[10px] md:text-xs p-1 rounded hover:bg-black/5 flex items-start gap-1 md:gap-1.5 transition-colors"
    >
      <div className={cn(
        "w-2.5 h-2.5 md:w-3 md:h-3 rounded flex-shrink-0 mt-0.5 border flex items-center justify-center transition-colors shadow-sm",
        todo.completed ? "bg-[#d8dadc] border-transparent" : "border-[#a0a5a9] bg-white group-hover:border-[#446172]"
      )}>
        {todo.completed && <div className="w-1.5 h-1.5 bg-white rounded-[1px]" />}
      </div>
      <span className={cn(
        "truncate",
        todo.completed ? "text-[#a0a5a9] line-through" : "text-[#42474c]"
      )}>{todo.text}</span>
    </button>
  );

  const handlePrev = () => {
    if (viewMode === 'Year') setCurrentDate(subMonths(currentDate, 12));
    if (viewMode === 'Month') setCurrentDate(subMonths(currentDate, 1));
    if (viewMode === 'Week') setCurrentDate(subWeeks(currentDate, 1));
    if (viewMode === 'Day') setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'Year') setCurrentDate(addMonths(currentDate, 12));
    if (viewMode === 'Month') setCurrentDate(addMonths(currentDate, 1));
    if (viewMode === 'Week') setCurrentDate(addWeeks(currentDate, 1));
    if (viewMode === 'Day') setCurrentDate(addDays(currentDate, 1));
  };

  let title = format(currentDate, 'MMMM yyyy');
  if (viewMode === 'Week') {
    title = `Week of ${format(startDate, 'MMM d, yyyy')}`;
  } else if (viewMode === 'Day') {
    title = format(currentDate, 'MMMM d, yyyy');
  } else if (viewMode === 'Year') {
    title = format(currentDate, 'yyyy');
  }

  const renderTimeGrid = () => (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#eceef0] rounded-2xl overflow-hidden mt-4 shadow-sm relative">
       {/* Headers */}
       <div className="flex border-b border-[#eceef0] bg-white z-20 sticky top-0">
          <div className="w-16 shrink-0 border-r border-[#eceef0]" />
          {days.map(day => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            const dayTodos = getTodosForDate(day);
            return (
             <div
               key={day.toString()}
               {...getDateDropProps(day)}
               className={cn(
                 "flex-1 border-r border-[#eceef0]/60 p-2 text-center transition-colors",
                 dropTargetDate === formattedDate && "bg-[#c8e6d9]/30 ring-2 ring-inset ring-[#446172]/30"
               )}
             >
                 <div className="text-[10px] uppercase font-semibold text-[#a0a5a9]">{format(day, 'EEE')}</div>
                 <div className={cn("text-xl font-display mt-0.5", isToday(day) ? "text-[#446172] font-semibold" : "text-[#191c1e]")}>{format(day, 'd')}</div>
                 {/* All day section */}
                 <div className="min-h-[20px] mt-2 space-y-1">
                     {getEventsForDate(day).filter(e => e.allDay || !e.startTime).map(e => (
                         <button
                           key={e.id}
                           type="button"
                           onClick={() => openEventEditor(e)}
                           style={getEventStyle(e)}
                           className="w-full text-left text-[9px] px-1.5 py-0.5 rounded truncate cursor-pointer"
                         >
                           {e.title}
                         </button>
                     ))}
                     {dayTodos.map(todo => renderTodoButton(todo))}
                 </div>
             </div>
            )
          })}
       </div>

       {/* Time Slots */}
       <div className="flex-1 overflow-y-auto no-scrollbar relative flex bg-[#fbfcfd]">
          {/* Background horizontal lines covering all width.  */}
          <div className="absolute inset-0 pointer-events-none left-16 z-0">
              {hours.map(h => (
                  <div key={h} className="h-[60px] border-b border-[#eceef0]/60 w-full" />
              ))}
          </div>

          {/* Time axis */}
          <div className="w-16 shrink-0 border-r border-[#eceef0] bg-white z-10 sticky left-0 relative">
             {hours.map(h => (
                 <div key={h} className="h-[60px] relative">
                     {h > 0 && <span className="absolute -top-2.5 right-2 text-[10px] text-[#a0a5a9]">{h.toString().padStart(2, '0')}:00</span>}
                 </div>
             ))}
          </div>

          {/* Day columns */}
          {days.map(day => {
              const timedEvents = getEventsForDate(day).filter(e => !e.allDay && !!e.startTime);
              const formattedDate = format(day, 'yyyy-MM-dd');
              return (
                 <div
                   key={day.toString()}
                   {...getDateDropProps(day)}
                   className={cn(
                     "flex-1 relative border-r border-[#eceef0]/60 h-[1440px] transition-colors",
                     isToday(day) && "bg-[#446172]/5",
                     dropTargetDate === formattedDate && "bg-[#c8e6d9]/20 ring-2 ring-inset ring-[#446172]/30"
                   )}
                 >
                    {timedEvents.map(event => {
                        const startHou = event.startTime ? parseInt(event.startTime.split(':')[0]) : 0;
                        const startMin = event.startTime ? parseInt(event.startTime.split(':')[1]) : 0;
                        const endHou = event.endTime ? parseInt(event.endTime.split(':')[0]) : startHou + 1;
                        const endMin = event.endTime ? parseInt(event.endTime.split(':')[1]) : startMin;
                        const top = (startHou * 60) + (startMin / 60 * 60); // px
                        const duration = ((endHou * 60) + endMin) - ((startHou * 60) + startMin);
                        const height = Math.max(duration, 20); // min height
                        
                        return (
                            <button
                                key={event.id}
                                type="button"
                                onClick={() => openEventEditor(event)}
                                className="absolute left-1 right-1 rounded-md px-2 py-1 text-xs shadow-sm overflow-hidden z-20 text-left cursor-pointer"
                                style={{ top: `${top}px`, height: `${height}px`, ...getEventStyle(event) }}
                            >
                                <div className="font-semibold truncate leading-tight mt-[-2px]">{event.title}</div>
                                <div className="text-[9px] opacity-70 mt-0.5 truncate">{event.startTime}</div>
                            </button>
                        )
                    })}
                 </div>
              )
          })}
       </div>
    </div>
  );

  const renderYearView = () => {
    const months = Array.from({length: 12}, (_, i) => new Date(currentDate.getFullYear(), i, 1));
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-20">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
               {months.map(month => {
                   const mStart = startOfMonth(month);
                   const mEnd = endOfMonth(month);
                   const mDays = eachDayOfInterval({start: startOfWeek(mStart), end: endOfWeek(mEnd)});
                   return (
                       <div key={month.toString()} className="flex flex-col">
                           <h3 className={cn("text-lg font-semibold font-display mb-4 pl-1", isSameMonth(month, new Date()) ? "text-[#a65d5d]" : "text-[#446172]")}>{format(month, 'MMMM')}</h3>
                           <div className="grid grid-cols-7 gap-y-2">
                               {weekDays.map(d => <div key={d} className="text-[9px] font-bold text-[#a0a5a9] text-center mb-1">{d.charAt(0)}</div>)}
                               {mDays.map(day => {
                                   const isCurrentM = isSameMonth(day, month);
                                   const isTD = isToday(day);
                                   const hasEvent = getEventsForDate(day).length > 0;
                                   return (
                                       <div key={day.toString()} className="flex flex-col items-center justify-center">
                                           <div className={cn("w-6 h-6 flex items-center justify-center rounded-full text-xs transition-colors", 
                                                !isCurrentM && "opacity-0",
                                                isTD && "bg-[#a65d5d] text-white font-bold", 
                                                !isTD && isCurrentM && "text-[#191c1e]"
                                           )}>
                                              {format(day, 'd')}
                                           </div>
                                           <div className={cn("w-1 h-1 rounded-full mt-0.5", hasEvent && isCurrentM ? "bg-[#446172]" : "bg-transparent")} />
                                       </div>
                                   )
                               })}
                           </div>
                       </div>
                   )
               })}
           </div>
        </div>
    )
  };

  return (
    <div className="flex-1 flex flex-col h-full p-3 md:p-6 2xl:p-10 relative min-w-0">
      
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center gap-2 md:gap-6 mb-2 sticky top-0 z-10 pb-2">
        <h2 className="min-w-0 flex-1 text-xl md:text-3xl lg:text-4xl font-display font-semibold text-[#191c1e] tracking-tight truncate">{title}</h2>
        <div className="flex items-center gap-1">
          <button onClick={handlePrev} className="p-1 hover:bg-black/5 rounded-full transition-colors text-[#446172]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNext} className="p-1 hover:bg-black/5 rounded-full transition-colors text-[#446172]">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="basis-full md:basis-auto md:ml-auto flex items-center justify-end md:pr-4">
          <button onClick={() => openEventDialog(format(currentDate, 'yyyy-MM-dd'))} className="mr-2 px-3 md:px-4 py-1.5 text-xs font-semibold tracking-wider hover:bg-[#446172]/10 rounded-full transition-colors text-[#446172] border border-[#d8dadc] uppercase whitespace-nowrap bg-white/50 flex items-center gap-1.5">
            <CalendarPlus className="w-3.5 h-3.5" /> New Event
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 md:px-4 py-1.5 text-xs font-semibold tracking-wider hover:bg-black/5 rounded-full transition-colors text-[#72787c] border border-[#d8dadc] uppercase whitespace-nowrap bg-white/50">
            Today
          </button>
        </div>
      </div>

      {viewMode === 'Year' && renderYearView()}
      
      {(viewMode === 'Day' || viewMode === 'Week') && renderTimeGrid()}

      {viewMode === 'Month' && (
        <div className="flex-1 flex flex-col min-h-0 border border-[#eceef0] rounded-2xl overflow-hidden bg-[#eceef0] gap-px max-h-fit mt-2 md:mt-4 shadow-sm">
          <div className="grid grid-cols-7 bg-white">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] md:text-[11px] font-semibold tracking-widest text-[#a0a5a9] py-3">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid gap-px grid-cols-7 bg-[#eceef0]">
          {days.map((day) => {
            const isCurrMonth = isSameMonth(day, monthStart);
            const dots = getDotsForDate(day);
            const dayEvents = getEventsForDate(day);
            const dayTodos = getTodosForDate(day);
            const formattedDate = format(day, 'yyyy-MM-dd');
            const dateDropProps = getDateDropProps(day, isCurrMonth);

            return (
              <div 
                key={day.toString()} 
                {...dateDropProps}
                className={cn(
                  "bg-white p-1 md:p-2 min-h-[82px] sm:min-h-[100px] md:min-h-[120px] transition-colors relative flex flex-col gap-1",
                  !isCurrMonth && "opacity-40 pointer-events-none",
                  dropTargetDate === formattedDate && "bg-[#c8e6d9]/30 ring-2 ring-inset ring-[#446172]/30"
                )}
              >
                <div className="flex justify-between items-start mb-1 h-6">
                  <span className={cn(
                    "text-xs md:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mt-0.5 ml-0.5",
                    isToday(day) ? "bg-[#446172] text-white" : "text-[#191c1e]"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {showLayer('shared_habits') && (
                    <button
                      onClick={() => setHabitMenuDate(formattedDate)}
                      className="absolute left-8 top-2 w-5 h-5 rounded-full text-[12px] leading-none text-[#72787c] hover:bg-[#446172]/10 hover:text-[#446172] transition-colors"
                      title="Log habit"
                    >
                      +
                    </button>
                  )}
                  
                  {dots.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 mr-1 flex-wrap justify-end max-w-[50%]">
                      {dots.map((dot, idx) => (
                        <div 
                          key={idx}
                          title={getHabitLabel(dot)}
                          aria-label={getHabitLabel(dot)}
                          style={dot.color ? { backgroundColor: dot.color } : undefined}
                          className={cn(
                            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full border",
                            dot.user === 'him' ? "border-[#446172]" : "border-[#a65d5d]",
                            !dot.color && dot.habit === 'vocabulary' && "bg-[#4ade80]",
                            !dot.color && dot.habit === 'shower' && "bg-[#d8dadc]",
                            !dot.color && dot.habit === 'exercise' && "bg-[#a65d5d]",
                            !dot.color && dot.habit !== 'vocabulary' && dot.habit !== 'shower' && dot.habit !== 'exercise' && "bg-[#446172]"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                  
                  {/* Events */}
                  {dayEvents.map(event => (
                    <button
                      key={event.id} 
                      type="button"
                      onClick={() => openEventEditor(event)}
                      style={getEventStyle(event)}
                      className="w-full text-left text-[10px] md:text-xs px-1.5 md:px-2 py-1 md:py-1.5 rounded-md truncate font-medium cursor-pointer"
                    >
                      {event.title}
                    </button>
                  ))}

                  {/* To-Dos */}
                  {dayTodos.map(todo => renderTodoButton(todo))}

                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {habitMenuDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191c1e]/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl border border-white/70 bg-white shadow-lg p-5">
            <h3 className="text-lg font-display font-semibold text-[#191c1e] mb-1">Log Habit</h3>
            <p className="text-xs text-[#72787c] mb-4">{habitMenuDate}</p>
            <div className="space-y-2">
              {habitDefinitions.filter(habit => habit.active).map(habit => {
                const logged = isHabitLogged(habitMenuDate, habit);
                return (
                  <button
                    key={habit.id}
                    disabled={logged}
                    onClick={() => {
                      addHabitLog(habitMenuDate, habit.id);
                      setHabitMenuDate(null);
                    }}
                    className={cn(
                      "w-full h-10 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm flex items-center gap-2 transition-colors",
                      logged ? "cursor-default opacity-60" : "hover:border-[#446172]/40"
                    )}
                  >
                    <span className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: habit.color }} />
                    <span className="truncate">{habit.name}</span>
                    {logged && <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[#a0a5a9]">Logged</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setHabitMenuDate(null)} className="h-9 rounded-lg px-3 text-sm font-medium text-[#72787c] hover:bg-black/5 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
