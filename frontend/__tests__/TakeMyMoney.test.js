import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import NProgress from 'nprogress';
import Router from 'next/router';
import TakeMyMoney, { CREATE_ORDER_MUTATION } from '../components/TakeMyMoney';
import { CURRENT_USER_QUERY } from '../components/User';
import wait from 'waait';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

Router.router = {
  push: jest.fn(),
};

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [fakeCartItem()] } } },
  },
  {
    request: { query: CREATE_ORDER_MUTATION, variables: { token: 'abc123' } },
    result: { data: { removeFromCart: { __typename: 'CartItem', id: 'abc123' } } },
  },
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [] } } },
  },
];

describe('<TakeMyMoney />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    expect(wrapper.find('ReactStripeCheckout')).toMatchSnapshot();
  });

  it('creates an order ontoken', async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: 'xyz789',
        },
      },
    });

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />;
      </MockedProvider>,
    );

    const component = wrapper.find('TakeMyMoney').instance();
    // Manually call the onToken method
    component.onToken({ id: 'xyz789' }, createOrderMock);
    expect(createOrderMock).toHaveBeenCalledWith({ variables: { token: 'xyz789' } });
  });

  it('turns the progress bar on', async () => {
    NProgress.start = jest.fn();
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: 'xyz789',
        },
      },
    });

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />;
      </MockedProvider>,
    );

    const component = wrapper.find('TakeMyMoney').instance();
    // Manually call the onToken method
    component.onToken({ id: 'abc123' }, createOrderMock);
    expect(NProgress.start).toHaveBeenCalled();
  });

  it('routes to the order page on completion', async () => {
    NProgress.start = jest.fn();
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: 'xyz789',
        },
      },
    });

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />;
      </MockedProvider>,
    );

    const component = wrapper.find('TakeMyMoney').instance();
    // Manually call the onToken method
    component.onToken({ id: 'xyz789' }, createOrderMock);
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: '/order',
      query: { id: 'xyz789' },
    });
  });
});
