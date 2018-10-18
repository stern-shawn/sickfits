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
};

module.exports = Mutations;
