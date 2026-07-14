export interface Post {
  id: string;
  databaseId: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  date: string;
  modified: string;
  status: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  author: {
    node: AgentProfile;
  };
  categories: {
    nodes: Category[];
  };
  states: {
    nodes: TaxonomyTerm[];
  };
  cities: {
    nodes: TaxonomyTerm[];
  };
  suburbs: {
    nodes: TaxonomyTerm[];
  };
  assetClasses: {
    nodes: TaxonomyTerm[];
  };
  agency?: {
    node: AgencyProfile;
  };
  acf: ArticleACF;
}

export interface MarketReport extends Post {
  acf: MarketReportACF;
  keyMetrics?: {
    medianPrice: number;
    yoyChange: number;
    vacancyRate: number;
    daysOnMarket: number;
  };
}

export interface ArticleACF {
  sourceUrls: string[];
  aiPipelineId: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  isAiGenerated: boolean;
}

export interface MarketReportACF extends ArticleACF {
  keyMetrics: {
    medianPrice: number;
    yoyChange: number;
    vacancyRate: number;
    daysOnMarket: number;
  };
}

export interface AgentProfile {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  avatar?: {
    url: string;
  };
  acf: {
    headline: string;
    bio: string;
    serviceArea: string;
    agencyId: number;
  };
}

export interface AgencyProfile {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  acf: {
    description: string;
    website: string;
    socialLinks: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
}

export interface Category {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface TaxonomyTerm {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  count: number;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

export interface PaginatedPosts {
  nodes: Post[];
  pageInfo: PageInfo;
}

export interface SiteInfo {
  name: string;
  description: string;
  url: string;
}

export interface MenuNode {
  id: string;
  label: string;
  url: string;
  children?: {
    nodes: MenuNode[];
  };
}

export interface AgentApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseDetails: string;
  preferredAgency: string;
  paymentSessionId: string;
  planId: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  updatedAt: string;
}

export interface EditorialDraft {
  postId: number;
  title: string;
  slug: string;
  status: string;
  type: string;
  agentId: number;
  agentName: string;
  createdAt: string;
  modifiedAt: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  isAiGenerated: boolean;
  aiPipelineId: string;
  aiSuggestions?: {
    summary?: string;
    headlines?: string[];
    seoSuggestions?: string[];
    factCheckNotes?: string[];
  };
}

export interface EditorialQueueResponse {
  drafts: EditorialDraft[];
  total: number;
  pages: number;
}

export interface AISuggestionResponse {
  success: boolean;
  suggestions: {
    summary?: string;
    headlines?: string[];
    seoSuggestions?: string[];
    factCheckNotes?: string[];
  };
}
