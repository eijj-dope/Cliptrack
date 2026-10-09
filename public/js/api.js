// Small helper for talking to the backend. NOT loaded by index.html yet.
// When you are ready to switch from demo data (localStorage) to the real server:
//   1. Add  <script src="js/api.js"></script>  before app.js in index.html
//   2. Replace load()/save() and the db.* reads in app.js with calls like:
//        const services = await api.get('/services');
//        await api.post('/appointments/public', { name, contact, serviceId, staffId, date, time });
const api = {
  async request(method, url, body) {
    const res = await fetch('/api' + url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  get: (url) => api.request('GET', url),
  post: (url, body) => api.request('POST', url, body),
  put: (url, body) => api.request('PUT', url, body),
  patch: (url, body) => api.request('PATCH', url, body),
  del: (url) => api.request('DELETE', url)
};
