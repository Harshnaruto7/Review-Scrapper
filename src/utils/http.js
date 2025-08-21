import axios from 'axios';
import axiosRetry from 'axios-retry';
import UserAgent from 'user-agents';

const instance = axios.create({
  timeout: 10000,
});

// retry on network errors & 5xx
axiosRetry(instance, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export async function fetchPage(url) {
  const userAgent = new UserAgent().toString();
  const headers = { 'User-Agent': userAgent };
  const res = await instance.get(url, { headers });
  return res.data;
}
