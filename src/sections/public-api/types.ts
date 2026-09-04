export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';

export type ProxyMode = 'direct' | 'corsproxy' | 'allorigins' | 'custom';

export type ApiSource = 'korea' | 'global';

export interface KeyValueParam {
  key: string;
  value: string;
  enabled: boolean;
}

export interface PublicApiItem {
  id: string;
  source: ApiSource;
  category: string;
  name: string;
  url: string;
  description: string;
  auth: string;
  cors: string;
  https: boolean;
}

export interface ApiPreset {
  id: string;
  title: string;
  category: string;
  desc: string;
  method: HttpMethod;
  url: string;
  params: KeyValueParam[];
  headers: KeyValueParam[];
  body: string;
  tag: string;
  badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  params: KeyValueParam[];
  headers: KeyValueParam[];
  body: string;
  proxyMode: ProxyMode;
  customProxyUrl: string;
}

export interface ApiResponseData {
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  data: unknown;
  rawText: string;
  isImage: boolean;
  imageUrl?: string;
  contentType: string;
  error?: string;
}

export interface HealthCheckResult {
  id: string;
  name: string;
  url: string;
  category: string;
  status: number;
  timeMs: number;
  isOk: boolean;
  error?: string;
}
