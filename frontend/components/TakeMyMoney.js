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

const totalItems = cart => cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);

class TakeMyMoney extends Component {
  onToken = res => {
    console.log('Token get!');
    console.log(res.id);
  };

  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <StripeCheckout
            amount={calcTotalPrice(me.cart)}
            name="Sick Fits"
            description={`Order of ${totalItems(me.cart)} item${me.cart.length === 1 ? '' : 's'}`}
            image={me.cart[0] && me.cart[0].item.image}
            stripeKey="pk_test_zocXJDydz3EqYJxc3JGDn8eh" // Public key, safe to have in FE
            currency="USD"
            email={me.email}
            token={res => this.onToken(res)}
          >
            {this.props.children}
          </StripeCheckout>
        )}
      </User>
    );
  }
}

export default TakeMyMoney;
