const { forwardTo } = require('prisma-binding');

const Query = {
  items: forwardTo('db'),
  // This is essentially just doing the exact same thing as querying items from Prisma directly,
  // there's a helper fn forwardTo exactly for that!
  // items: async (parent, args, ctx, info) => {
  //   const items = await ctx.db.query.items();
  //   return items;
  // },
};

module.exports = Query;
