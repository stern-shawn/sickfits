import React from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';
import styled from 'styled-components';

const REMOVE_FROM_CART_MUTATION = gql`
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

class RemoveFromCart extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };

  render() {
    const { id } = this.props;

    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
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
  }
}

export default RemoveFromCart;
