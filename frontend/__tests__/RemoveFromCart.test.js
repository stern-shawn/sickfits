import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import { ApolloConsumer } from 'react-apollo';
import RemoveFromCart, { REMOVE_FROM_CART_MUTATION } from '../components/RemoveFromCart';
import { CURRENT_USER_QUERY } from '../components/User';
import wait from 'waait';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [fakeCartItem({ id: 'abc123' })] } } },
  },
  {
    request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: 'abc123' } },
    result: { data: { removeFromCart: { __typename: 'CartItem', id: 'abc123' } } },
  },
];

describe('<RemoveFromCart />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RemoveFromCart id="abc123" />
      </MockedProvider>,
    );

    expect(wrapper.find('button')).toMatchSnapshot();
  });

  it('removes the item from the cart when clicked', async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <RemoveFromCart id="abc123" />;
          }}
        </ApolloConsumer>
      </MockedProvider>,
    );

    const {
      data: { me },
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(me.cart).toHaveLength(1);

    // Remove the item by clicking!
    wrapper.find('button').simulate('click');
    await wait();

    // Expect the SAME user's cart to no longer have that item that was removed. This works as
    // expected because of the update fn instead of using refetchQueries
    const {
      data: { me: meAfter },
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(meAfter.cart).toHaveLength(0);
  });
});
