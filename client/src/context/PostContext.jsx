import React, { createContext, useContext, useEffect, useState } from 'react';
import useApi from '../hooks/useApi';

const PostContext = createContext();

export function PostProvider({ children }) {
  const api = useApi();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});

  const fetchPosts = async (params = {}) => {
    const res = await api.request({ url: '/posts', params });
    setPosts(res.data);
    setPagination(res.pagination);
  };

  const createPost = async (formData) => {
    // optimistic update example:
    // push a temp item into posts, then replace after result
    const temp = { title: 'Saving...', _id: 'temp-' + Date.now() };
    setPosts(prev => [temp, ...prev]);
    const res = await api.request({
      url: '/posts',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setPosts(prev => [res, ...prev.filter(p => p._id !== temp._id)]);
    return res;
  };

  useEffect(() => { fetchPosts(); }, []);

  return (
    <PostContext.Provider value={{ posts, fetchPosts, createPost, pagination }}>
      {children}
    </PostContext.Provider>
  );
}

export const usePosts = () => useContext(PostContext);