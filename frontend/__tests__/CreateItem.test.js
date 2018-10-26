import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import CreateItem, { CREATE_ITEM_MUTATION } from '../components/CreateItem';
import wait from 'waait';
import Router from 'next/router';
import { fakeItem } from '../lib/testUtils';

Router.router = {
  push: jest.fn(),
};

const dogImage = 'https://dog.com/dog.jpg';

// Mock the fetch API
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: dogImage,
    eager: [{ secure_url: dogImage }],
  }),
});

describe('<CreateItem />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>,
    );

    expect(wrapper.find('form[data-test="form"]')).toMatchSnapshot();
  });

  it('uploads a file when changed', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>,
    );
    // Simulate typing in an email
    wrapper.find('input[type="file"]').simulate('change', { target: { files: [dogImage] } });
    await wait();

    const component = wrapper.find(CreateItem).instance();
    expect(component.state.image).toEqual(dogImage);
    expect(component.state.largeImage).toEqual(dogImage);
    expect(global.fetch).toHaveBeenCalled();
    global.fetch.mockReset();
  });

  it('handles state updates', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>,
    );

    const inputs = {
      title: 'testing',
      price: 123,
      description: 'this is a test item',
    };

    // Simulate typing in an email
    wrapper.find('#title').simulate('change', { target: { name: 'title', value: inputs.title } });
    wrapper
      .find('#price')
      .simulate('change', { target: { name: 'price', value: inputs.price, type: 'number' } });
    wrapper
      .find('#description')
      .simulate('change', { target: { name: 'description', value: inputs.description } });

    expect(wrapper.find(CreateItem).instance().state).toMatchObject(inputs);
  });

  it('creates an item on form submit', async () => {
    const item = fakeItem();

    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTATION,
          variables: {
            title: item.title,
            description: item.description,
            image: '',
            largeImage: '',
            price: item.price,
            imageUploading: false, // we probably shouldn't be submitting this, but it gets ignored anyway 🤷‍♂️
          },
        },
        result: {
          data: {
            createItem: { ...item, __typename: 'Item' },
          },
        },
      },
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>,
    );

    wrapper.find('#title').simulate('change', { target: { name: 'title', value: item.title } });
    wrapper
      .find('#price')
      .simulate('change', { target: { name: 'price', value: item.price, type: 'number' } });
    wrapper
      .find('#description')
      .simulate('change', { target: { name: 'description', value: item.description } });
    wrapper.find('form').simulate('submit');

    await wait(50);

    // Expect successful item creation to result in the user being redirected to the item page by id
    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({ pathname: '/item', query: { id: 'abc123' } });
  });
});
