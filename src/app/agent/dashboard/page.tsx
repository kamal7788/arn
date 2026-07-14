import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS } from '@/lib/graphql/queries';
import type { Post } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Agent Dashboard',
};

async function getAgentPosts(agentId: number) {
  try {
    const { data } = await apolloClient.query({
      query: GET_POSTS,
      variables: {
        first: 50,
        where: { author: agentId },
      },
      fetchPolicy: 'no-cache',
    });
    return data.posts.nodes as Post[];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AgentDashboard() {
  // In production, agentId would come from auth session
  // For now, showing the dashboard layout with placeholder data
  const posts: Post[] = [];

  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const publishedCount = posts.filter((p) => p.status === 'publish').length;

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Agent Dashboard</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage your articles and profile.</p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="number">{posts.length}</div>
          <div className="label">Total Articles</div>
        </div>
        <div className="stat-card">
          <div className="number">{draftCount}</div>
          <div className="label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="number">{publishedCount}</div>
          <div className="label">Published</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Your Articles</h2>
      {posts.length > 0 ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link href={`/articles/${post.slug}`} style={{ fontWeight: 500 }}>
                      {post.title}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge badge-risk-${post.status === 'publish' ? 'low' : 'medium'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{formatDate(post.date)}</td>
                  <td>
                    <Link href={`/articles/${post.slug}`} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No articles yet. Create your first article through the WordPress admin.</p>
      )}
    </>
  );
}
