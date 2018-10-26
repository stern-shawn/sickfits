import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import { ApolloConsumer } from 'react-apollo';
import Signup, { SIGNUP_MUTATION } from '../components/Signup';
import { CURRENT_USER_QUERY } from '../components/User';
import wait from 'waait';
import { fakeUser } from '../lib/testUtils';

// Helper to update an input's value
const type = (wrapper, name, value) =>
  wrapper.find(`input[name="${name}"]`).simulate('change', { target: { name, value } });

const me = fakeUser();
const mocks = [
  // Signup mock
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: { email: me.email, name: me.name, password: 'test' },
    },
    result: {
      data: {
        signup: {
          __typename: 'User',
          id: 'abc123',
          email: me.email,
          name: me.name,
        },
      },
    },
  },
  // Current User Mock
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me } },
  },
];

describe('<Signup />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider>
        <Signup />
      </MockedProvider>,
    );

    expect(wrapper.find('form')).toMatchSnapshot();
  });

  it('calls the mutation properly and refetches the user after completion', async () => {
    // We need to expose the client so we can query it and inspect it after mutations are run
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <Signup />;
          }}
        </ApolloConsumer>
      </MockedProvider>,
    );

    await wait();
    wrapper.update();

    type(wrapper, 'name', me.name);
    type(wrapper, 'email', me.email);
    type(wrapper, 'password', 'test');

    wrapper.update();

    wrapper.find('form').simulate('submit');
    await wait();

    // Query the user out of the client. Query returns a promise so we need to await
    const user = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(user.data.me).toMatchObject(me);
  });

});
