import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import { ApolloConsumer } from 'react-apollo';
import AddToCart, { ADD_TO_CART_MUTATION } from '../components/AddToCart';
import { CURRENT_USER_QUERY } from '../components/User';
import wait from 'waait';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser() } } },
  },
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [fakeCartItem()] } } },
  },
  {
    request: { query: ADD_TO_CART_MUTATION, variables: { id: 'abc123' } },
    result: { data: { addToCart: { ...fakeCartItem(), quantity: 1 } } },
  },
];

describe('<AddToCart />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <AddToCart id="abc123" />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    expect(wrapper.find('button')).toMatchSnapshot();
  });

  it('adds an item to the cart when clicked', async () => {
    // We need to expose the client so we can query it and inspect it after mutations are run
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <AddToCart id="abc123" />;
          }}
        </ApolloConsumer>
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    const {
      data: { me },
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });

    expect(me.cart).toHaveLength(0);

    // Add an item to cart!
    wrapper.find('button').simulate('click');
    await wait();

    // Note that AddToCart checks user changes using refetchQuery instead of an update function, so
    // we're mocking a completely different mock user here instead of updating the existing one...
    const {
      data: { me: meAfter },
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });

    expect(meAfter.cart).toHaveLength(1);
    expect(meAfter.cart[0].id).toBe('omg123');
    expect(meAfter.cart[0].quantity).toBe(3);
  });

  it('changes from add to adding and is disabled while loading', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <AddToCart id="abc123" />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    expect(wrapper.text()).toContain('Add To Cart');
    wrapper.find('button').simulate('click');
    expect(wrapper.text()).toContain('Adding To Cart');
    expect(wrapper.find('button').props().disabled).toBe(true);
  });
});
