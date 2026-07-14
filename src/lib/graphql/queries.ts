import { gql } from '@apollo/client';

export const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    databaseId
    title
    excerpt
    content
    slug
    date
    modified
    status
    featuredImage {
      node {
        sourceUrl
        altText
      }
    }
    author {
      node {
        id
        databaseId
        name
        slug
        avatar {
          url
        }
        ... on AgentAuthor {
          headline: agentHeadline
          bio: agentBio
          serviceArea: agentServiceArea
          agencyId: agentAgencyId
        }
      }
    }
    categories {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
    states: terms(where: { taxonomy: STATE }) {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
    cities: terms(where: { taxonomy: CITY }) {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
    suburbs: terms(where: { taxonomy: SUBURB }) {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
    assetClasses: terms(where: { taxonomy: ASSETCLASS }) {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
  }
`;

export const MARKET_REPORT_FIELDS = gql`
  fragment MarketReportFields on MarketReport {
    ...PostFields
    keyMetrics: acf(key: "keyMetrics") {
      medianPrice
      yoyChange
      vacancyRate
      daysOnMarket
    }
    sourceUrls: acf(key: "sourceUrls")
    aiPipelineId: acf(key: "aiPipelineId")
    riskLevel: acf(key: "riskLevel")
    isAiGenerated: acf(key: "isAiGenerated")
  }
  ${POST_FIELDS}
`;

export const GET_POSTS = gql`
  query GetPosts(
    $first: Int = 10
    $after: String
    $where: RootQueryToPostConnectionWhereArgsInput
  ) {
    posts(first: $first, after: $after, where: $where) {
      nodes {
        ...PostFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${POST_FIELDS}
`;

export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ...PostFields
      content
    }
  }
  ${POST_FIELDS}
`;

export const GET_MARKET_REPORTS = gql`
  query GetMarketReports($first: Int = 10, $after: String) {
    marketReports(first: $first, after: $after) {
      nodes {
        ...MarketReportFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${MARKET_REPORT_FIELDS}
`;

export const GET_MARKET_REPORT_BY_SLUG = gql`
  query GetMarketReportBySlug($slug: ID!) {
    marketReport(id: $slug, idType: SLUG) {
      ...MarketReportFields
      content
    }
  }
  ${MARKET_REPORT_FIELDS}
`;

export const GET_CATEGORIES = gql`
  query GetCategories($first: Int = 100) {
    categories(first: $first) {
      nodes {
        id
        databaseId
        name
        slug
        description
        count
      }
    }
  }
`;

export const GET_STATES = gql`
  query GetStates($first: Int = 100) {
    states(first: $first) {
      nodes {
        id
        databaseId
        name
        slug
        count
      }
    }
  }
`;

export const GET_CITIES = gql`
  query GetCities($first: Int = 100, $where: RootQueryToCityConnectionWhereArgsInput) {
    cities(first: $first, where: $where) {
      nodes {
        id
        databaseId
        name
        slug
        count
      }
    }
  }
`;

export const GET_SUBURBS = gql`
  query GetSuburbs($first: Int = 100, $where: RootQueryToSuburbConnectionWhereArgsInput) {
    suburbs(first: $first, where: $where) {
      nodes {
        id
        databaseId
        name
        slug
        count
      }
    }
  }
`;

export const GET_AGENT_POSTS = gql`
  query GetAgentPosts($authorId: Int!, $first: Int = 20, $status: String) {
    posts(
      first: $first
      where: { author: $authorId, status: $status }
    ) {
      nodes {
        ...PostFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${POST_FIELDS}
`;

export const GET_DRAFT_POSTS = gql`
  query GetDraftPosts($first: Int = 50) {
    posts(first: $first, where: { status: "draft" }) {
      nodes {
        ...PostFields
      }
    }
  }
  ${POST_FIELDS}
`;

export const GET_SITE_INFO = gql`
  query GetSiteInfo {
    generalSettings {
      title
      description
      url
    }
  }
`;

export const GET_ALL_POST_SLUGS = gql`
  query GetAllPostSlugs {
    posts(first: 1000) {
      nodes {
        slug
        date
        modified
      }
    }
    marketReports(first: 1000) {
      nodes {
        slug
        date
        modified
      }
    }
    suburbGuides(first: 1000) {
      nodes {
        slug
        date
        modified
      }
    }
    policyUpdates(first: 1000) {
      nodes {
        slug
        date
        modified
      }
    }
  }
`;

export const GET_POSTS_BY_STATE = gql`
  query GetPostsByState($stateSlug: String!, $first: Int = 20) {
    posts(first: $first, where: { taxQuery: { taxArray: [{ taxonomy: STATE, terms: [$stateSlug], field: SLUG, operator: IN }] } }) {
      nodes {
        ...PostFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${POST_FIELDS}
`;

export const GET_POSTS_BY_CATEGORY = gql`
  query GetPostsByCategory($categorySlug: String!, $first: Int = 20) {
    posts(first: $first, where: { categorySlug: $categorySlug }) {
      nodes {
        ...PostFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${POST_FIELDS}
`;
