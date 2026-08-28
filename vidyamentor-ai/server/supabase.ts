import { createClient } from '@supabase/supabase-js';
import { ApiRequest } from './http';

const serverUrl = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const publishableKey = () => process.env.SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const requireValue = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
};

const bearerToken = (request: ApiRequest) => {
  const value = request.headers.authorization;
  const header = Array.isArray(value) ? value[0] : value;
  return header?.startsWith('Bearer ') ? header.slice(7) : '';
};

export const createRequestSupabase = (request: ApiRequest) => {
  const token = bearerToken(request);
  if (!token) throw new Error('Please sign in to continue.');
  return createClient(
    requireValue(serverUrl(), 'SUPABASE_URL'),
    requireValue(publishableKey(), 'SUPABASE_PUBLISHABLE_KEY'),
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
};

export const createAdminSupabase = () => createClient(
  requireValue(serverUrl(), 'SUPABASE_URL'),
  requireValue(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
);

export const requireAuthenticatedUser = async (request: ApiRequest) => {
  const client = createRequestSupabase(request);
  const token = bearerToken(request);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error('Your session is invalid or expired. Please sign in again.');
  return { client, user: data.user, token };
};
