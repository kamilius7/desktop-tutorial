-- RLS policies: defense in depth for StudyShare.
-- The app authorizes at the query layer; these policies prevent direct-DB
-- reads of other users' private data. Run against production:
--   psql "$DATABASE_URL" -f drizzle/rls-policies.sql
--
-- The app must set the current user inside each transaction:
--   BEGIN;
--   SET LOCAL app.current_user_id = '<uuid>';
--   ...queries...
--   COMMIT;

create or replace function current_app_user() returns uuid
language sql stable as $$
  select nullif(current_setting('app.current_user_id', true), '')::uuid
$$;

alter table messages enable row level security;
create policy messages_participant_select on messages
  for select using (
    sender_id = current_app_user()
    or conversation_id in (
      select conversation_id from conversation_members where user_id = current_app_user()
    )
  );
create policy messages_participant_insert on messages
  for insert with check (
    sender_id = current_app_user()
    and conversation_id in (
      select conversation_id from conversation_members where user_id = current_app_user()
    )
  );

alter table sessions enable row level security;
create policy sessions_owner_select on sessions
  for select using (user_id = current_app_user());
create policy sessions_owner_delete on sessions
  for delete using (user_id = current_app_user());

alter table conversation_members enable row level security;
create policy convo_members_select on conversation_members
  for select using (
    user_id = current_app_user()
    or conversation_id in (
      select conversation_id from conversation_members where user_id = current_app_user()
    )
  );
