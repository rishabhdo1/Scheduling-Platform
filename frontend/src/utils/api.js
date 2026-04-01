const BASE = import.meta.env.VITE_API_URL || '/api';
console.log("Connecting to API at:", BASE);

function getHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(method, path, body) {
  // This will now fetch from: https://scheduling-platform-wbvt.onrender.com/api/auth/login
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!data.success && data.error) throw new Error(data.error);
  return data;
}

export const api = {
  get:    (path)       => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  patch:  (path, body) => request('PATCH',  path, body),
  delete: (path, body) => request('DELETE', path, body),
};
