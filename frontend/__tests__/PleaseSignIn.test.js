import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import PleaseSignIn from '../components/PleaseSignIn';
import { CURRENT_USER_QUERY } from '../components/User';
import wait from 'waait';
import { fakeUser } from '../lib/testUtils';

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

describe('<PleaseSignIn />', () => {
  it('renders the signin dialog to logged out users', async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignIn />
      </MockedProvider>,
    );

    expect(wrapper.text()).toContain('Loading...');

    await wait();
    wrapper.update();

    expect(wrapper.text()).toContain('Please Sign In to continue!');
    expect(wrapper.find('Signin').exists()).toBe(true);
  });

  it('renders the component when the user is signed in', async () => {
    const Hey = () => <p>Hey!</p>;
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <PleaseSignIn>
          <Hey />
        </PleaseSignIn>
      </MockedProvider>,
    );

    expect(wrapper.text()).toContain('Loading...');

    await wait();
    wrapper.update();

    // Cool, apparently these are equivalent (contains seems more succinct)
    expect(wrapper.find(Hey).exists()).toBe(true);
    expect(wrapper.contains(Hey)).toBe(true);
  });
});
