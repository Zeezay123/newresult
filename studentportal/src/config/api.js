export const API_URL = import.meta.env.VITE_API_URL || "";

export function toApiUrl(url) {
  if (typeof url !== 'string') {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith('/api')) {
    return `${API_URL}${url}`;
  }

  return url;
}