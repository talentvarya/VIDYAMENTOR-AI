export interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export const readBody = <T>(request: ApiRequest): T => {
  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body) as T;
    } catch {
      throw new Error('Invalid JSON body.');
    }
  }
  return (request.body ?? {}) as T;
};

export const sendError = (response: ApiResponse, status: number, message: string) => {
  response.status(status).json({ error: message });
};

export const allowPostOnly = (request: ApiRequest, response: ApiResponse) => {
  response.setHeader('Allow', 'POST');
  if (request.method !== 'POST') {
    sendError(response, 405, 'Method not allowed.');
    return false;
  }
  return true;
};

export const normalizeEmail = (value: unknown) => String(value ?? '').trim().toLowerCase();

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
