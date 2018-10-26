import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import Cart, { CART_STATE_QUERY } from '../components/Cart';
import { CURRENT_USER_QUERY } from '../components/User';
import wait from 'waait';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [fakeCartItem()] } } },
  },
  {
    request: { query: CART_STATE_QUERY },
    result: { data: { cartOpen: true } },
  },
];

describe('<Cart />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Cart />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    expect(wrapper.find('header')).toMatchSnapshot();
    expect(wrapper.find('CartItem')).toHaveLength(1);
  });
});
