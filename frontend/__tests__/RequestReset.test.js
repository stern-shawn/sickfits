import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import RequestReset, { REQUEST_RESET_MUTATION } from '../components/RequestReset';
import wait from 'waait';

const mocks = [
  {
    request: { query: REQUEST_RESET_MUTATION, variables: { email: 'test@example.com' } },
    result: {
      data: {
        requestReset: {
          __typename: 'Message',
          message: 'Yep',
        },
      },
    },
  },
];

describe('<RequestReset />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>,
    );

    expect(wrapper.find('[data-test="form"]')).toMatchSnapshot();
  });

  it('calls the mutation on submit and resets the form', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>,
    );
    // Simulate typing in an email
    wrapper
      .find('input')
      .simulate('change', { target: { name: 'email', value: 'test@example.com' } });
    // Submit!
    wrapper.find('form').simulate('submit');

    await wait();
    wrapper.update();

    expect(wrapper.find('p').text()).toEqual('Success! Check your email for a reset link!');
    expect(wrapper.find('input').text()).toEqual('');
  });
});
