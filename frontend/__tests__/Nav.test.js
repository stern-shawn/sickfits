import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import Nav from '../components/Nav';
import { CURRENT_USER_QUERY } from '../components/User';
import wait from 'waait';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } },
  },
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } },
  },
];

const signedInMocksWithCartItems = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem(), fakeCartItem(), fakeCartItem()],
        },
      },
    },
  },
];

describe('<Nav />', () => {
  it('renders a minimal nav when user is not signed in', async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <Nav />
      </MockedProvider>,
    );

    await wait(); // wait for response, 0ms delay will make us wait until next tick
    wrapper.update();

    expect(wrapper.find('ul[data-test="nav"]')).toMatchSnapshot();
  });

  it('renders full nav when user is signed in', async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <Nav />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    const nav = wrapper.find('ul[data-test="nav"]');
    expect(nav.children()).toHaveLength(6);
    expect(nav.text()).toContain('Sign Out');
  });

  it('renders the number of items in the cart', async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMocksWithCartItems}>
        <Nav />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    const count = wrapper.find('div.count');

    expect(count.text()).toBe('9');
    expect(count).toMatchSnapshot();
  });
});
