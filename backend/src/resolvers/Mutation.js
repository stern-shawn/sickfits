const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermissions } = require('../utils');

// Generates a JWT for the given user and attaches it as a cookie to the provided response object
const assignToken = (user, response) => {
  // Generate JWT
  const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
  // Set the JWT onto cookies
  response.cookie('token', token, {
    httpOnly: true, // prevent external js access to the cookie
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie expiry lol
  });
};

// randomBytes is an async callback fn by default, use promisify util for syntax sugar
const randomBytesPromise = promisify(randomBytes);

const Mutations = {
  createItem: async (parent, args, { db, request }, info) => {
    if (!request.userId) throw new Error('You must be logged in to do that!');
    const item = await db.mutation.createItem(
      {
        data: {
          // This is how we create an Item <-> User relationship
          user: {
            connect: {
              id: request.userId,
            },
          },
          ...args,
        },
      },
      info,
    );
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
    // Get the item id from args as 'where'
    const where = { id: args.id };
    // Find the Item / verify it exists, and pull just the id/title with raw graphql instead of `info`
    // In addition, we'll need to query for the connected user and their id for permission checking
    const item = await ctx.db.query.item({ where }, `{ id title user { id }}`);
    // Verify user either owns the item or has permissions to delete anyway (admin, etc)
    const ownsItem = (item.user.id = ctx.request.userId);
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission),
    );
    if (!ownsItem && !hasPermissions) throw new Error('You do not have permission to do that!');
    // Actually delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  signup: async (parent, args, { db, response }, info) => {
    args.email = args.email.toLowerCase();
    // Hash their password
    const password = await bcrypt.hash(args.password, 10);
    // Generate a user with default user permissions
    const user = await db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info,
    );
    // Generate and assign the jwt as a cookie on future requests
    assignToken(user, response);
    // Finally, return the user
    return user;
  },
  signin: async (parent, { email, password }, { db, response }, info) => {
    // Check for user
    const user = await db.query.user({ where: { email } });
    if (!user) throw new Error(`No user found for email: ${email}!`);
    // Check for correct password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid Password');
    // Generate and assign the jwt as a cookie on future requests
    assignToken(user, response);
    // Finally, return the user
    return user;
  },
  signout: async (parent, args, { response }, info) => {
    response.clearCookie('token');
    return { message: 'Bye!' };
  },
  requestReset: async (parent, { email }, { db }, info) => {
    // Check if user exists
    const user = await db.query.user({ where: { email } });
    if (!user) throw new Error(`No user found for email: ${email}!`);
    // Generate and assign a reset token to the user.
    const resetToken = (await randomBytesPromise(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1hr from now
    const res = await db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });
    // Email the token to the user
    const mailRes = await transport.sendMail({
      from: 'support@sickfits.com',
      to: email,
      subject: 'Sick Fits Password Reset',
      html: makeANiceEmail(
        `Your Password Reset Token is here!
        \n\n
        <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click Here to Reset</a>`,
      ),
    });
    // Return a success payload once all steps are complete
    return { message: 'Reset token assigned!' };
  },
  resetPassword: async (
    parent,
    { resetToken, password, confirmPassword },
    { db, response },
    info,
  ) => {
    // Check that the passwords match
    if (password !== confirmPassword) throw new Error('Passwords do not match!');
    // Check if legit reset token (matches a user and is not expired, _gte is a Prisma-generated query option)
    const [user] = await db.query.users({
      where: { resetToken, resetTokenExpiry_gte: Date.now() - 3600000 },
    });
    if (!user) throw new Error('This token is either invalid or expired');
    // Hash the new password
    const newPassword = await bcrypt.hash(password, 10);
    // Save new pw to the user, nullify reset token fields
    const updatedUser = await db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    // Generate a new jwt and set it to their new session
    assignToken(user, response);
    // Return the user
    return updatedUser;
  },
  updatePermissions: async (parent, { permissions, userId }, { db, request }, info) => {
    // Check if logged in first
    if (!request.userId) throw new Error('You must be logged in to do that!');
    // Check if they have permissions to do the update
    hasPermissions(request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    // Update permissions of targeted user
    return db.mutation.updateUser(
      {
        where: { id: userId },
        data: {
          // Because permissions is a custom enum, we need to use Prisma's `set` arg
          permissions: {
            set: permissions,
          },
        },
      },
      info,
    );
  },
};

module.exports = Mutations;
