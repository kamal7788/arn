import { gql } from '@apollo/client';

export const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    databaseId
    title
    excerpt
    slug
    uri
    date
    featuredImage {
      node {
        sourceUrl
        altText
      }
    }
    categories {
      nodes {
        id
        name
        slug
      }
    }
    states {
      nodes {
        id
        name
        slug
      }
    }
    assetClasses {
      nodes {
        id
        name
        slug
      }
    }
  }
`;

export const GET_POSTS = gql`
  query GetPosts($first: Int = 50, $after: String) {
    posts(first: $first, after: $after) {
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
  query GetPostsByCategory($category: String!, $first: Int = 50) {
    posts(first: $first, where: { categoryName: $category }) {
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

export const GET_POST = gql`
  query GetPost($slug: String!) {
    postBy(slug: $slug) {
      id
      databaseId
      title
      content
      excerpt
      slug
      uri
      date
      author {
        node {
          name
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          id
          name
          slug
        }
      }
      states {
        nodes {
          id
          name
          slug
        }
      }
      assetClasses {
        nodes {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_SUBURB_GUIDES = gql`
  query GetSuburbGuides($first: Int = 50, $after: String) {
    suburbGuides(first: $first, after: $after) {
      nodes {
        id
        databaseId
        slug
        uri
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        states {
          nodes {
            id
            name
            slug
          }
        }
        suburbs {
          nodes {
            id
            name
            slug
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_SUBURB_GUIDE = gql`
  query GetSuburbGuide($slug: String!) {
    suburbGuideBy(slug: $slug) {
      id
      databaseId
      slug
      uri
      date
      content
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      states {
        nodes {
          id
          name
          slug
        }
      }
      suburbs {
        nodes {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_AGENCIES = gql`
  query GetAgencies($first: Int = 50, $after: String) {
    agencies(first: $first, after: $after) {
      nodes {
        id
        databaseId
        slug
        uri
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        states {
          nodes {
            id
            name
            slug
          }
        }
        agencyProfile {
          description
          website
          address
          googlePlaceId
          socialLinks {
            facebook
            instagram
            linkedin
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_AGENCY = gql`
  query GetAgency($slug: String!) {
    agencyBy(slug: $slug) {
      id
      databaseId
      slug
      uri
      date
      content
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      states {
        nodes {
          id
          name
          slug
        }
      }
      agencyProfile {
        description
        website
        address
        googlePlaceId
        socialLinks {
          facebook
          instagram
          linkedin
        }
        agents {
          nodes {
            id
            databaseId
            slug
            uri
          }
        }
      }
    }
  }
`;

export const GET_AGENTS = gql`
  query GetAgents($first: Int = 80, $after: String) {
    agents(first: $first, after: $after) {
      nodes {
        id
        databaseId
        slug
        uri
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        states {
          nodes {
            id
            name
            slug
          }
        }
        agentProfile {
          bio
          email
          phone
          agency {
            nodes {
              id
              databaseId
              slug
              uri
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_AGENT = gql`
  query GetAgent($slug: String!) {
    agentBy(slug: $slug) {
      id
      databaseId
      slug
      uri
      date
      content
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      states {
        nodes {
          id
          name
          slug
        }
      }
      agentProfile {
        bio
        email
        phone
        facebook
        linkedin
        realestateProfile
        domainProfile
        agency {
          nodes {
            id
            databaseId
            slug
            uri
          }
        }
      }
    }
  }
`;

export const GET_TAXONOMY_TERMS = gql`
  query GetTaxonomyTerms($taxonomy: TaxonomyEnum!) {
    terms(where: { taxonomies: [$taxonomy] }, first: 100) {
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

export const GET_CATEGORIES = gql`
  query GetCategories($first: Int = 20, $exclude: [ID]) {
    categories(first: $first, where: { hideEmpty: true, exclude: $exclude }) {
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

export const GET_SITE_INFO = gql`
  query GetSiteInfo {
    generalSettings {
      title
      description
      url
    }
  }
`;
