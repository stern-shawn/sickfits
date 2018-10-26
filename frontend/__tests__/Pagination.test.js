import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import Router from 'next/router';
import Pagination, { PAGINATION_QUERY } from '../components/Pagination';
import wait from 'waait';

Router.router = {
  push() {},
  prefetch() {},
};

const makeMocksFor = length => [
  {
    request: { query: PAGINATION_QUERY },
    result: {
      data: {
        itemsConnection: {
          __typename: 'aggregate',
          aggregate: {
            __typename: 'count',
            count: length,
          },
        },
      },
    },
  },
];

describe('<Pagination />', () => {
  it('displays an initial loading message', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(1)}>
        <Pagination page={1} />
      </MockedProvider>,
    );

    expect(wrapper.text()).toContain('Loading...');
  });

  it('renders pagination for more items(18)', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    expect(wrapper.find('.totalPages').text()).toEqual('5');
    expect(wrapper.find('[data-test="pagination"]')).toMatchSnapshot();
  });

  it('disables the prev button on the first page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    expect(wrapper.find('a.prev').prop('aria-disabled')).toBeTruthy();
    expect(wrapper.find('a.next').prop('aria-disabled')).toBeFalsy();
  });

  it('disables the next button on the last page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={5} />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    expect(wrapper.find('a.prev').prop('aria-disabled')).toBeFalsy();
    expect(wrapper.find('a.next').prop('aria-disabled')).toBeTruthy();
  });

  it('enables all buttons on a middle page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={3} />
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    expect(wrapper.find('a.prev').prop('aria-disabled')).toBeFalsy();
    expect(wrapper.find('a.next').prop('aria-disabled')).toBeFalsy();
  });
});
