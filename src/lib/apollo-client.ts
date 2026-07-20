import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://cms.ausrealestatenews.com.au/graphql',
  headers: {
    Authorization:
      'Basic ' +
      Buffer.from(
        `${process.env.WP_USER || 'kamal@brandaid.au'}:${process.env.WP_APP_PASSWORD || 'application_password'}`
      ).toString('base64'),
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: 'no-cache' },
  },
});
