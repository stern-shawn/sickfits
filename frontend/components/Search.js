import React, { Component } from 'react';
import { ApolloConsumer } from 'react-apollo';
import Downshift from 'downshift';
import Router from 'next/router';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

// Leverage the Prisma OR and x_contains queries to do a check for items with a title or description
// that contains the typed search term value
const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(where: { OR: [{ title_contains: $searchTerm }, { description_contains: $searchTerm }] }) {
      id
      title
      image
    }
  }
`;

class AutoComplete extends Component {
  state = {
    items: [],
    loading: false,
  };

  // Perform a debounced query using the Apollo client directly, manually setting loading state
  onChange = debounce(async (searchTerm, client) => {
    this.setState({ loading: true });

    const { data } = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm },
    });

    this.setState({ loading: false, items: data.items });
  }, 350);

  render() {
    const { items } = state;

    return (
      <SearchStyles>
        <div>
          <ApolloConsumer>
            {client => (
              <input
                type="search"
                onChange={({ target: { value } }) => this.onChange(value, client)}
              />
            )}
          </ApolloConsumer>
          <DropDown>
            {items.map(item => (
              <DropDownItem>
                <img width={50} src={item.image} alt={item.title} />
                {item.title}
              </DropDownItem>
            ))}
          </DropDown>
        </div>
      </SearchStyles>
    );
  }
}

export default AutoComplete;
