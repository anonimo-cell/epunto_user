-- =========================================================================
-- VALORACIONES "ME GUSTA" / "NO ME GUSTA"
-- Pegar entero en Supabase > SQL Editor > Run (solo hace falta una vez)
-- =========================================================================

-- 1. Un voto por usuario y producto (así nadie puede votar dos veces)
create table if not exists public.valoraciones (
  producto_id bigint not null,
  user_id     uuid   not null default auth.uid() references auth.users(id) on delete cascade,
  voto        text   not null check (voto in ('me_gusta', 'no_gusta')),
  fecha       timestamptz not null default now(),
  primary key (producto_id, user_id)
);

-- Nadie escribe en la tabla directamente: solo a través de votar_producto().
-- Cada usuario solo puede leer sus propios votos (para marcar su botón).
alter table public.valoraciones enable row level security;

drop policy if exists "cada usuario ve sus votos" on public.valoraciones;
create policy "cada usuario ve sus votos" on public.valoraciones
  for select to authenticated
  using (user_id = auth.uid());

-- 2. Los contadores empiezan en 0 en lugar de vacíos
update public.verproductos set me_gusta = 0 where me_gusta is null;
update public.verproductos set no_gusta = 0 where no_gusta is null;

-- 3. Función para votar. p_voto: 'me_gusta', 'no_gusta' o null (quitar el voto).
--    Guarda el voto del usuario y recalcula las columnas me_gusta y no_gusta.
create or replace function public.votar_producto(p_producto_id bigint, p_voto text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usuario uuid := auth.uid();
  v_resultado json;
begin
  if v_usuario is null then
    raise exception 'Hay que iniciar sesión para votar';
  end if;

  if p_voto is null then
    delete from valoraciones
     where producto_id = p_producto_id and user_id = v_usuario;
  elsif p_voto in ('me_gusta', 'no_gusta') then
    insert into valoraciones (producto_id, user_id, voto)
    values (p_producto_id, v_usuario, p_voto)
    on conflict (producto_id, user_id)
    do update set voto = excluded.voto, fecha = now();
  else
    raise exception 'Voto no válido';
  end if;

  update verproductos
     set me_gusta = (select count(*) from valoraciones where producto_id = p_producto_id and voto = 'me_gusta'),
         no_gusta = (select count(*) from valoraciones where producto_id = p_producto_id and voto = 'no_gusta')
   where id = p_producto_id
  returning json_build_object('me_gusta', me_gusta, 'no_gusta', no_gusta) into v_resultado;

  return v_resultado;
end;
$$;

-- Solo los usuarios con sesión iniciada pueden llamarla
revoke execute on function public.votar_producto(bigint, text) from public, anon;
grant  execute on function public.votar_producto(bigint, text) to authenticated;
