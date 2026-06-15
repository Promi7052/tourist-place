import { AxiosError, AxiosResponse } from 'axios';

export function createAxiosResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as never,
  };
}

export function createAxiosError(detail: string) {
  const error = new AxiosError('Request failed');
  error.response = {
    data: { detail },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as never,
  };
  return error;
}
