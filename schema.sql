-- Brandroom (cloud) database. Run once in the Supabase SQL editor.
-- Only brand knowledge lives here; the SEO app keeps its own separate database.

create table if not exists users (
  id            bigserial primary key,
  email         text not null unique,
  name          text,
  role          text not null default 'staff' check (role in ('admin','head','staff')),
  pass_hash     text,                       -- null when the person only signs in with Microsoft
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz
);

create table if not exists sessions (
  token      text primary key,
  user_id    bigint not null references users(id) on delete cascade,
  expires    timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_expires_idx on sessions(expires);

create table if not exists clients (
  id              bigserial primary key,
  slug            text not null unique,
  name            text not null unique,
  industry        text not null default '',
  location        text not null default '',
  lead            text not null default '',
  colour          text not null default '#526bc4',
  status          text not null default 'active' check (status in ('active','archived')),
  fields          jsonb not null default '{}'::jsonb,   -- the Brandroom section fields, one string per key
  internal_fields jsonb not null default '[]'::jsonb,   -- field keys hidden from the writing context
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  updated_by      bigint references users(id) on delete set null
);
create index if not exists clients_status_idx on clients(status);

create table if not exists examples (
  id         bigserial primary key,
  client_id  bigint not null references clients(id) on delete cascade,
  platform   text not null default 'Instagram',
  language   text not null default 'English',
  verdict    text not null default 'approved' check (verdict in ('approved','rejected')),
  body       text not null,
  reason     text not null default '',
  featured   boolean not null default false,
  internal   boolean not null default false,
  added_by   bigint references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists examples_client_idx on examples(client_id);

create table if not exists refs (
  id          bigserial primary key,
  client_id   bigint not null references clients(id) on delete cascade,
  kind        text not null default 'Reference',
  name        text not null default 'Reference',
  description text not null default '',
  path        text not null,               -- object path inside the Supabase Storage bucket
  mime        text not null default 'image/webp',
  size        integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists refs_client_idx on refs(client_id);

create table if not exists activity (
  id         bigserial primary key,
  client_id  bigint references clients(id) on delete set null,
  user_id    bigint references users(id) on delete set null,
  actor      text not null default 'Workspace admin',
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists activity_created_idx on activity(created_at desc);

-- Every request goes through the app's own API with the service key, never from the browser,
-- so no table is readable with Supabase's public key.
alter table users       enable row level security;
alter table sessions    enable row level security;
alter table clients     enable row level security;
alter table examples    enable row level security;
alter table refs        enable row level security;
alter table activity    enable row level security;

-- Documents attached to a client. The text is pulled out on upload and becomes part of the
-- brand knowledge the Caption Bot reads, unless the document is marked internal.
create table if not exists documents (
  id         bigserial primary key,
  client_id  bigint not null references clients(id) on delete cascade,
  name       text not null,
  mime       text not null default 'application/pdf',
  size       integer not null default 0,
  path       text not null,                  -- object path in storage
  body       text not null default '',       -- the text read out of the file
  chars      integer not null default 0,
  pages      integer,
  status     text not null default 'ready' check (status in ('ready','no_text','failed')),
  note       text not null default '',       -- why it could not be read, when that happens
  internal   boolean not null default false, -- true = kept from the bot
  added_by   bigint references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists documents_client_idx on documents(client_id);
alter table documents enable row level security;

-- Counts failed sign-in attempts and wrong API keys, so guessing can be slowed down.
-- Kept in the database because a serverless site cannot share memory between its copies.
create table if not exists login_attempts (
  key          text primary key,            -- "login:<email>", "ip:<address>" or "kb:<address>"
  n            integer not null default 0,
  window_start timestamptz not null default now()
);
alter table login_attempts enable row level security;
