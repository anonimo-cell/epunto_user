-- Copia el perfil de cada cuenta nueva en la tabla 'usuarios' en cuanto el
-- usuario confirma su correo (con el código o con el enlace).
-- Los datos salen de los metadatos que manda la web al registrarse
-- (nombre, contacto, relacion, fundacion). La contraseña NO se copia:
-- la guarda Supabase Auth cifrada.
--
-- Ejecutar una vez en Supabase → SQL Editor.

create or replace function public.copiar_usuario_confirmado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (nombre, contacto, relacion, fundacion, fecha_envio)
  values (
    new.raw_user_meta_data ->> 'nombre',
    coalesce(new.raw_user_meta_data ->> 'contacto', new.email),
    new.raw_user_meta_data ->> 'relacion',
    new.raw_user_meta_data ->> 'fundacion',
    now()
  );
  return new;
end;
$$;

-- Al confirmar el correo (email_confirmed_at pasa de vacío a tener fecha)
drop trigger if exists al_confirmar_usuario on auth.users;
create trigger al_confirmar_usuario
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.copiar_usuario_confirmado();

-- Si algún día se desactiva "Confirm email", la cuenta nace ya confirmada
drop trigger if exists al_crear_usuario_confirmado on auth.users;
create trigger al_crear_usuario_confirmado
  after insert on auth.users
  for each row
  when (new.email_confirmed_at is not null)
  execute function public.copiar_usuario_confirmado();


-- ¿Ese correo ya tiene una cuenta confirmada? La usa el formulario de
-- registro para avisar del correo repetido junto con los demás errores.
-- Solo devuelve sí/no: no da acceso a ningún dato de la cuenta.
create or replace function public.correo_registrado(correo text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users
    where lower(email) = lower(trim(correo))
      and email_confirmed_at is not null
  );
$$;

grant execute on function public.correo_registrado(text) to anon, authenticated;
