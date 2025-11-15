import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (options) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = options.headers || {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await axios({
        baseURL: API_BASE,
        url: options.url,
        method: options.method || 'get',
        data: options.data,
        params: options.params,
        headers
      });
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data || err.message);
      throw err;
    }
  }, []);

  return { loading, error, request };
}