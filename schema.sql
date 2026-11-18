-- Схема базы. Запускать можно повторно: все команды идемпотентны.
create sequence if not exists request_no_seq start 1001;

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists tariffs (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists admin (
  id int primary key default 1 check (id = 1),
  login text not null,
  password_hash text not null,
  session_version int not null default 1,
  updated_at timestamptz not null default now()
);
create table if not exists requests (
  id bigserial primary key,
  no int not null default nextval('request_no_seq'),
  token text not null unique,
  idem_key text unique,
  status text not null default 'new' check (status in ('new','ask','ok','done','cancel')),
  name text not null,
  phone text not null,
  branch text not null default '',
  pref_date date,
  pref_time text not null default '',
  comment text not null default '',
  consent_at timestamptz not null,
  pets jsonb not null,
  total_text text not null,
  total_min int not null default 0,
  final_price text not null default '',
  final_time timestamptz,
  internal_note text not null default '',
  ip_hash text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists requests_created_idx on requests (created_at desc);
create index if not exists requests_status_idx on requests (status);
create table if not exists request_photos (
  id bigserial primary key,
  request_id bigint not null references requests(id) on delete cascade,
  mime text not null,
  data bytea not null,
  created_at timestamptz not null default now()
);
create index if not exists request_photos_req_idx on request_photos (request_id);
create table if not exists telegram (
  id int primary key default 1 check (id = 1),
  chat_id bigint,
  chat_title text not null default '',
  link_code text,
  link_code_expires timestamptz,
  linked_at timestamptz
);
create table if not exists rate_events (
  key text not null,
  at timestamptz not null default now()
);
create index if not exists rate_events_idx on rate_events (key, at);
insert into settings (id) values (1) on conflict do nothing;
insert into tariffs (id) values (1) on conflict do nothing;
insert into telegram (id) values (1) on conflict do nothing;
