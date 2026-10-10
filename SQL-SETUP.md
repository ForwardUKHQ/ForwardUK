# Forward UK V3 — SQL setup

## 1. Run the schema
Create a Supabase project and run `schema.sql` in the SQL editor.

## 2. Create an admin account
In Supabase → Authentication → Users, create a user for the Forward UK Control Room.

Copy the Auth user UUID and run:

```sql
insert into public.profiles(user_id, role, display_name)
values ('YOUR-AUTH-USER-UUID', 'admin', 'Forward UK Admin')
on conflict (user_id)
do update set role='admin', display_name=excluded.display_name;
```

## 3. Configure the flat website
Open `supabase-config.js` and set:

```js
window.FORWARD_UK_BACKEND = {
  provider: "supabase",
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR-ANON-PUBLIC-KEY",
  pollMs: 20000
};
```

Use the **anon/public** key only. Never use the service-role key in a public repository.

## 4. Optional realtime
The site already polls every 20 seconds. If you also want Supabase Realtime, run:

```sql
alter publication supabase_realtime add table public.site_settings;
alter publication supabase_realtime add table public.content_items;
```

If Supabase says either table is already in the publication, it can be ignored.

## 5. Test
- Visit `index.html` — public content should load from SQL.
- Visit `control-room.html` — use the Supabase admin email/password.
- Create a policy or news item and publish it.
- Refresh the public site and confirm it appears.
- Join through `membership.html`; the first SQL member number will be `FWUK-2029-000001`.

All organisation counts start at zero until records are added.
