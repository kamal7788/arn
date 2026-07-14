import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_AGENCY_BY_SLUG, GET_POSTS } from '@/lib/graphql/queries';
import type { Post } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

interface AgencyData {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  content: string;
  description: string;
  website: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug.replace(/-/g, ' ')} — Agency Profile` };
}

async function getAgency(slug: string): Promise<AgencyData | null> {
  try {
    const { data } = await apolloClient.query({
      query: GET_AGENCY_BY_SLUG,
      variables: { slug },
      fetchPolicy: 'no-cache',
    });
    return data.agency;
  } catch {
    return null;
  }
}

async function getAgencyPosts(agencyName: string): Promise<Post[]> {
  try {
    const { data } = await apolloClient.query({
      query: GET_POSTS,
      variables: { first: 20, where: { search: agencyName } },
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

export default async function AgencyPage({ params }: Props) {
  const { slug } = await params;
  const agency = await getAgency(slug);
  if (!agency) notFound();

  const posts = await getAgencyPosts(agency.name);

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Agency</p>
        <h1 style={{ fontSize: '2rem' }}>{agency.name}</h1>
        {agency.description && (
          <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>{agency.description}</p>
        )}
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {agency.website && (
          <a href={agency.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            Website
          </a>
        )}
        {agency.socialLinks?.facebook && (
          <a href={agency.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            Facebook
          </a>
        )}
        {agency.socialLinks?.instagram && (
          <a href={agency.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            Instagram
          </a>
        )}
        {agency.socialLinks?.linkedin && (
          <a href={agency.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            LinkedIn
          </a>
        )}
      </div>

      {posts.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Articles</h2>
          <div className="post-grid">
            {posts.map((post) => (
              <Link key={post.id} href={`/articles/${post.slug}`} className="post-card">
                {post.featuredImage?.node && (
                  <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText} />
                )}
                <div className="post-card-body">
                  <h3>{post.title}</h3>
                  <div className="meta">{formatDate(post.date)}</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
