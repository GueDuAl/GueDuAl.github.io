# Saturn Loan — versión online

Esta versión corrige el problema de que los juegos añadidos solo aparezcan en el ordenador que los creó.

## Qué cambia

La versión antigua utilizaba `localStorage`, que pertenece al navegador/dispositivo de cada usuario. Por eso:
- el ordenador A podía guardar un juego;
- el ordenador B no podía verlo;
- el modo incógnito tampoco veía los datos del navegador normal.

Ahora Saturn Loan utiliza una base de datos central de **Supabase**. Todos los navegadores consultan la misma colección online.

## Archivos

- `index.html` → página.
- `styles.css` → diseño.
- `app.js` → funcionamiento.
- `config.js` → conexión con Supabase.
- `supabase.sql` → tablas, permisos, datos iniciales y Realtime.

## Configuración paso a paso

### 1. Crear el proyecto

Crea un proyecto gratuito en Supabase.

En el proyecto busca los datos de conexión y copia:
- Project URL.
- Publishable Key.

La librería JavaScript de Supabase se puede utilizar directamente desde un navegador y necesita esa URL y esa clave pública. **No uses la `service_role` key en la web.** citeturn348234search0turn348234search2

### 2. Crear las tablas

Abre `SQL Editor` en Supabase, crea una consulta nueva, pega TODO el contenido de:

`supabase.sql`

y ejecútalo.

El SQL crea:
- `games`
- `loans`
- `profiles`

y las reglas de Row Level Security.

Las reglas hacen que el catálogo pueda ser leído por visitantes, pero que insertar, editar o eliminar juegos requiera una cuenta autenticada cuyo perfil tenga `role = 'admin'`. Supabase recomienda usar RLS para controlar estos permisos en las tablas expuestas por su Data API. citeturn348234search1turn348234search4

### 3. Crear tu cuenta de administrador

En Supabase entra en:

`Authentication → Users`

Crea el usuario que utilizarás para administrar Saturn Loan, con correo y contraseña.

Copia el UUID de ese usuario.

Después, en el SQL Editor ejecuta:

```sql
update public.profiles
set role = 'admin'
where id = 'EL-UUID-DE-TU-USUARIO';
```

El usuario tendrá entonces permisos de administrador.

### 4. Conectar la web

Abre `config.js`.

Cambia:

```js
window.saturnLoanConfig = {
  supabaseUrl: "https://TU-PROYECTO.supabase.co",
  supabasePublishableKey: "TU-PUBLISHABLE-KEY"
};
```

por los datos reales de tu proyecto.

No pongas aquí la `service_role` key.

### 5. Publicar

Puedes subir la carpeta a un hosting estático (por ejemplo GitHub Pages, Cloudflare Pages o Netlify).

No necesitas instalar Node para esta versión: la web usa la librería oficial de Supabase desde CDN. citeturn348234search4

## Resultado

Con esto:
- añades `Mario Kart` desde tu ordenador;
- otro ordenador abre Saturn Loan;
- consulta la misma base de datos;
- `Mario Kart` aparece también allí.

Además, los cambios de catálogo y préstamos pueden actualizarse entre navegadores mediante Realtime. El SQL ya añade las tablas a `supabase_realtime`.

## Seguridad

La contraseña ya no está escrita dentro de `app.js`.

La autorización real se hace en Supabase mediante:
- Supabase Auth.
- perfil de usuario.
- rol `admin`.
- Row Level Security.

Esto evita que simplemente modificando el JavaScript del navegador alguien pueda saltarse las reglas de la base de datos.

## Nota sobre el funcionamiento sin internet

La web necesita conexión a internet para consultar la base de datos. Eso es necesario si quieres que varios ordenadores compartan exactamente el mismo catálogo.
