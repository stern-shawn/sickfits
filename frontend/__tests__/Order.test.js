import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import Order, { SINGLE_ORDER_QUERY } from '../components/Order';
import { CURRENT_USER_QUERY } from '../components/User';
import wait from 'waait';
import { fakeUser, fakeOrder } from '../lib/testUtils';

const mocks = [
  {
    request: { query: SINGLE_ORDER_QUERY, variables: { id: 'ord123' } },
    result: { data: { order: fakeOrder() } },
  },
];

describe('<Order />', () => {
  it('renders and matches snap', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Order id="ord123" />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    expect(wrapper.find('div[data-test="order"]')).toMatchSnapshot();
  });
});
