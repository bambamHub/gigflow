const Gig = require('../models/Gig');

const getGigs = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { title: { $regex: search, $options: 'i' }, status: 'open' } : { status: 'open' };
    const gigs = await Gig.find(query).populate('ownerId', 'name').sort({ createdAt: -1 });
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGig = async (req, res) => {
  try {
    const gig = new Gig({ ...req.body, ownerId: req.user._id });
    await gig.save();
    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGigs, createGig };
