const { forwardTo } = require('prisma-binding');

const Query = {
  // This is essentially just doing the exact same thing as querying items from Prisma directly,
  // there's a helper fn forwardTo exactly for that!
  // items: async (parent, args, ctx, info) => {
  //   const items = await ctx.db.query.items();
  //   return items;
  // },
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
};

module.exports = Query;
