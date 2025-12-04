export function buildApiUrl(base: string, endpoint: string): string {
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedEndpoint = endpoint.replace(/^\/?/, '/');
  return `${normalizedBase}${normalizedEndpoint}`;
}
