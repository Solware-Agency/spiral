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
  - Reservado para otros flujos; las invitaciones de Calendar no salen por service account sin domain-wide delegation.

### 4) Endpoint

El frontend llama a:
- `POST /api/create-booking-event`

Payload (JSON):
- `plan`: `"weekday"` o `"weekend"`
- `hours`: número
- `date`: `"YYYY-MM-DD"`
- `time`: `"7:00 AM"`
- `firstName`, `lastName`, `phone`, `email`

### 5) Comportamiento en frontend

- Si el evento se crea correctamente, se muestra un link **“VER EN GOOGLE CALENDAR”**.
- Si falla, se usa el fallback existente de `mailto:` para no perder la reserva.

### 6) Invitaciones por correo (limitación de service account)

Sin **domain-wide delegation** en Google Workspace, una service account **no puede** añadir `attendees` ni enviar invitaciones de Calendar.

El evento se crea en el calendario compartido con **cliente y datos de contacto en la descripción**. Para correos automáticos al cliente, usa otro canal (por ejemplo el flujo `mailto:` del sitio o un servicio de email).

