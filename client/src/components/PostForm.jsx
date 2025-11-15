import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { usePosts } from '../context/PostContext';

export default function PostForm({ editMode }) {
  const { id } = useParams();
  const { user } = useAuth();
  const api = useApi();
  const { createPost } = usePosts();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return alert('Login required');
    const fd = new FormData();
    fd.append('title', title);
    fd.append('content', content);
    if (featuredImage) fd.append('featuredImage', featuredImage);
    try {
      await createPost(fd);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{editMode ? 'Edit' : 'Create'} Post</h2>
      <div>
        <label>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>Content</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} required />
      </div>
      <div>
        <label>Featured Image</label>
        <input type="file" onChange={e => setFeaturedImage(e.target.files[0])} accept="image/*" />
      </div>
      <button type="submit">Save</button>
    </form>
  );
}