-- Spouse Speak Phase 3 schema for Supabase/Postgres
create extension if not exists pgcrypto;

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null check (invite_code ~ '^[0-9]{6}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  communication_style text not null default 'direct',
  joined_at timestamptz not null default now(),
  primary key(couple_id,user_id)
);
create table if not exists public.messages (
  id uuid primary key,
  couple_id uuid not null references public.couples(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  original_text text not null,
  translated_text text not null,
  created_at timestamptz not null default now()
);

alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.messages enable row level security;

create or replace function public.is_couple_member(cid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.couple_members where couple_id=cid and user_id=auth.uid())
$$;

create policy "members read couples" on public.couples for select using (public.is_couple_member(id) or created_by=auth.uid());
create policy "members read members" on public.couple_members for select using (public.is_couple_member(couple_id));
create policy "members read messages" on public.messages for select using (public.is_couple_member(couple_id));
create policy "members send messages" on public.messages for insert with check (sender_id=auth.uid() and public.is_couple_member(couple_id));

create or replace function public.create_couple(invite_code text, display_name text, communication_style text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare cid uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into couples(invite_code,created_by) values(invite_code,auth.uid()) returning id into cid;
 insert into couple_members values(cid,auth.uid(),display_name,communication_style,now());
 return jsonb_build_object('couple_id',cid);
end $$;

create or replace function public.join_couple(invite_code text, display_name text, communication_style text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare cid uuid; count_members int;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select id into cid from couples where couples.invite_code=join_couple.invite_code;
 if cid is null then raise exception 'Invalid pairing code'; end if;
 select count(*) into count_members from couple_members where couple_id=cid;
 if count_members>=2 then raise exception 'This couple is already paired'; end if;
 insert into couple_members values(cid,auth.uid(),display_name,communication_style,now());
 return jsonb_build_object('couple_id',cid);
end $$;

grant execute on function public.create_couple(text,text,text) to authenticated;
grant execute on function public.join_couple(text,text,text) to authenticated;
alter publication supabase_realtime add table public.messages;
