## Integración Book Now → Google Calendar (Vercel)

Esta implementación crea un evento en el **Google Calendar del estudio** cada vez que un usuario completa “Book Now”.

### 1) Crear Service Account

- En Google Cloud Console crea un proyecto y habilita **Google Calendar API**.
- Crea una **Service Account** y genera una key.
- Copia:
  - **Client email** (ej: `xxx@yyy.iam.gserviceaccount.com`)
  - **Private key**

### 2) Compartir el calendario con la Service Account

En Google Calendar (del estudio):
- Settings → “Share with specific people”
- Agrega el **client email** de la service account
- Permiso: **Make changes to events**

### 3) Variables de entorno en Vercel

En Vercel → Project → Settings → Environment Variables:

- `GOOGLE_CALENDAR_ID`  
  - Puede ser el email del calendario o el Calendar ID (Settings → “Integrate calendar”).
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
  - Pega el private key tal cual (Vercel lo guarda como string; el código soporta `\n`).
- `ALLOWED_ORIGIN` (opcional pero recomendado)
  - Ej: `https://tu-dominio.com`
- `STUDIO_NOTIFICATION_EMAIL` (opcional)
  - Email del dueño para notificaciones internas de reserva.
- `RESEND_API_KEY` (opcional, recomendado)
  - API key de Resend para enviar confirmaciones.
- `RESEND_FROM_EMAIL` (opcional, recomendado)
  - Remitente verificado en Resend (ej: `Spiral Bookings <bookings@tu-dominio.com>`).

### 4) Endpoint

El frontend llama a:
- `POST /api/create-booking-event`

Payload (JSON):
- `plan`: `"weekday"` o `"weekend"`
- `hours`: número
- `date`: `"YYYY-MM-DD"`
- `time`: `"7:00 AM"`
- `firstName`, `lastName`, `phone`, `email`

### 4.1) Endpoint de diagnóstico (owner calendar)

Para validar por qué no se crea el evento en el calendario del propietario:

- `GET /api/calendar-diagnostics`
  - Revisa env vars, private key y acceso `freebusy` al `GOOGLE_CALENDAR_ID`.
- `GET /api/calendar-diagnostics?checkWrite=1`
  - Además intenta crear y borrar un evento temporal para confirmar permiso de escritura real.

Respuestas útiles:
- `stage: "env"` → faltan variables.
- `stage: "private_key"` → formato inválido en `GOOGLE_PRIVATE_KEY`.
- `stage: "calendar_access"` → la service account no tiene acceso al calendario configurado.
- `stage: "write_permission"` → puede leer, pero no puede crear eventos en ese calendario.

### 5) Comportamiento en frontend

- Si el evento se crea correctamente, se muestra un link **“VER EN GOOGLE CALENDAR”**.
- Si falla, se usa el fallback existente de `mailto:` para no perder la reserva.

### 6) Invitaciones por correo (limitación de service account)

Sin **domain-wide delegation** en Google Workspace, una service account **no puede** añadir `attendees` ni enviar invitaciones de Calendar.

El evento se crea en el calendario compartido con **cliente y datos de contacto en la descripción**. Para correos automáticos al cliente, usa otro canal (por ejemplo el flujo `mailto:` del sitio o un servicio de email).

### 7) Correos de confirmación con Resend

Si defines `RESEND_API_KEY` y `RESEND_FROM_EMAIL`, el backend enviará:

- Email al dueño (`STUDIO_NOTIFICATION_EMAIL`)
- Email al cliente (`email` del formulario)

El envío es **no bloqueante**: si falla Resend, la reserva igual se mantiene en Calendar y el error se registra en logs.

