const Community = require('../models/Community');

const initDefaultCommunity = async () => {
  const existing = await Community.findOne({ name: 'Main Group' });
  if (!existing) {
    const community = new Community({
      name: 'Main Group',
      description: 'The global chatroom for paid members',
    });
    await community.save();
    console.log('✅ Default community created:', community._id);
  } else {
    console.log('📌 Default community exists:', existing._id);
  }
};

module.exports = initDefaultCommunity;
