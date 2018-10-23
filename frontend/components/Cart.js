import React from 'react';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import gql from 'graphql-tag';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import User from './User';
import CartItem from './CartItem';
import TakeMyMoney from './TakeMyMoney';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';

// Query the client-only part of cache using the @client directive
export const CART_QUERY = gql`
  query {
    cartOpen @client
  }
`;

// Mutate the client-only part of cache using the @client directive
export const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

// If we only pass user: <User /> we'll get a no children prop warning from react, workaround
// is to provide each with the given render fn from adopt
const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>,
  localState: ({ render }) => <Query query={CART_QUERY}>{render}</Query>,
});

const Cart = () => (
  <Composed>
    {({ user, toggleCart, localState }) => {
      // Destructure out the data from our query components
      const { me } = user.data;
      const { cartOpen } = localState.data;

      if (!me) return null;

      return (
        <CartStyles open={cartOpen}>
          <header>
            <CloseButton title="close" onClick={toggleCart}>
              &times;
            </CloseButton>
            <Supreme>
              {me.name}
              's Cart
            </Supreme>
            <p>
              You have {me.cart.length} item
              {me.cart.length === 1 ? '' : 's'} in your cart.
            </p>
          </header>
          <ul>
            {me.cart.map(cartItem => (
              <CartItem key={cartItem.id} cartItem={cartItem} />
            ))}
          </ul>
          <footer>
            <p>{formatMoney(calcTotalPrice(me.cart))}</p>
            <TakeMyMoney>
              <SickButton disabled={me.cart.length === 0}>Checkout</SickButton>
            </TakeMyMoney>
          </footer>
        </CartStyles>
      );
    }}
  </Composed>
);

export default Cart;
