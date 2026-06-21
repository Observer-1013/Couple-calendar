import { HabitRecord, Message, ToDo, CalendarEvent } from './types';

const demoNow = new Date();
const demoYear = demoNow.getFullYear();
const demoMonth = demoNow.getMonth();

function localDate(day: number) {
  const date = new Date(demoYear, demoMonth, day);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dateOfMonth = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dateOfMonth}`;
}

function localTimestamp(day: number, hour: number, minute: number) {
  return new Date(demoYear, demoMonth, day, hour, minute).toISOString();
}

export const mockTodos: ToDo[] = [
  { id: 't1', text: 'Buy groceries', completed: false, date: localDate(8), assignee: 'both' },
  { id: 't2', text: 'Call mom', completed: true, date: localDate(10), assignee: 'her' },
  { id: 't3', text: 'Pay internet bill', completed: false, assignee: 'both' }, // Flexible todo
  { id: 't4', text: 'Plan weekend trip', completed: false, assignee: 'him' },
  { id: 't5', text: 'Fix kitchen sink', completed: false, assignee: 'him' },
];

export const mockHabits: HabitRecord[] = [
  { id: 'h1', date: localDate(8), habit: 'vocabulary', user: 'him' },
  { id: 'h2', date: localDate(8), habit: 'exercise', user: 'her' },
  { id: 'h3', date: localDate(10), habit: 'shower', user: 'him' },
  { id: 'h4', date: localDate(14), habit: 'vocabulary', user: 'him' },
  { id: 'h5', date: localDate(6), habit: 'exercise', user: 'her' },
];

export const mockEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Dentist Appointment', date: localDate(5), startTime: '10:00', endTime: '11:00', user: 'him' },
  { id: 'e2', title: 'Dinner Date', date: localDate(12), startTime: '19:00', endTime: '21:00', user: 'both' },
  { id: 'e3', title: 'Team Sync', date: localDate(12), startTime: '09:00', endTime: '10:00', user: 'her' },
  { id: 'e4', title: 'Morning Run', date: localDate(14), startTime: '07:00', endTime: '08:00', user: 'him' },
  { id: 'e5', title: 'All Day Workshop', date: localDate(20), allDay: true, user: 'both' },
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    from: 'him',
    to: 'her',
    category: 'plan',
    content: 'Renew lease agreement',
    timestamp: localTimestamp(12, 8, 30),
  },
  {
    id: 'm2',
    from: 'her',
    to: 'him',
    category: 'idea',
    content: 'Schedule car maintenance',
    timestamp: localTimestamp(12, 14, 15),
  }
];

export const colorMap = {
  him: '#d1e6e0', // Soft sage/teal gradient base
  her: '#f0e6eb',
  both: '#e0e5ed',
  accent: '#476456'
};
