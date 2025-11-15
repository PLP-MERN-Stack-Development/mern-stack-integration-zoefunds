import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      alert('Login failed');
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      <div><input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div><input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
      <button>Login</button>
    </form>
  );
}