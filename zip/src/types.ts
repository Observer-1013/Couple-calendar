export type Habit = string;
export type User = 'him' | 'her';
export type MessageCategory = 'idea' | 'plan' | 'love';
export type ViewMode = 'Day' | 'Week' | 'Month' | 'Year';
export type RightPanelTab = 'inbox' | 'todos' | 'status';

export interface UserNames {
  him: string;
  her: string;
}

export interface WeatherLocation {
  city: string;
  country?: string | null;
  latitude: number;
  longitude: number;
  updatedAt?: string | null;
}

export interface ToDo {
  id: string;
  text: string;
  completed: boolean;
  date?: string; // YYYY-MM-DD, optional if in flexible list
  assignee: 'both' | User | 'unassigned';
}

export interface HabitRecord {
  id: string;
  date: string; // YYYY-MM-DD
  habit: Habit;
  user: User;
  habitId?: string;
  color?: string;
  name?: string;
}

export interface HabitDefinition {
  id: string;
  name: string;
  color: string;
  owner: User | 'both';
  active: boolean;
}

export interface Message {
  id: string;
  from: User;
  to: User;
  category: MessageCategory;
  content: string;
  timestamp: string;
  parentId?: string | null;
  convertedEventId?: string | null;
  replies?: Message[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  allDay?: boolean;
  user: User | 'both';
  isLayerEvent?: boolean;
  layerId?: string | null;
  source?: 'manual' | 'google' | 'apple';
}

export interface CalendarConnection {
  id: string;
  provider: 'google' | 'apple';
  providerAccountId?: string | null;
  scopes: string[];
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncedAt?: string | null;
  lastSyncError?: string | null;
}

export interface Layer {
  id: string;
  databaseId?: string;
  slug?: string | null;
  name: string;
  type: 'schedule' | 'habits' | 'todos' | 'custom';
  owner?: User | 'both';
  color?: string;
  isVisibleByDefault?: boolean;
}

export interface CoupleWorkspace {
  coupleId: string;
  coupleName: string;
  inviteCode: string;
  role: User | null;
}
