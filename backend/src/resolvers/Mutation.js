const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
  createItem: async (parent, args, ctx, info) => {
    // TODO: Check if they are logged in
    const item = await ctx.db.mutation.createItem({ data: { ...args } }, info);
    return item;
  },
  updateItem: async (parent, args, ctx, info) => {
    // TODO: Check if they are logged in
    // Strip out the id from our args to update (don't want to update that!)
    const { id, ...updates } = args;
    const item = await ctx.db.mutation.updateItem({ data: updates, where: { id } }, info);
    return item;
  },
  deleteItem: async (parent, args, ctx, info) => {
    // TODO: Check if they are logged in
    // Get the item id from args as 'where'
    const where = { id: args.id };
    // Find the Item / verify it exists, and pull just the id/title with raw graphql instead of `info`
    const item = await ctx.db.query.item({ where }, `{ id title }`);
    // TODO: Verify user either owns the item or has permissions to delete anyway (admin, etc)
    // Actually delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  signup: async (parent, args, ctx, info) => {
    args.email = args.email.toLowerCase();
    // Hash their password
    const password = await bcrypt.hash(args.password, 10);
    // Generate a user with default user permissions
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info,
    );
    // Generate an initial JWT so they can be logged in immediately after signup
    const token  = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Set that jwt as a cookie on the response so they can get it piggybacking on the user res
    ctx.response.cookie('token', token, {
      httpOnly: true, // prevent external js access to the cookie
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie expiry lol
    });
    // Finally, return the user
    return user;
  },
};

module.exports = Mutations;
