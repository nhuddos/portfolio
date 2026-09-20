const BASE = import.meta.env.BASE_URL;

export function asset(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
    ? BASE + path.slice(1)
    : path;
}

const LOCAL_ASSET = /^\/(images|music)\//;

export function withBase(value) {
  if (typeof value === 'string') return LOCAL_ASSET.test(value) ? asset(value) : value;
  if (Array.isArray(value)) return value.map(withBase);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withBase(v)]));
  }
  return value;
}
