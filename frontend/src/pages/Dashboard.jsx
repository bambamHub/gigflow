import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { fetchGigs, createGig } from '../redux/slices/gigsSlice'
import { createBid, fetchBids, hireBid } from '../redux/slices/bidsSlice'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { gigs, loading: gigsLoading } = useSelector(state => state.gigs)
  const { bids, bidsLoading } = useSelector(state => state.bids)
  const [search, setSearch] = useState('')
  const [selectedGig, setSelectedGig] = useState(null)
  const [showCreateGig, setShowCreateGig] = useState(false)
  const [gigForm, setGigForm] = useState({ title: '', description: '', budget: '' })
  const [bidForm, setBidForm] = useState({ message: '', price: '' })
  const [loadingStates, setLoadingStates] = useState({})

  useEffect(() => {
    dispatch(fetchGigs())
    if (!user) {
      dispatch(setUser({ id: 'demo123', name: 'Demo Client', email: 'client@test.com' }))
    }
  }, [dispatch])

  const handleSearch = () => dispatch(fetchGigs({ search }))

  const handleCreateGig = async (e) => {
    e.preventDefault()
    setLoadingStates(prev => ({...prev, createGig: true}))
    try {
      await dispatch(createGig(gigForm)).unwrap()
      dispatch(fetchGigs()) // Refresh gigs
      setShowCreateGig(false)
      setGigForm({ title: '', description: '', budget: '' })
    } catch (error) {
      console.error('Create gig error:', error)
    } finally {
      setLoadingStates(prev => ({...prev, createGig: false}))
    }
  }

  const handleCreateBid = async (e) => {
    e.preventDefault()
    setLoadingStates(prev => ({...prev, submitBid: true}))
    try {
      await dispatch(createBid({ gigId: selectedGig._id, ...bidForm })).unwrap()
      setBidForm({ message: '', price: '' })
      if (selectedGig.ownerId?._id === user?.id) {
        dispatch(fetchBids(selectedGig._id))
      }
    } catch (error) {
      console.error('Create bid error:', error)
    } finally {
      setLoadingStates(prev => ({...prev, submitBid: false}))
    }
  }

  const handleHireBid = async (bidId) => {
    setLoadingStates(prev => ({...prev, [bidId]: true}))
    try {
      await dispatch(hireBid(bidId)).unwrap()
      dispatch(fetchGigs()) // Refresh gigs list
      dispatch(fetchBids(selectedGig._id))
    } catch (error) {
      console.error('Hire bid error:', error)
    } finally {
      setLoadingStates(prev => ({...prev, [bidId]: false}))
    }
  }

  const loadBidsForGig = async (gigId) => {
    dispatch(fetchBids(gigId))
  }

  return (
    <>
      {/* Search & Create Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="flex gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gigs by title..."
                className="flex-1 px-5 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowCreateGig(true)}
            disabled={loadingStates.createGig}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50"
          >
            + Post New Gig
          </button>
        </div>
      </div>

      {/* Open Gigs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {gigsLoading ? (
          <div className="col-span-full text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading gigs...</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-lg p-12">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No gigs found</h3>
            <p className="text-gray-500 mb-6">Be the first to post a gig or try a different search</p>
            <button
              onClick={() => setShowCreateGig(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
            >
              Create First Gig
            </button>
          </div>
        ) : (
          gigs.map((gig) => (
            <div
              key={gig._id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 cursor-pointer overflow-hidden"
              onClick={() => {
                setSelectedGig(gig)
                if (gig.ownerId?._id === user?.id) {
                  loadBidsForGig(gig._id)
                }
              }}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {gig.title}
                  </h3>
                  <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 font-bold rounded-xl text-lg">
                    ${gig.budget}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6">{gig.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">by {gig.ownerId?.name || 'Someone'}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      gig.status === 'assigned' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {gig.status || 'open'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Gig Modal */}
      {selectedGig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedGig.title}</h2>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>${selectedGig.budget}</span>
                    <span>by {selectedGig.ownerId?.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGig(null)}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8">
              {selectedGig.ownerId?._id === user?.id ? (
                // Client view - Show bids
                <>
                  <h3 className="text-2xl font-bold mb-8 flex items-center space-x-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Bids ({bids.length}) {bidsLoading && <span className="text-sm text-blue-600">Loading...</span>}</span>
                  </h3>
                  {bids.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <p className="text-gray-500 text-lg">No bids yet. Share your gig on social media!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bids.map((bid) => (
                        <div key={bid._id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{bid.freelancerId?.name?.[0] || 'F'}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-xl text-gray-900">{bid.freelancerId?.name || 'Freelancer'}</h4>
                                <p className="text-gray-600">{bid.message}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-2xl font-bold text-emerald-600">${bid.price}</div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                              bid.status === 'hired' ? 'bg-emerald-100 text-emerald-800' :
                              bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {bid.status?.toUpperCase() || 'PENDING'}
                            </span>
                            {bid.status === 'pending' && !loadingStates[bid._id] && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleHireBid(bid._id)
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl w-full mt-2"
                              >
                                Hire Freelancer
                              </button>
                            )}
                            {loadingStates[bid._id] && (
                              <div className="px-6 py-3 bg-blue-100 text-blue-800 rounded-xl font-semibold w-full text-center">
                                Hiring...
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Freelancer view - Bid form
                <form onSubmit={handleCreateBid} className="space-y-6">
                  <h3 className="text-3xl font-bold mb-8 flex items-center space-x-3 text-gray-900">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Place Your Bid</span>
                  </h3>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-4">Your Proposal</label>
                    <textarea
                      value={bidForm.message}
                      onChange={(e) => setBidForm({...bidForm, message: e.target.value})}
                      placeholder="Tell the client why you're perfect for this gig..."
                      className="w-full p-6 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-300 resize-vertical min-h-[120px] text-lg"
                      required
                      disabled={loadingStates.submitBid}
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-4">Your Price</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg">$</span>
                      </div>
                      <input
                        type="number"
                        value={bidForm.price}
                        onChange={(e) => setBidForm({...bidForm, price: e.target.value})}
                        placeholder="150"
                        className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 text-lg"
                        required
                        disabled={loadingStates.submitBid}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loadingStates.submitBid}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loadingStates.submitBid ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        'Submit Bid'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGig(null)}
                      className="px-8 py-5 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
                      disabled={loadingStates.submitBid}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Gig Modal */}
      {showCreateGig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Post New Gig</span>
              </h2>
            </div>
            <form onSubmit={handleCreateGig} className="p-8 space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Gig Title</label>
                <input
                  type="text"
                  value={gigForm.title}
                  onChange={(e) => setGigForm({...gigForm, title: e.target.value})}
                  placeholder="e.g. Build responsive landing page"
                  className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-300 text-lg"
                  required
                  disabled={loadingStates.createGig}
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Description</label>
                <textarea
                  value={gigForm.description}
                  onChange={(e) => setGigForm({...gigForm, description: e.target.value})}
                  placeholder="Describe your project requirements..."
                  className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-300 resize-vertical min-h-[150px] text-lg"
                  required
                  disabled={loadingStates.createGig}
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Budget</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-xl">$</span>
                  </div>
                  <input
                    type="number"
                    value={gigForm.budget}
                    onChange={(e) => setGigForm({...gigForm, budget: e.target.value})}
                    placeholder="500"
                    className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-300 text-lg"
                    required
                    disabled={loadingStates.createGig}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loadingStates.createGig}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loadingStates.createGig ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Post Gig'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateGig(false)}
                  className="px-8 py-5 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
                  disabled={loadingStates.createGig}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
