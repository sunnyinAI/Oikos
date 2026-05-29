const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

const request = async (method: string, path: string, body?: unknown) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('oikos_token') : null;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
};

export const get = (path: string) => request('GET', path);
export const post = (path: string, body?: unknown) => request('POST', path, body);
export const put = (path: string, body?: unknown) => request('PUT', path, body);
export const patch = (path: string, body?: unknown) => request('PATCH', path, body);
export const del = (path: string) => request('DELETE', path);

export const streamAssistantChat = async (
  message: string,
  onChunk?: (chunk: string, full: string) => void,
) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('oikos_token') : null;
  const res = await fetch(`${BASE}/assistant/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Failed to send message');
  }

  if (!res.body) throw new Error('Streaming is not supported in this browser');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  const processEvent = (event: string): boolean => {
    const line = event.split('\n').find((e) => e.startsWith('data: '));
    if (!line) return false;
    const payload = line.slice(6);
    if (payload === '[DONE]') return true;
    const parsed = JSON.parse(payload);
    if (parsed.error) throw new Error(parsed.error);
    if (parsed.text) {
      fullText += parsed.text;
      onChunk?.(parsed.text, fullText);
    }
    return false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    while (buffer.includes('\n\n')) {
      const boundary = buffer.indexOf('\n\n');
      const event = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      if (processEvent(event)) return fullText;
    }
  }
  if (buffer.trim()) processEvent(buffer.trim());
  return fullText;
};

// Auth
export const sendOtp = (phone: string) => post('/auth/send-otp', { phone });
export const verifyOtp = (phone: string, otp: string) => post('/auth/verify-otp', { phone, otp });
export const logout = () => post('/auth/logout');
export const updateProfile = (data: unknown) => put('/auth/profile', data);

// Grocery
export const getLists = () => get('/grocery/lists');
export const createList = (name: string) => post('/grocery/lists', { name });
export const updateList = (id: number, name: string) => put(`/grocery/lists/${id}`, { name });
export const deleteList = (id: number) => del(`/grocery/lists/${id}`);
export const getItems = (listId: number) => get(`/grocery/lists/${listId}/items`);
export const addItem = (listId: number, item: unknown) => post(`/grocery/lists/${listId}/items`, item);
export const updateItem = (id: number, data: unknown) => put(`/grocery/items/${id}`, data);
export const toggleItem = (id: number) => patch(`/grocery/items/${id}/toggle`);
export const deleteItem = (id: number) => del(`/grocery/items/${id}`);
export const resetList = (id: number) => post(`/grocery/lists/${id}/reset`);

// Pantry
export const getPantryItems = () => get('/pantry/items');
export const getExpiringItems = (days: number) => get(`/pantry/expiring?days=${days}`);
export const addPantryItem = (item: unknown) => post('/pantry/items', item);
export const updatePantryItem = (id: number, data: unknown) => put(`/pantry/items/${id}`, data);
export const deletePantryItem = (id: number) => del(`/pantry/items/${id}`);

// Finance
export const getTransactions = (month?: string) => get(`/finance/transactions?month=${month || ''}`);
export const addTransaction = (data: unknown) => post('/finance/transactions', data);
export const deleteTransaction = (id: number) => del(`/finance/transactions/${id}`);
export const getBills = () => get('/finance/bills');
export const addBill = (data: unknown) => post('/finance/bills', data);
export const payBill = (id: number) => patch(`/finance/bills/${id}/pay`);
export const deleteBill = (id: number) => del(`/finance/bills/${id}`);
export const getSubscriptions = () => get('/finance/subscriptions');
export const addSubscription = (data: unknown) => post('/finance/subscriptions', data);
export const toggleSubscription = (id: number) => patch(`/finance/subscriptions/${id}/toggle`);
export const deleteSubscription = (id: number) => del(`/finance/subscriptions/${id}`);
export const getFinanceSummary = (month?: string) => get(`/finance/summary?month=${month || ''}`);

// Prices
export const comparePrices = (q: string, qty: number, unit: string) =>
  get(`/prices/compare?q=${encodeURIComponent(q)}&qty=${qty}&unit=${unit}`);

// Mandi
export const getCommodities = () => get('/mandi/commodities');
export const getMandiPrices = (commodity: string, state: string) =>
  get(`/mandi/prices?commodity=${commodity}&state=${state}`);

// Meal
export const getMealPlan = (week?: string) => get(`/meal/plans?week=${week || ''}`);
export const generateMealPlan = (weekStart: string) => post('/meal/generate', { week_start: weekStart });

// Collaborate
export const shareList = (listId: number) => post(`/collaborate/share/${listId}`);
export const joinList = (shareCode: string) => post('/collaborate/join', { share_code: shareCode });

// Assistant
export const getChatHistory = () => get('/assistant/history');
export const clearChatHistory = () => del('/assistant/history');
