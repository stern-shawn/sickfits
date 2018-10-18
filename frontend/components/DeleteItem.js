import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { ALL_ITEMS_QUERY } from './Items';

export const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

class DeleteItem extends Component {
  update = (cache, payload) => {
    // Manually update our cache instead of doing a full refetch on changes
    // 1. Read our cache using the query that created it in the first place
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    // 2. Filter out the item we're deleting
    const filteredItems = data.items.filter(item => item.id !== payload.data.deleteItem.id);
    // 3. Write the updated items back into the cache
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data: { items: filteredItems } });
  };

  render() {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
      >
        {(deleteItem, { error }) => {
          return (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this item?')) {
                  deleteItem();
                }
              }}
            >
              {this.props.children}
            </button>
          );
        }}
      </Mutation>
    );
  }
}

export default DeleteItem;
