import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Applications',
};

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseDetails: string;
  preferredAgency: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

async function getApplications(): Promise<Application[]> {
  // In production, this would fetch from WordPress REST or a custom endpoint
  // For now, returning empty array — real data comes from WP backend
  return [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminApplications() {
  const applications = await getApplications();

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const deniedCount = applications.filter((a) => a.status === 'denied').length;

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Agent Applications</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Review and manage agent applications for the platform.
        </p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="number">{pendingCount}</div>
          <div className="label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="number">{approvedCount}</div>
          <div className="label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="number">{deniedCount}</div>
          <div className="label">Denied</div>
        </div>
      </div>

      {applications.length > 0 ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>License</th>
                <th>Preferred Agency</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td style={{ fontWeight: 500 }}>{app.name}</td>
                  <td>{app.email}</td>
                  <td>{app.phone}</td>
                  <td>{app.licenseDetails}</td>
                  <td>{app.preferredAgency || '—'}</td>
                  <td>
                    <span className={`badge badge-risk-${app.status === 'approved' ? 'low' : app.status === 'denied' ? 'high' : 'medium'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{formatDate(app.createdAt)}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    {app.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                        >
                          Deny
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No agent applications yet.</p>
      )}
    </>
  );
}
