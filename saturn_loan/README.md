# Saturn Loan

Web local para gestionar una colección de videojuegos y préstamos entre amigos.

## Qué incluye

- Catálogo de juegos.
- Filtros por plataforma y disponibilidad.
- Alta, edición y eliminación de juegos desde el modo administrador.
- Registro de préstamos con persona, fecha de salida, duración y fecha de devolución.
- Detección automática de préstamos atrasados.
- Cálculo de recargo recomendado por retraso.
- Servicios de modificación/homebrew y mantenimiento.
- Diseño responsive para ordenador y móvil.
- Persistencia con `localStorage`.

## Cómo abrirla

1. Descarga la carpeta.
2. Abre `index.html` con Chrome, Edge o Firefox.
3. Para entrar como administrador, usa la clave de demostración:

`SATURNO2000`

## Importante sobre la versión actual

Esta versión es un **prototipo local**. Los datos se guardan en el navegador mediante `localStorage`.
Eso significa que no existe todavía una base de datos compartida ni una autenticación segura de verdad.

Si la vas a publicar para que funcione desde varios dispositivos, el siguiente paso recomendable es añadir:

- backend y base de datos (por ejemplo, Supabase/Firebase);
- usuarios reales con roles `admin` y `friend`;
- registro de amigos;
- control de pagos;
- copias de seguridad;
- fotografías de portadas;
- historial completo de cada juego;
- panel móvil para marcar devoluciones.

## Modelo de negocio recomendado

Para un club pequeño entre amigos recomiendo evitar una suscripción.

### Préstamos
- 1 € → 7 días.
- 2 € → 14 días.
- 3 € → 30 días.
- Retraso → 0,50 €/día, con un máximo de 5 €.
- Para amigos de mucha confianza se puede perdonar el recargo si avisan y devuelven el juego.
- En juegos caros, una fianza pequeña (5–10 €) puede utilizarse como garantía y se devuelve al entregar el juego en buen estado.

La idea es que el precio cubra mantenimiento, desgaste, transporte y reposición, no convertirlo en un videoclub tradicional.

### Servicios
Precios orientativos para tu propio proyecto:
- Wii → desde 10 €
- Wii U → desde 15 €
- DS → desde 10 €
- 3DS → desde 15 €
- 2DS → desde 15 €
- PSP → desde 15 €
- PS Vita → desde 20 €
- Mantenimiento/revisión → desde 5 €

Los servicios de modificación están planteados para **consolas propiedad del cliente y usos legales de homebrew**. No se incluyen ROMs, juegos pirateados ni contenido no autorizado.

## Nombre

He mantenido **Saturn Loan** porque encaja bien con el concepto: Saturn + préstamos.
