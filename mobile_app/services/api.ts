import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Centralised API layer for the mobile app.
 *
 * Shares the exact same Express/MongoDB backend as `client/` (no Firebase).
 * - Base URL comes from `EXPO_PUBLIC_API_URL` (see `mobile_app/.env`).
 * - Automatically attaches `Authorization: Bearer <token>` from SecureStore
 *   and always sends `x-platform: mobile` so the server can record logins.
 * - Tracks requests that take longer than {@link SLOW_REQUEST_MS} so the UI
 *   can show a "Waking up server..." banner during Render free-tier cold starts.
 */

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://industrial-ai-dig7.onrender.com/api/v1';

/** Server origin with the trailing `/api/v1` stripped (used for static assets). */
const SERVER_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Turn a stored asset path (e.g. `/uploads/avatar.png`) into a full URL by
 * prefixing the server origin. Full `http(s)://` URLs are returned unchanged.
 */
export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

const TOKEN_KEY = 'industrial_ai_token';

/** A request longer than this (ms) is treated as a cold-start. */
export const SLOW_REQUEST_MS = 3000;

// ---------------------------------------------------------------------------
// Secure token storage
// ---------------------------------------------------------------------------

export const tokenStore = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async set(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

// ---------------------------------------------------------------------------
// Slow-request (Render cold start) tracking
// ---------------------------------------------------------------------------

type SlowListener = (isSlow: boolean) => void;
const slowListeners = new Set<SlowListener>();
let slowCount = 0;

function notifySlow(): void {
  const isSlow = slowCount > 0;
  slowListeners.forEach((listener) => listener(isSlow));
}

/** Subscribe to global slow-request state. Returns an unsubscribe function. */
export function subscribeToSlowRequests(listener: SlowListener): () => void {
  slowListeners.add(listener);
  listener(slowCount > 0);
  return () => {
    slowListeners.delete(listener);
  };
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  /** JSON body (ignored when `formData` is provided). */
  body?: unknown;
  /** Multipart body — lets fetch set the boundary header itself. */
  formData?: FormData;
  /** Attach the bearer token (default `true`). */
  auth?: boolean;
}

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(', ');
  }
  return fallback;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, formData, auth = true } = options;

  const headers: Record<string, string> = { 'x-platform': 'mobile' };

  if (auth) {
    const token = await tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

  let slowFired = false;
  const timer = setTimeout(() => {
    slowFired = true;
    slowCount += 1;
    notifySlow();
  }, SLOW_REQUEST_MS);

  try {
    const response = await fetch(url, { method, headers, body: payload });
    const text = await response.text();
    const data = text ? safeParse(text) : null;

    if (!response.ok) {
      throw new ApiError(
        extractMessage(data, `Request failed (${response.status})`),
        response.status,
        data
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      0,
      null
    );
  } finally {
    clearTimeout(timer);
    if (slowFired) {
      slowCount = Math.max(0, slowCount - 1);
      notifySlow();
    }
  }
}

// ---------------------------------------------------------------------------
// Shared response shapes (mirror the server envelope `{ success, data }`)
// ---------------------------------------------------------------------------

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
  provider?: string;
  isEmailVerified?: boolean;
  lastLoginAt?: string | null;
  lastLoginPlatform?: 'web' | 'mobile';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResult {
  token: string;
  user: ApiUser;
}

export interface ApiDocument {
  _id: string;
  title: string;
  description?: string;
  originalFileName?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  fileType?: string;
  status?: string;
  uploader?: string;
  views?: number;
  downloads?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyticsMetrics {
  totalLogins: number;
  activeUsers: number;
  totalDocuments: number;
  uploadsToday: number;
  viewsThisWeek: number;
}

export interface PieDatum {
  name: string;
  value: number;
}

export interface GrowthDatum {
  year: string;
  valueDegradation: number;
  companyGrowth: number;
}

export interface AnalysisResult {
  summary: string;
  pieChartData: PieDatum[];
  growthAndDegradationData: GrowthDatum[];
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/** React Native file descriptor for `multipart/form-data` uploads. */
export interface UploadableFile {
  uri: string;
  name: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Endpoint groups
// ---------------------------------------------------------------------------

export const authApi = {
  async login(email: string, password: string): Promise<AuthResult> {
    const res = await request<Envelope<{ user: ApiUser; accessToken: string }>>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    return { token: res.data.accessToken, user: res.data.user };
  },

  async register(payload: RegisterPayload): Promise<AuthResult> {
    const res = await request<Envelope<{ user: ApiUser; accessToken: string }>>('/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    });
    return { token: res.data.accessToken, user: res.data.user };
  },

  async me(): Promise<ApiUser> {
    const res = await request<Envelope<ApiUser>>('/auth/me');
    return res.data;
  },

  async updateProfile(payload: Partial<Pick<ApiUser, 'name' | 'email' | 'department'>>): Promise<ApiUser> {
    const res = await request<Envelope<ApiUser>>('/auth/me', { method: 'PUT', body: payload });
    return res.data;
  },

  async logout(): Promise<void> {
    await request<Envelope<null>>('/auth/logout', { method: 'POST' });
  },
};

/**
 * Recursively locate the first document array inside a server payload.
 *
 * The backend's `GET /documents` envelope is
 * `{ success: true, data: { data: Document[], pagination: {...} } }`
 * (see `server/controllers/documentController.js` +
 * `server/repositories/BaseRepository.js#findAll`), but this walks any of the
 * shapes we may encounter: a bare array, `{ data: [...] }`,
 * `{ data: { documents: [...] } }`, `{ documents: [...] }`, etc.
 */
function extractDocumentArray(payload: unknown): ApiDocument[] | null {
  if (Array.isArray(payload)) return payload as ApiDocument[];
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  for (const key of ['data', 'documents', 'items', 'results', 'list', 'payload', 'result']) {
    const found = extractDocumentArray(record[key]);
    if (found) return found;
  }
  return null;
}

export const documentsApi = {
  list: async (): Promise<ApiDocument[]> => {
    const res = await request<unknown>('/documents');
    return extractDocumentArray(res) ?? [];
  },

  async getById(id: string): Promise<ApiDocument> {
    const res = await request<Envelope<ApiDocument>>(`/documents/${id}`);
    return res.data;
  },

  async upload(formData: FormData): Promise<ApiDocument> {
    const res = await request<Envelope<ApiDocument>>('/documents/upload', {
      method: 'POST',
      formData,
    });
    return res.data;
  },

  async remove(id: string): Promise<ApiDocument> {
    const res = await request<Envelope<ApiDocument>>(`/documents/${id}`, { method: 'DELETE' });
    return res.data;
  },

  /** Upload the user's avatar. Multer field on the server is `image`. */
  async uploadProfileImage(file: UploadableFile): Promise<ApiUser> {
    const formData = new FormData();
    formData.append('image', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    const res = await request<Envelope<ApiUser>>('/documents/profile-image', {
      method: 'POST',
      formData,
    });
    return res.data;
  },
};

export const analyticsApi = {
  async metrics(): Promise<AnalyticsMetrics> {
    const res = await request<Envelope<AnalyticsMetrics>>('/analytics/metrics');
    return res.data;
  },

  async analyzePdf(formData: FormData): Promise<AnalysisResult> {
    const res = await request<Envelope<AnalysisResult>>('/analytics/analyze-document', {
      method: 'POST',
      formData,
    });
    return res.data;
  },
};

export const aiApi = {
  async chat(prompt: string, documentId: string): Promise<string> {
    const res = await request<Envelope<{ text: string }>>('/ai/chat', {
      method: 'POST',
      body: { prompt, documentId },
    });
    return res.data.text;
  },
};
