import React from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';

export default function PostList() {
  const { posts, fetchPosts, pagination } = usePosts();

  return (
    <div>
      <h2>Posts</h2>
      <div>
        {posts && posts.length ? (
          posts.map(p => (
            <article key={p._id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
              <h3><Link to={`/posts/${p._id}`}>{p.title}</Link></h3>
              <p>{p.excerpt || p.content?.slice(0, 150)}</p>
            </article>
          ))
        ) : (
          <p>No posts yet</p>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => fetchPosts({ page: (pagination.page || 1) - 1 })} disabled={(pagination.page || 1) <= 1}>Prev</button>
        <span style={{ margin: '0 8px' }}>Page {pagination.page || 1}</span>
        <button onClick={() => fetchPosts({ page: (pagination.page || 1) + 1 })} disabled={((pagination.page || 1) * (pagination.limit || 10)) >= (pagination.total || 0)}>Next</button>
      </div>
    </div>
  );
}