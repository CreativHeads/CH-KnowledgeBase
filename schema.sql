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

-- v2.1: client libraries, agency libraries, skills, bot keys, onboarding.
-- Safe to run again. Nothing here removes existing brand data.

alter table refs add column if not exists verdict text not null default '';
alter table refs add column if not exists why text not null default '';
alter table refs add column if not exists onedrive_url text not null default '';
alter table refs add column if not exists platform text not null default '';
alter table refs add column if not exists posted_on date;

create table if not exists agency_items (
  id           bigserial primary key,
  library      text not null check (library in ('qc','template','sop','media')),
  title        text not null,
  body         text not null default '',
  meta         jsonb not null default '{}'::jsonb,
  status       text not null default 'draft' check (status in ('draft','approved')),
  approved_by  bigint references users(id) on delete set null,
  approved_at  timestamptz,
  updated_by   bigint references users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists agency_items_library_idx on agency_items(library, status);
alter table agency_items enable row level security;

create table if not exists skills (
  id               bigserial primary key,
  slug             text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name             text not null,
  category         text not null default '',
  description      text not null default '',
  used_by          text not null default '',
  live_version_id  bigint,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table skills enable row level security;

create table if not exists skill_versions (
  id            bigserial primary key,
  skill_id      bigint not null references skills(id) on delete cascade,
  version       integer not null check (version > 0),
  body_md       text not null,
  change_note   text not null default '',
  status        text not null default 'draft' check (status in ('draft','in_review','approved','retired')),
  content_hash  text not null default '',
  drafted_by    bigint references users(id) on delete set null,
  approved_by   bigint references users(id) on delete set null,
  approved_at   timestamptz,
  created_at    timestamptz not null default now(),
  unique (skill_id, version)
);
create index if not exists skill_versions_skill_idx on skill_versions(skill_id, version desc);
alter table skill_versions enable row level security;

create table if not exists skill_reviews (
  id          bigserial primary key,
  version_id  bigint not null references skill_versions(id) on delete cascade,
  user_id     bigint references users(id) on delete set null,
  decision    text not null check (decision in ('approve','request_changes')),
  comment     text not null default '',
  created_at  timestamptz not null default now()
);
alter table skill_reviews enable row level security;

create table if not exists api_keys (
  id                  bigserial primary key,
  name                text not null,
  key_prefix          text not null,
  key_hash            text not null unique,
  scopes              text[] not null default '{}',
  all_clients         boolean not null default true,
  rate_limit_per_min  integer not null default 60 check (rate_limit_per_min between 1 and 600),
  expires_at          timestamptz,
  active              boolean not null default true,
  revoked_at          timestamptz,
  last_used_at        timestamptz,
  created_by          bigint references users(id) on delete set null,
  created_at          timestamptz not null default now()
);
alter table api_keys enable row level security;

create table if not exists api_access_log (
  id           bigserial primary key,
  api_key_id   bigint references api_keys(id) on delete set null,
  key_prefix   text not null default '',
  endpoint     text not null,
  client_slug  text,
  status_code  integer not null,
  error        text,
  ip           text,
  created_at   timestamptz not null default now()
);
create index if not exists api_access_log_key_idx on api_access_log(api_key_id, created_at desc);
alter table api_access_log enable row level security;

create table if not exists alias_suggestions (
  id          bigserial primary key,
  client_id   bigint not null references clients(id) on delete cascade,
  suggestion  text not null,
  source      text not null default 'ocr',
  status      text not null default 'pending' check (status in ('pending','accepted','rejected')),
  decided_by  bigint references users(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (client_id, suggestion)
);
alter table alias_suggestions enable row level security;

create table if not exists settings (
  key    text primary key,
  value  jsonb not null
);
alter table settings enable row level security;
insert into settings(key, value) values ('ai_monthly_cap_usd', '25')
on conflict (key) do nothing;

create table if not exists ai_usage_log (
  id             bigserial primary key,
  api_key_id     bigint references api_keys(id) on delete set null,
  client_slug    text,
  model          text not null default '',
  purpose        text not null default '',
  skill_slug     text,
  skill_version  integer,
  status         text not null default 'reserved' check (status in ('reserved','done','failed')),
  est_cost_usd   numeric(12,5) not null default 0,
  cost_usd       numeric(12,5),
  created_at     timestamptz not null default now(),
  completed_at   timestamptz
);
alter table ai_usage_log enable row level security;

create table if not exists onboarding_sessions (
  id             bigserial primary key,
  client_id      bigint references clients(id) on delete set null,
  business_name  text not null,
  website        text not null default '',
  instagram      text not null default '',
  business_type  text not null default '',
  status         text not null default 'interviewing' check (status in ('interviewing','reviewing','completed','abandoned')),
  question_index integer not null default 0,
  drafts         jsonb not null default '[]'::jsonb,
  started_by     bigint references users(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table onboarding_sessions enable row level security;


-- v2.2: AI intake. What was read, what was learned from it, and the conversation, so the assistant remembers.
-- Which person or AI set each field, where it came from, and what it replaced (for "undo").
alter table clients add column if not exists field_meta jsonb not null default '{}'::jsonb;
-- The client's whole knowledge base, written as one document from everything the assistant has read.
alter table clients add column if not exists kb_doc text not null default '';
alter table clients add column if not exists kb_doc_at timestamptz;
alter table clients add column if not exists kb_sources jsonb not null default '[]'::jsonb;  -- which sources the document already includes

create table if not exists intake_sources (
  id          bigserial primary key,
  client_id   bigint not null references clients(id) on delete cascade,
  kind        text not null check (kind in ('website','document','note')),
  title       text not null,
  url         text,
  document_id bigint references documents(id) on delete set null,
  status      text not null default 'done' check (status in ('done','empty','failed')),
  summary     text not null default '',
  facts_count integer not null default 0,
  note        text not null default '',
  created_by  bigint references users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists intake_sources_client_idx on intake_sources(client_id, created_at desc);

create table if not exists intake_messages (
  id         bigserial primary key,
  client_id  bigint not null references clients(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  kind       text not null default 'text',
  body       text not null default '',
  payload    jsonb not null default '{}'::jsonb,
  created_by bigint references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists intake_messages_client_idx on intake_messages(client_id, id);

create table if not exists intake_state (
  client_id  bigint primary key references clients(id) on delete cascade,
  pending    jsonb,                                  -- the question waiting for an answer
  skipped    jsonb not null default '[]'::jsonb,     -- fields the person chose not to answer
  updated_at timestamptz not null default now()
);

alter table intake_state   add column if not exists queue jsonb not null default '[]'::jsonb;   -- follow-up questions waiting to be asked
alter table intake_state   add column if not exists planned jsonb not null default '{}'::jsonb; -- when the questions were last worked out
alter table intake_sources add column if not exists body text not null default '';          -- the text that was read, kept as the assistant's memory
alter table intake_state   add column if not exists searched jsonb not null default '{}'::jsonb; -- which gaps were already looked up in memory

alter table intake_sources  enable row level security;
alter table intake_messages enable row level security;
alter table intake_state    enable row level security;