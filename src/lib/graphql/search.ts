import { gql } from '@apollo/client';

export const SEARCH_POSTS = gql`
  query SearchPosts($search: String!, $first: Int = 30) {
    posts(first: $first, where: { search: $search, status: "publish" }) {
      nodes {
        id
        databaseId
        title
        excerpt
        slug
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
      }
    }
  }
`;
