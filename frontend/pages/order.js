import Order from '../components/Order';
import PleaseSignIn from '../components/PleaseSignIn';

const OrderPage = ({ query }) => (
  <div>
    <PleaseSignIn>
      <Order id={query.id} />
    </PleaseSignIn>
  </div>
);

export default OrderPage;
