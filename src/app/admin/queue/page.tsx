import { Metadata } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { GET_DRAFT_POSTS } from '@/lib/graphql/queries';
import type { Post } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Editorial Queue',
};

async function getDraftPosts() {
  try {
    const { data } = await apolloClient.query({
      query: GET_DRAFT_POSTS,
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

export default async function AdminQueue() {
  const drafts = await getDraftPosts();

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Editorial Queue</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Review and publish AI-generated and agent-submitted articles.
        </p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="number">{drafts.length}</div>
          <div className="label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="number">{drafts.filter((d) => d.acf?.isAiGenerated).length}</div>
          <div className="label">AI-Generated</div>
        </div>
        <div className="stat-card">
          <div className="number">{drafts.filter((d) => d.acf?.riskLevel === 'High').length}</div>
          <div className="label">High Risk</div>
        </div>
      </div>

      {drafts.length > 0 ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Type</th>
                <th>Risk</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => (
                <tr key={draft.id}>
                  <td style={{ fontWeight: 500 }}>{draft.title}</td>
                  <td>{draft.author.node.name}</td>
                  <td>
                    {draft.acf?.isAiGenerated && (
                      <span className="badge" style={{ background: '#bee3f8', color: '#2a4365' }}>AI</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-risk-${draft.acf?.riskLevel?.toLowerCase() || 'low'}`}>
                      {draft.acf?.riskLevel || 'N/A'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{formatDate(draft.date)}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-success"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                      onClick={async () => {
                        await fetch('/api/approve', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ postId: draft.databaseId, action: 'publish' }),
                        });
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                      onClick={async () => {
                        await fetch('/api/approve', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ postId: draft.databaseId, action: 'trash' }),
                        });
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No drafts pending review.</p>
      )}
    </>
  );
}
