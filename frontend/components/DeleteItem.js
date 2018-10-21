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
  update = (cache, { data: { deleteItem }}) => {
    // Manually update our cache instead of doing a full refetch on changes
    // Read our cache using the query that created it in the first place; destructure items
    const { items } = cache.readQuery({ query: ALL_ITEMS_QUERY });
    // Write the new items state back into the cache
    cache.writeQuery({
      query: ALL_ITEMS_QUERY,
      data: {
        // Filter out the item we're deleting
        items: items.filter(item => item.id !== deleteItem.id),
      },
    });
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
