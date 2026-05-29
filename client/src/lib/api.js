const BASE = '/api';

const request = async (method, path, body) => {
  const token = localStorage.getItem('omni_token');
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
};

export const get = (path) => request('GET', path);
export const post = (path, body) => request('POST', path, body);
export const put = (path, body) => request('PUT', path, body);
export const patch = (path, body) => request('PATCH', path, body);
export const del = (path) => request('DELETE', path);

export const streamAssistantChat = async (message, onChunk) => {
  const token = localStorage.getItem('omni_token');
  const res = await fetch(`${BASE}/assistant/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Failed to send message');
  }

  if (!res.body) {
    throw new Error('Streaming is not supported in this browser');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  const processEvent = (event) => {
    const line = event
      .split('\n')
      .find((entry) => entry.startsWith('data: '));

    if (!line) return false;

    const payload = line.slice(6);
    if (payload === '[DONE]') {
      return true;
    }

    const parsed = JSON.parse(payload);
    if (parsed.error) {
      throw new Error(parsed.error);
    }

    if (parsed.text) {
      fullText += parsed.text;
      onChunk?.(parsed.text, fullText);
    }

    return false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    while (buffer.includes('\n\n')) {
      const boundary = buffer.indexOf('\n\n');
      const event = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      if (processEvent(event)) {
        return fullText;
      }
    }
  }

  if (buffer.trim()) {
    processEvent(buffer.trim());
  }

  return fullText;
};

// Auth
export const sendOtp = (phone) => post('/auth/send-otp', { phone });
export const verifyOtp = (phone, otp) => post('/auth/verify-otp', { phone, otp });
export const logout = () => post('/auth/logout');
export const deleteAccount = () => del('/auth/account');
export const updateProfile = (data) => put('/auth/profile', data);

// Grocery
export const getLists = () => get('/grocery/lists');
export const createList = (name) => post('/grocery/lists', { name });
export const updateList = (id, name) => put(`/grocery/lists/${id}`, { name });
export const deleteList = (id) => del(`/grocery/lists/${id}`);
export const getItems = (listId) => get(`/grocery/lists/${listId}/items`);
export const addItem = (listId, item) => post(`/grocery/lists/${listId}/items`, item);
export const updateItem = (id, data) => put(`/grocery/items/${id}`, data);
export const toggleItem = (id) => patch(`/grocery/items/${id}/toggle`);
export const deleteItem = (id) => del(`/grocery/items/${id}`);
export const resetList = (id) => post(`/grocery/lists/${id}/reset`);

// Pantry
export const getPantryItems = () => get('/pantry/items');
export const getExpiringItems = (days) => get(`/pantry/expiring?days=${days}`);
export const addPantryItem = (item) => post('/pantry/items', item);
export const updatePantryItem = (id, data) => put(`/pantry/items/${id}`, data);
export const deletePantryItem = (id) => del(`/pantry/items/${id}`);

// Finance
export const getTransactions = (month) => get(`/finance/transactions?month=${month || ''}`);
export const addTransaction = (data) => post('/finance/transactions', data);
export const deleteTransaction = (id) => del(`/finance/transactions/${id}`);
export const getBills = () => get('/finance/bills');
export const addBill = (data) => post('/finance/bills', data);
export const payBill = (id) => patch(`/finance/bills/${id}/pay`);
export const deleteBill = (id) => del(`/finance/bills/${id}`);
export const getSubscriptions = () => get('/finance/subscriptions');
export const addSubscription = (data) => post('/finance/subscriptions', data);
export const toggleSubscription = (id) => patch(`/finance/subscriptions/${id}/toggle`);
export const deleteSubscription = (id) => del(`/finance/subscriptions/${id}`);
export const getFinanceSummary = (month) => get(`/finance/summary?month=${month || ''}`);

// Prices
export const comparePrices = (q, qty, unit) => get(`/prices/compare?q=${encodeURIComponent(q)}&qty=${qty}&unit=${unit}`);

export const scanBill = (image, mimeType) => post('/ocr/bill', { image, mimeType });
export const getOcrStatus = () => get('/ocr/status');

export const affiliateRedirect = (vendor, query) => post('/affiliate/redirect', { vendor, query });

export const getPushConfig = () => get('/push/config');
export const registerPushToken = (token, platform = 'web') =>
  post('/push/register', { token, platform, userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null });
export const unregisterPushToken = (token) => post('/push/unregister', { token });
export const getPushAdminStatus = () => get('/push/admin-status');
export const sendTestPush = () => post('/push/test', {});

// Mandi
export const getCommodities = () => get('/mandi/commodities');
export const getMandiPrices = (commodity, state) => get(`/mandi/prices?commodity=${commodity}&state=${state}`);

// Meal
export const getMealPlan = (week) => get(`/meal/plans?week=${week || ''}`);
export const generateMealPlan = (weekStart) => post('/meal/generate', { week_start: weekStart });

// Collaborate
export const shareList = (listId) => post(`/collaborate/share/${listId}`);
export const joinList = (shareCode) => post('/collaborate/join', { share_code: shareCode });

// Assistant history
export const getChatHistory = () => get('/assistant/history');
export const clearChatHistory = () => del('/assistant/history');
