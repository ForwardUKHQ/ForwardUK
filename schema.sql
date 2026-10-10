-- Forward UK V3 — PostgreSQL / Supabase schema
-- Party website only. No results/election-night system and no payment/donation tables.
-- Run in a NEW Supabase project, then create at least one Auth user and promote that user in public.profiles.

create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin','editor','membership','viewer')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  collection text not null check (collection in (
    'policies','manifestos','news','events','representatives','leadership','branches',
    'announcements','documents','faqs','history','candidates','constituencies'
  )),
  slug text,
  title text not null default '',
  status text not null default 'Draft',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(collection, client_id)
);
create index if not exists content_items_collection_status_idx on public.content_items(collection,status);
create index if not exists content_items_updated_idx on public.content_items(updated_at desc);

create sequence if not exists public.forward_member_number_seq start 1;
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  member_number text unique not null,
  first_name text not null,
  last_name text not null,
  email citext unique not null,
  dob date,
  postcode text,
  city text,
  nation text,
  constituency text,
  branch text,
  phone text,
  join_date date not null default current_date,
  status text not null default 'Active' check (status in ('Pending','Active','Suspended','Former Member')),
  volunteer boolean not null default false,
  comms boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists members_status_idx on public.members(status);
create index if not exists members_postcode_idx on public.members(postcode);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  first_name text,
  last_name text,
  email citext not null,
  subject text,
  message text not null,
  status text not null default 'New' check (status in ('New','Read','Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  name text not null,
  alt_text text,
  storage_path text,
  data_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
drop trigger if exists content_items_updated_at on public.content_items;
create trigger content_items_updated_at before update on public.content_items for each row execute function public.set_updated_at();
drop trigger if exists members_updated_at on public.members;
create trigger members_updated_at before update on public.members for each row execute function public.set_updated_at();
drop trigger if exists contact_messages_updated_at on public.contact_messages;
create trigger contact_messages_updated_at before update on public.contact_messages for each row execute function public.set_updated_at();
drop trigger if exists media_updated_at on public.media;
create trigger media_updated_at before update on public.media for each row execute function public.set_updated_at();

create or replace function public.is_forward_staff()
returns boolean
language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role in ('admin','editor','membership')); $$;

create or replace function public.is_forward_admin()
returns boolean
language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.role='admin'); $$;

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.content_items enable row level security;
alter table public.members enable row level security;
alter table public.contact_messages enable row level security;
alter table public.media enable row level security;
alter table public.audit_log enable row level security;

-- Public site settings are intentionally readable; do not store secrets in this table.
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings for select using (true);
drop policy if exists site_settings_staff_write on public.site_settings;
create policy site_settings_staff_write on public.site_settings for all using (public.is_forward_staff()) with check (public.is_forward_staff());

-- Visitors only see publishable records. Staff see all records.
drop policy if exists content_public_read on public.content_items;
create policy content_public_read on public.content_items for select using (
  public.is_forward_staff() or status in ('Published','Active','Upcoming','Live','Completed','Coming Soon')
);
drop policy if exists content_staff_write on public.content_items;
create policy content_staff_write on public.content_items for all using (public.is_forward_staff()) with check (public.is_forward_staff());

-- Member/contact/media records are staff-only by direct table access.
drop policy if exists members_staff_all on public.members;
create policy members_staff_all on public.members for all using (public.is_forward_staff()) with check (public.is_forward_staff());
drop policy if exists contact_staff_all on public.contact_messages;
create policy contact_staff_all on public.contact_messages for all using (public.is_forward_staff()) with check (public.is_forward_staff());
drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select using (true);
drop policy if exists media_staff_write on public.media;
create policy media_staff_write on public.media for all using (public.is_forward_staff()) with check (public.is_forward_staff());
drop policy if exists audit_staff_read on public.audit_log;
create policy audit_staff_read on public.audit_log for select using (public.is_forward_staff());
drop policy if exists audit_staff_insert on public.audit_log;
create policy audit_staff_insert on public.audit_log for insert with check (public.is_forward_staff());
drop policy if exists profiles_self_or_admin on public.profiles;
create policy profiles_self_or_admin on public.profiles for select using (user_id=auth.uid() or public.is_forward_admin());
drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles for all using (public.is_forward_admin()) with check (public.is_forward_admin());

-- Public member registration. Returns only the new member's own public-safe membership details.
create or replace function public.register_forward_member(
  p_first_name text,p_last_name text,p_email text,p_dob date,p_postcode text,p_city text,p_nation text,
  p_constituency text,p_branch text,p_phone text,p_volunteer boolean,p_comms boolean
)
returns table(id uuid, member_number text, first_name text, last_name text, email text, dob date, postcode text, city text, nation text, constituency text, branch text, join_date date, status text, volunteer boolean, comms boolean)
language plpgsql security definer set search_path=public
as $$
declare v_no text; v_id uuid;
begin
  if exists(select 1 from public.members m where lower(m.email::text)=lower(trim(p_email))) then
    raise exception 'That email is already registered.';
  end if;
  v_no := 'FWUK-2029-' || lpad(nextval('public.forward_member_number_seq')::text,6,'0');
  insert into public.members(client_id,member_number,first_name,last_name,email,dob,postcode,city,nation,constituency,branch,phone,status,volunteer,comms)
  values('mem-'||replace(gen_random_uuid()::text,'-',''),v_no,trim(p_first_name),trim(p_last_name),lower(trim(p_email)),p_dob,upper(trim(coalesce(p_postcode,''))),trim(coalesce(p_city,'')),p_nation,trim(coalesce(p_constituency,'')),trim(coalesce(p_branch,'')),trim(coalesce(p_phone,'')),'Active',coalesce(p_volunteer,false),coalesce(p_comms,true))
  returning members.id into v_id;
  return query select m.id,m.member_number,m.first_name,m.last_name,m.email::text,m.dob,m.postcode,m.city,m.nation,m.constituency,m.branch,m.join_date,m.status,m.volunteer,m.comms from public.members m where m.id=v_id;
end $$;

grant execute on function public.register_forward_member(text,text,text,date,text,text,text,text,text,text,boolean,boolean) to anon, authenticated;

create or replace function public.verify_forward_member(p_email text,p_member_number text)
returns table(id uuid, member_number text, first_name text, last_name text, email text, dob date, postcode text, city text, nation text, constituency text, branch text, join_date date, status text, volunteer boolean, comms boolean)
language sql security definer set search_path=public
as $$
  select m.id,m.member_number,m.first_name,m.last_name,m.email::text,m.dob,m.postcode,m.city,m.nation,m.constituency,m.branch,m.join_date,m.status,m.volunteer,m.comms
  from public.members m
  where lower(m.email::text)=lower(trim(p_email)) and upper(m.member_number)=upper(trim(p_member_number)) and m.status <> 'Former Member'
  limit 1;
$$;
grant execute on function public.verify_forward_member(text,text) to anon, authenticated;

create or replace function public.submit_forward_contact(p_first_name text,p_last_name text,p_email text,p_subject text,p_message text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if length(trim(coalesce(p_message,''))) < 2 then raise exception 'Message is required.'; end if;
  insert into public.contact_messages(client_id,first_name,last_name,email,subject,message)
  values('msg-'||replace(gen_random_uuid()::text,'-',''),trim(coalesce(p_first_name,'')),trim(coalesce(p_last_name,'')),lower(trim(p_email)),trim(coalesce(p_subject,'')),trim(p_message));
end $$;
grant execute on function public.submit_forward_contact(text,text,text,text,text) to anon, authenticated;

create or replace function public.public_party_stats()
returns table(members bigint,mps bigint,councillors bigint,mayors bigint,branches bigint,candidates bigint,constituencies bigint,volunteers bigint,representatives bigint,leadership bigint,documents bigint)
language sql stable security definer set search_path=public as $$
  select
    (select count(*) from public.members where status='Active'),
    (select count(*) from public.content_items where collection='representatives' and status='Active' and data->>'type'='MP'),
    (select count(*) from public.content_items where collection='representatives' and status='Active' and data->>'type'='Councillor'),
    (select count(*) from public.content_items where collection='representatives' and status='Active' and data->>'type'='Mayor'),
    (select count(*) from public.content_items where collection='branches' and status='Active'),
    (select count(*) from public.content_items where collection='candidates' and status='Active'),
    (select count(*) from public.content_items where collection='constituencies' and status='Active'),
    (select count(*) from public.members where status='Active' and volunteer=true),
    (select count(*) from public.content_items where collection='representatives' and status='Active'),
    (select count(*) from public.content_items where collection='leadership' and status='Active'),
    (select count(*) from public.content_items where collection='documents' and status='Published');
$$;
grant execute on function public.public_party_stats() to anon, authenticated;

-- Initial public settings. Organisation records intentionally remain ZERO.
insert into public.site_settings(key,value) values
('settings','{"partyName":"Forward UK","slogan":"Forward for Britain","campaignYear":"2029","contactEmail":"","contactPhone":"","address":"United Kingdom","xHandle":"","instagram":"","facebook":"","youtube":"","tiktok":"","footerText":"Forward for Britain.","maintenanceMode":false,"maintenanceMessage":"Forward UK is making improvements. Please check back shortly.","publicMembership":true,"memberPrefix":"FWUK","brand":{"azure":"#3454D1","turquoise":"#34D1BF","platinum":"#EFEFEF","black":"#070707"}}'::jsonb),
('hero','{"eyebrow":"FORWARD UK","title":"FORWARD FOR BRITAIN","year":"2029","copy":"Stronger communities. Better public services. Secure borders. Opportunity across Britain.","primaryLabel":"Join Free","primaryHref":"membership.html","secondaryLabel":"Explore our policies","secondaryHref":"policies.html"}'::jsonb),
('homepage','{"introTitle":"A stronger, fairer Britain.","introCopy":"Forward UK is building a modern political movement around practical policy, strong communities and public services that work.","showStats":true,"showPolicies":true,"showNews":true,"showEvents":true,"showMembership":true,"showPledge":true,"cards":[{"id":"hc1","title":"Policy Hub","copy":"Explore Forward UK policy as it is published.","icon":"document","href":"policies.html","image":""},{"id":"hc2","title":"Newsroom","copy":"Statements, updates and party news.","icon":"news","href":"news.html","image":""},{"id":"hc3","title":"Events","copy":"See public and member events.","icon":"calendar","href":"events.html","image":""},{"id":"hc4","title":"Free Membership","copy":"Join Forward UK for free.","icon":"badge","href":"membership.html","image":""},{"id":"hc5","title":"Local Branches","copy":"Find Forward UK activity near you.","icon":"pin","href":"branches.html","image":""},{"id":"hc6","title":"Documents","copy":"Read party documents and publications.","icon":"folder","href":"documents.html","image":""}]}'::jsonb),
('navigation','[{"label":"About","href":"about.html"},{"label":"Policies","href":"policies.html"},{"label":"News","href":"news.html"},{"label":"Events","href":"events.html"},{"label":"Membership","href":"membership.html"},{"label":"Local","href":"branches.html"}]'::jsonb)
on conflict (key) do nothing;

-- OPTIONAL: after creating an Auth user, promote it to admin with:
-- insert into public.profiles(user_id,role,display_name) values ('YOUR-AUTH-USER-UUID','admin','Forward UK Admin')
-- on conflict (user_id) do update set role='admin', display_name=excluded.display_name;

-- Realtime (safe to run once in Supabase):
-- alter publication supabase_realtime add table public.site_settings;
-- alter publication supabase_realtime add table public.content_items;
