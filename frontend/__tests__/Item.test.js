import ItemComponent from '../components/Item';
import { shallow } from 'enzyme';

const fakeItem = {
  id: 'ABC123',
  title: 'An Item',
  price: 5000,
  description: 'Cool Item',
  image: 'dog.jpg',
  largeImage: 'bigDog.jpg',
};

describe('<Item />', () => {
  it('renders pricetag and title properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    expect(wrapper.find('PriceTag').children().text()).toBe('$50')
    expect(wrapper.find('Title a').text()).toBe(fakeItem.title);
  });

  it('renders the image', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    expect(wrapper.find('img').props().src).toBe(fakeItem.image);
    expect(wrapper.find('img').props().alt).toBe(fakeItem.title);
  });

  it('renders the buttons as expected', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    const buttonList = wrapper.find('.buttonList');
    expect(buttonList.children().length).toBe(3);
    expect(buttonList.find('Link')).toHaveLength(1);
    expect(buttonList.find('AddToCart')).toHaveLength(1);
    expect(buttonList.find('DeleteItem')).toHaveLength(1);
  });

  it('renders and matches the snapshot', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    expect(wrapper).toMatchSnapshot();
  });
});
