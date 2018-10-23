import React, { Component } from 'react';
import { ApolloConsumer } from 'react-apollo';
import Downshift, { resetIdCounter } from 'downshift';
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

const routeToItem = item =>
  Router.push({
    pathname: '/item',
    query: { id: item.id },
  });

class AutoComplete extends Component {
  state = {
    items: [],
    loading: false,
  };

  // Perform a debounced query using the Apollo client directly, manually setting loading state
  onChange = debounce(async (e, client) => {
    this.setState({ loading: true });

    const { data } = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value },
    });

    this.setState({ loading: false, items: data.items });
  }, 350);

  render() {
    const { items, loading } = this.state;
    resetIdCounter();

    return (
      <SearchStyles>
        <Downshift onChange={routeToItem} itemToString={item => (item === null ? '' : item.title)}>
          {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
            <div>
              <ApolloConsumer>
                {client => (
                  <input
                    {...getInputProps({
                      type: 'search',
                      placeholder: 'Search for an Item',
                      id: 'search',
                      className: loading ? 'loading' : '',
                      onChange: e => {
                        e.persist();
                        this.onChange(e, client);
                      },
                    })}
                  />
                )}
              </ApolloConsumer>
              {isOpen && (
                <DropDown>
                  {items.map((item, idx) => (
                    <DropDownItem
                      {...getItemProps({ item })}
                      key={item.id}
                      highlighted={idx === highlightedIndex}
                    >
                      <img width={50} src={item.image} alt={item.title} />
                      {item.title}
                    </DropDownItem>
                  ))}
                  {!items.length &&
                    !loading && <DropDownItem>Nothing Found for "{inputValue}"</DropDownItem>}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }
}

export default AutoComplete;
