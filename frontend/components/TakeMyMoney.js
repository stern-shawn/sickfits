import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import NProgress from 'nprogress';
import calcTotalPrice from '../lib/calcTotalPrice';
import ErrorMessage from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

const totalItems = cart => cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);

class TakeMyMoney extends Component {
  onToken = (res, createOrder) =>
    createOrder({ variables: { token: res.id } }).catch(err => alert(err.message));

  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <Mutation
            mutation={CREATE_ORDER_MUTATION}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}
          >
            {createOrder => (
              <StripeCheckout
                amount={calcTotalPrice(me.cart)}
                name="Sick Fits"
                description={`Order of ${totalItems(me.cart)} item${
                  me.cart.length === 1 ? '' : 's'
                }`}
                image={me.cart[0] && me.cart[0].item.image}
                stripeKey="pk_test_zocXJDydz3EqYJxc3JGDn8eh" // Public key, safe to have in FE
                currency="USD"
                email={me.email}
                token={res => this.onToken(res, createOrder)}
              >
                {this.props.children}
              </StripeCheckout>
            )}
          </Mutation>
        )}
      </User>
    );
  }
}

export default TakeMyMoney;
