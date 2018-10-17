const Mutations = {
  createDog: (parent, { name }, ctx, info) => {
    global.dogs = global.dogs || [];
    const newDog = { name };
    global.dogs.push(newDog);
    return newDog;
  },
};

module.exports = Mutations;
