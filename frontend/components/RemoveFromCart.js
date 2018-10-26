import React from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';
import styled from 'styled-components';

export const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${({ theme }) => theme.red};
    cursor: pointer;
  }
`;

const RemoveFromCart = ({ id }) => (
  <Mutation
    mutation={REMOVE_FROM_CART_MUTATION}
    variables={{ id }}
    update={(cache, payload) => {
      // Read from cache
      const data = cache.readQuery({ query: CURRENT_USER_QUERY });
      // Update the data to remove the targeted cart item
      const idToRemove = payload.data.removeFromCart.id;
      data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== idToRemove);
      // Write the new data back to the cache
      cache.writeQuery({ query: CURRENT_USER_QUERY, data });
    }}
    optimisticResponse={{
      removeFromCart: {
        __typename: 'CartItem',
        id,
      },
    }}
  >
    {(removeFromCart, { loading }) => (
      <BigButton
        title="Remove Item from Cart"
        onClick={() => removeFromCart().catch(err => alert(err.message))}
        disabled={loading}
      >
        &times;
      </BigButton>
    )}
  </Mutation>
);

RemoveFromCart.propTypes = {
  id: PropTypes.string.isRequired,
};

export default RemoveFromCart;
