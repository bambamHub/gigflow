const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');

const createBid = async (req, res) => {
  try {
    const bid = new Bid({ ...req.body, freelancerId: req.user._id });
    await bid.save();
    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBidsByGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId);
    if (!gig || gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const bids = await Bid.find({ gigId }).populate('freelancerId', 'name');
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const hireBid = async (req, res) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    
    const { bidId } = req.params;
    
    // VALIDATE bidId format first
    if (!mongoose.Types.ObjectId.isValid(bidId)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid bid ID format' });
    }
    
    const bid = await Bid.findById(bidId).session(session).populate('freelancerId');
    
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Bid not found' });
    }
    
    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig || gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to hire for this gig' });
    }
    
    // Check gig status
    if (gig.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ message: `Gig status is '${gig.status}', cannot hire` });
    }
    
    // Atomic updates
    gig.status = 'assigned';
    await gig.save({ session });
    
    bid.status = 'hired';
    await bid.save({ session });
    
    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: bidId }, status: 'pending' },
      { status: 'rejected' },
      { session }
    );
    
    await session.commitTransaction();
    
    res.json({ 
      message: 'Freelancer hired successfully!',
      gigId: gig._id,
      bidId: bid._id 
    });
    
  } catch (error) {
    if (session) {
      try { await session.abortTransaction(); } catch(e) {}
    }
    console.error('Hire error:', error.message);
    res.status(500).json({ message: 'Server error during hire process' });
  } finally {
    if (session) session.endSession().catch(console.error);
  }
};


module.exports = { createBid, getBidsByGig, hireBid };
