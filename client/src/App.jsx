import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PostList from './components/PostList';
import PostView from './components/PostView';
import PostForm from './components/PostForm';
import Login from './components/Login';

export default function App() {
  return (
    <div>
      <nav style={{ padding: 12, borderBottom: '1px solid #ccc' }}>
        <Link to="/">Home</Link> | <Link to="/create">Create Post</Link> | <Link to="/login">Login</Link>
      </nav>
      <main style={{ padding: 12 }}>
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/posts/:id" element={<PostView />} />
          <Route path="/create" element={<PostForm />} />
          <Route path="/edit/:id" element={<PostForm editMode />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}