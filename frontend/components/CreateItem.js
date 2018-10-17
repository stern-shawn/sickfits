import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import gql from 'graphql-tag';
import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';

export const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
    imageUploading: false,
  };

  handleChange = ({ target: { name, type, value } }) => {
    const val = type === 'number' ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

  uploadFile = async ({ target: { files }}) => {
    // TODO: Add check/call to delete previously uploaded image if user changes their mind while
    // using this form to prevent spam upload of multiple files to cloundinary
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'sickfits');

    this.setState({ imageUploading: true });

    const res = await fetch('https://api.cloudinary.com/v1_1/dyjo5a3ci/image/upload', {
      method: 'POST',
      body: data,
    });
    const file = await res.json();

    this.setState({
      imageUploading: false,
      image: file.secure_url,
      largeImage: file.eager[0].secure_url,
    })
  };

  render() {
    const { title, price, description, image, imageUploading } = this.state;

    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form
            onSubmit={async e => {
              e.preventDefault();
              // Send createItem mutation to GraphQL
              const res = await createItem(this.state);
              // Use the response id to do a redirect to the item detail page for the new item!
              Router.push({
                pathname: '/item',
                query: { id: res.data.createItem.id },
              });
            }}
          >
            <ErrorMessage error={error} />
            <fieldset disabled={loading || imageUploading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an Image"
                  required
                  onChange={this.uploadFile}
                />
                {imageUploading && '(Uploading image, please wait...)'}
                {image && <img src={image} alt="Upload Preview" width={200} />}
              </label>
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={title}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="price">
                Price
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="price"
                  required
                  value={price}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="description">
                Description
                <textarea
                  type="text"
                  id="description"
                  name="description"
                  placeholder="Enter a description"
                  required
                  value={description}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
