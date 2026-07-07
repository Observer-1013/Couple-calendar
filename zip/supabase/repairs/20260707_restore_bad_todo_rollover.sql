-- One-time repair for the 2026-07-07 todo rollover bug.
--
-- What this fixes:
-- The previous web build moved every stale unfinished scheduled todo to today,
-- including shared/couple todos. It also inserted rows into todo_rollovers.
--
-- How to use:
-- 1. Run the PREVIEW query first and inspect the rows.
-- 2. If the preview looks right, run the REPAIR transaction.

-- PREVIEW: todos that will be moved back to their earliest recorded date.
select
  t.id,
  t.text,
  t.assignee_role,
  t.scheduled_date as current_scheduled_date,
  r.original_date as restored_scheduled_date
from public.todos t
join (
  select todo_id, min(from_date) as original_date
  from public.todo_rollovers
  group by todo_id
) r on r.todo_id = t.id
where t.completed = false
order by r.original_date, t.text;

-- REPAIR: move affected todos back and clear the bad rollover history.
begin;

with first_rollovers as (
  select todo_id, min(from_date) as original_date
  from public.todo_rollovers
  group by todo_id
)
update public.todos t
set scheduled_date = first_rollovers.original_date
from first_rollovers
where t.id = first_rollovers.todo_id
  and t.completed = false;

delete from public.todo_rollovers;

commit;
