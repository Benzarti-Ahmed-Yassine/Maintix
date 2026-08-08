export interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  signal?: AbortSignal;
}

export interface ApiClient {
  get<T = any>(url: string, options?: ApiOptions): Promise<T>;
  post<T = any>(url: string, data?: any, options?: ApiOptions): Promise<T>;
  put<T = any>(url: string, data?: any, options?: ApiOptions): Promise<T>;
  patch<T = any>(url: string, data?: any, options?: ApiOptions): Promise<T>;
  delete<T = any>(url: string, options?: ApiOptions): Promise<T>;
}

export function createApiClient(client: any): ApiClient {
  return {
    get: (url, options) => client.get(url, options),
    post: (url, data, options) => client.post(url, data, options),
    put: (url, data, options) => client.put(url, data, options),
    patch: (url, data, options) => client.patch(url, data, options),
    delete: (url, options) => client.delete(url, options)
  };
}
