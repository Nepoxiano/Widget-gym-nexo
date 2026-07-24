const TOKEN_KEY = 'nexo_gym_token';
const USER_KEY = 'nexo_gym_user';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY) || null;
    this.user = JSON.parse(localStorage.getItem(USER_KEY)) || null;
    this.baseURL = ''; // Vite proxies /api directly to Hono
  }

  setToken(token, user = null) {
    this.token = token;
    this.user = user;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.token;
  }

  logout() {
    this.setToken(null, null);
    window.dispatchEvent(new Event('api-logout'));
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      window.dispatchEvent(new Event('api-unauthorized'));
      throw new Error('Sesión expirada o no autorizada');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Error HTTP: ${response.status}`);
    }

    return response.json();
  }

  get(path) {
    return this.request(path, { method: 'GET' });
  }

  post(path, body) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(path, body) {
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
