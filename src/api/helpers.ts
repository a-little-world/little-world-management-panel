import { getCookiesAsObject } from '../lib/utils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiFetchOptions {
  method?: HttpMethod;
  body?: object | FormData;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  useTagsOnly?: boolean;
}

interface ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: any;
  code?: string;
  fields?: Record<string, string[]>;
}

export const formatApiError = (responseBody: any, response: Response) => {
  const apiError: ApiError = new Error('API request failed');
  apiError.status = response.status;
  apiError.statusText = response.statusText;
  apiError.data = responseBody;

  const structuredError =
    responseBody &&
    typeof responseBody === 'object' &&
    responseBody.error &&
    typeof responseBody.error === 'object'
      ? responseBody.error
      : undefined;

  if (structuredError) {
    apiError.code = structuredError.code;
    apiError.fields =
      structuredError.fields && typeof structuredError.fields === 'object'
        ? structuredError.fields
        : undefined;

    const firstField = apiError.fields
      ? Object.keys(apiError.fields)[0]
      : undefined;
    apiError.cause = firstField ?? null;

    const firstFieldMessage =
      firstField && Array.isArray(apiError.fields?.[firstField])
        ? apiError.fields?.[firstField][0]
        : undefined;

    apiError.message =
      (typeof structuredError.message === 'string' && structuredError.message) ||
      (typeof firstFieldMessage === 'string' && firstFieldMessage) ||
      apiError.statusText;
  } else if (typeof responseBody === 'string') {
    apiError.message = responseBody;
  } else if (responseBody && typeof responseBody === 'object') {
    const detail =
      typeof responseBody.detail === 'string' ? responseBody.detail : undefined;
    const message =
      typeof responseBody.message === 'string' ? responseBody.message : undefined;
    const msg =
      typeof responseBody.msg === 'string' ? responseBody.msg : undefined;

    if (detail) {
      apiError.message = detail;
    } else if (message) {
      apiError.message = message;
    } else if (msg) {
      apiError.message = msg;
    } else {
      const errorTypeApi = Object.keys(responseBody)?.[0];
      const errorTags = Object.values(responseBody)?.[0];
      const errorTag = Array.isArray(errorTags) ? errorTags[0] : errorTags;
      apiError.cause = errorTypeApi ?? null;
      apiError.message =
        typeof errorTag === 'string' && errorTag
          ? errorTag
          : apiError.statusText;
    }
  } else {
    apiError.message = apiError.statusText;
  }

  return apiError;
};

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    credentials = 'same-origin',
    useTagsOnly = true,
  } = options;

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookiesAsObject().csrftoken || '',
  };

  if (useTagsOnly) {
    defaultHeaders['X-UseTagsOnly'] = 'true';
  }

  const fetchOptions: RequestInit = {
    method,
    headers: { ...defaultHeaders, ...headers },
    credentials,
  };

  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body;
      // Remove Content-Type header when sending FormData
      delete (fetchOptions.headers as Record<string, string>)['Content-Type'];
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw formatApiError(errorData, response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`API Fetch Error (${endpoint}):`, error);
    throw error;
  }
}
