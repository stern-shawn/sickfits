import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';
import { CART_STATE_QUERY } from '../components/Cart';

const createClient = ({ headers }) =>
  new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    // Local data, think Redux!
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart: (parent, args, { cache }, info) => {
            // Read the value from cache
            const { cartOpen } = cache.readQuery({ query: CART_STATE_QUERY });
            // Write the opposite to cache
            const data = {
              data: { cartOpen: !cartOpen },
            };
            cache.writeData(data);
            return data;
          },
        },
      },
      defaults: {
        cartOpen: false,
      },
    },
  });

export default withApollo(createClient);
