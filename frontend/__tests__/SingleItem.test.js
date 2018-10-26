import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import SingleItem, { SINGLE_ITEM_QUERY } from '../components/SingleItem';
import wait from 'waait';
import { fakeItem } from '../lib/testUtils';

describe('<SingleItem />', () => {
  it('renders with proper data', async () => {
    const mocks = [
      {
        // If somebody makes this query
        request: { query: SINGLE_ITEM_QUERY, variables: { id: '123' } },
        // Return this data
        result: { data: { item: fakeItem() } },
      },
    ];
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>,
    );

    expect(wrapper.text()).toContain('Loading...');

    await wait(); // wait for response, 0ms delay will make us wait until next tick

    wrapper.update();
    expect(wrapper.find('h2')).toMatchSnapshot();
    expect(wrapper.find('img')).toMatchSnapshot();
    expect(wrapper.find('p')).toMatchSnapshot();
  });

  it('errors with a not found items', async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: '123' } },
        // We can mock errors by returning errors instead of data :D
        result: { errors: [{ message: 'Items Not Found!' }] },
      },
    ];
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>,
    );

    expect(wrapper.text()).toContain('Loading...');

    await wait(); // wait for response, 0ms delay will make us wait until next tick

    wrapper.update();
    const item = wrapper.find('[data-test="graphql-error"]');
    expect(item.text()).toContain('Items Not Found!');
    expect(item).toMatchSnapshot();
  });
});
