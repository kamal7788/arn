export interface Post {
  id: string;
  databaseId: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  uri: string;
  date: string;
  modified: string;
  status: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  author?: {
    node: {
      name: string;
    };
  };
  categories?: {
    nodes: TaxonomyTerm[];
  };
  states?: {
    nodes: TaxonomyTerm[];
  };
  assetClasses?: {
    nodes: TaxonomyTerm[];
  };
}

export interface SuburbGuide {
  id: string;
  databaseId: number;
  slug: string;
  uri: string;
  date: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  states?: { nodes: TaxonomyTerm[] };
  suburbs?: { nodes: TaxonomyTerm[] };
  assetClasses?: { nodes: TaxonomyTerm[] };
  categories?: { nodes: TaxonomyTerm[] };
}

export interface Agency {
  id: string;
  databaseId: number;
  slug: string;
  uri: string;
  date: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  states?: { nodes: TaxonomyTerm[] };
  agencyProfile?: AgencyProfile;
}

export interface AgencyProfile {
  description?: string;
  website?: string;
  address?: string;
  googlePlaceId?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  agents?: {
    nodes: AgentSummary[];
  };
}

export interface Agent {
  id: string;
  databaseId: number;
  slug: string;
  uri: string;
  date: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  states?: { nodes: TaxonomyTerm[] };
  agentProfile?: AgentProfile;
}

export interface AgentProfile {
  bio?: string;
  email?: string;
  phone?: string;
  facebook?: string;
  linkedin?: string;
  realestateProfile?: string;
  domainProfile?: string;
  agency?: {
    nodes: AgencySummary[];
  };
}

export interface AgentSummary {
  id: string;
  databaseId: number;
  slug: string;
  uri: string;
}

export interface AgencySummary {
  id: string;
  databaseId: number;
  slug: string;
  uri: string;
}

export interface TaxonomyTerm {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

export interface Paginated<T> {
  nodes: T[];
  pageInfo: PageInfo;
}
