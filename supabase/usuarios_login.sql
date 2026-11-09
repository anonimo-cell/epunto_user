-- =========================================================================
-- INICIAR SESIÓN CON CORREO O CON NOMBRE DE USUARIO
-- y NOMBRES DE USUARIO ÚNICOS
--
-- Ejecutar una vez en Supabase → SQL Editor.
-- El nombre de usuario se guarda al registrarse en los metadatos de la
-- cuenta (raw_user_meta_data ->> 'nombre').
-- Mayúsculas y espacios de los extremos no cuentan: "Ana" y " ana " son
-- el mismo usuario.
-- =========================================================================


-- 0. ANTES DE NADA: ¿hay ya nombres repetidos? (si sale alguna fila, hay que
--    cambiar el nombre a una de esas cuentas desde Authentication → Users)
--
-- select lower(trim(raw_user_meta_data ->> 'nombre')) as nombre, count(*)
--   from auth.users
--  where raw_user_meta_data ->> 'nombre' is not null
--  group by 1
-- having count(*) > 1;


-- 1. ¿Ese nombre de usuario ya está cogido? La usa el formulario de
--    registro para avisar. Solo devuelve sí/no.
create or replace function public.usuario_registrado(nombre_usuario text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users
     where lower(trim(raw_user_meta_data ->> 'nombre')) = lower(trim(nombre_usuario))
       and email_confirmed_at is not null
  );
$$;

grant execute on function public.usuario_registrado(text) to anon, authenticated;


-- 2. Correo de la cuenta de un nombre de usuario, para poder iniciar sesión
--    con él. SOLO lo devuelve si la contraseña es la de esa cuenta: así
--    nadie puede averiguar el correo de otra persona sabiendo su nombre.
--    También vale para las cuentas antiguas (nombre@epunto.com).
create or replace function public.correo_de_usuario(nombre_usuario text, contrasena text)
returns text
language sql
security definer
set search_path = ''
as $$
  select u.email
    from auth.users u
   where (
           lower(trim(u.raw_user_meta_data ->> 'nombre')) = lower(trim(nombre_usuario))
           or lower(u.email) = lower(regexp_replace(nombre_usuario, '\s+', '', 'g')) || '@epunto.com'
         )
     and u.encrypted_password is not null
     and u.encrypted_password = extensions.crypt(contrasena, u.encrypted_password)
   limit 1;
$$;

grant execute on function public.correo_de_usuario(text, text) to anon, authenticated;


-- 3. La base de datos no deja crear una cuenta con un nombre que ya tiene
--    otra cuenta confirmada (aunque alguien se salte la comprobación de la web)
create or replace function public.impedir_usuario_repetido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'nombre' is not null and exists (
    select 1 from auth.users
     where id <> new.id
       and email_confirmed_at is not null
       and lower(trim(raw_user_meta_data ->> 'nombre')) = lower(trim(new.raw_user_meta_data ->> 'nombre'))
  ) then
    raise exception 'usuario_repetido: ese nombre de usuario ya existe';
  end if;
  return new;
end;
$$;

drop trigger if exists antes_de_crear_usuario on auth.users;
create trigger antes_de_crear_usuario
  before insert on auth.users
  for each row
  execute function public.impedir_usuario_repetido();
