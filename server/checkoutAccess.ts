import { timingSafeEqual } from 'node:crypto';

function isEnabled(value) {
  const v = String(value ?? '')
    .trim()
    .toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function readHeader(req, name) {
  const rawName = String(name ?? '').trim();
  if (!rawName) return '';

  const lower = rawName.toLowerCase();
  const value = req?.headers?.[lower] ?? req?.headers?.[rawName];
  if (Array.isArray(value)) return String(value[0] || '').trim();
  return String(value || '').trim();
}

function safeTokenEquals(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function readBearerToken(req) {
  const auth = readHeader(req, 'authorization');
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? String(m[1] || '').trim() : '';
}

async function verifySupabaseToken(accessToken) {
  const supabaseUrl = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const supabaseAnonKey = String(
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
  ).trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, status: 500, error: 'Supabase auth is misconfigured.' };
  }

  const endpoint = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/user`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return { ok: false, status: 401, error: 'Unauthorized request.' };
  }

  const data = await response.json().catch(() => null);
  if (!data?.id) {
    return { ok: false, status: 401, error: 'Unauthorized request.' };
  }

  return { ok: true, status: 200, userId: String(data.id) };
}

export async function validateCheckoutAccess(req) {
  const requireSupabaseAuth = isEnabled(
    process.env.REQUIRE_BOOKING_SUPABASE_AUTH || process.env.REQUIRE_BOOKING_AUTH
  );
  const requireHeaderSecret = isEnabled(process.env.REQUIRE_CHECKOUT_HEADER_SECRET);

  if (requireSupabaseAuth) {
    const token = readBearerToken(req);
    if (!token) {
      return { ok: false, status: 401, error: 'Authentication required.' };
    }
    const verified = await verifySupabaseToken(token);
    if (!verified.ok) return verified;
  }

  if (requireHeaderSecret) {
    const headerName = String(process.env.CHECKOUT_HEADER_SECRET_NAME || 'x-checkout-secret').trim();
    const expected = String(process.env.CHECKOUT_HEADER_SECRET || '').trim();
    if (!expected) {
      return { ok: false, status: 500, error: 'Checkout header secret is misconfigured.' };
    }
    const provided = readHeader(req, headerName);
    if (!provided || !safeTokenEquals(provided, expected)) {
      return { ok: false, status: 401, error: 'Invalid checkout security header.' };
    }
  }

  return { ok: true, status: 200 };
}

