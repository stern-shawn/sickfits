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
};

module.exports = Mutations;
