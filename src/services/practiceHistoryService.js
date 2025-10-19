import axios from 'axios';
import { API_BASE } from '../config/api';

export async function fetchUserHistoryServer(userId) {
  const { data } = await axios.get(`${API_BASE}/practiceHistory`, {
    params: { userId: String(userId), _sort: 'timestamp', _order: 'desc' }
  });
  return data;
}

export async function recordAttemptServer(userId, attempt) {
  const payload = { userId: String(userId), ...attempt };
  const { data } = await axios.post(`${API_BASE}/practiceHistory`, payload);
  return data;
}
