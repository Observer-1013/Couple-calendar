import type { DragEvent } from 'react';

export type CalendarDragPayload =
  | { type: 'todo'; id: string }
  | { type: 'message'; id: string };

const CALENDAR_DRAG_MIME = 'application/x-couplesync-calendar-item';

export function setCalendarDragData(event: DragEvent<HTMLElement>, payload: CalendarDragPayload) {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData(CALENDAR_DRAG_MIME, JSON.stringify(payload));
}

export function readCalendarDragData(event: DragEvent<HTMLElement>): CalendarDragPayload | null {
  const rawPayload = event.dataTransfer.getData(CALENDAR_DRAG_MIME);
  if (!rawPayload) return null;

  try {
    const parsed = JSON.parse(rawPayload) as CalendarDragPayload;
    if ((parsed.type === 'todo' || parsed.type === 'message') && parsed.id) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}
