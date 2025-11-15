import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';

export default function PostView() {
  const { id } = useParams();
  const api = useApi();
  const [post, setPost] = useState(null);

  useEffect(() => {
    api.request({ url: `/posts/${id}` }).then(setPost).catch(() => {});
  }, [id]);

  if (!post) return <div>Loading...</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author?.username || 'Unknown'} | {new Date(post.createdAt).toLocaleString()}</p>
      {post.featuredImage && <img src={post.featuredImage} alt="" style={{ maxWidth: '100%' }} />}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <section>
        <h3>Comments</h3>
        {post.comments?.map((c, i) => (
          <div key={i}><strong>{c.author}</strong>: {c.content}</div>
        ))}
      </section>
    </article>
  );
}