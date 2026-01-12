// src/redux/slices/bidsSlice.js - ✅ 100% FIXED
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

export const createBid = createAsyncThunk(
  'bids/createBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bids', bidData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create bid'
      )
    }
  }
)

export const fetchBids = createAsyncThunk(
  'bids/fetchBids',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bids/${gigId}`)
      return { bids: response.data, gigId }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bids'
      )
    }
  }
)

export const hireBid = createAsyncThunk(
  'bids/hireBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/bids/${bidId}/hire`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to hire freelancer'
      )
    }
  }
)

const bidsSlice = createSlice({
  name: 'bids',
  initialState: {
    bids: [],
    loading: false,
    bidsLoading: false,
    error: null,
    notifications: []
  },
  reducers: {
    clearBidsError: (state) => {
      state.error = null
    },
    clearBids: (state) => {
      state.bids = []
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // CREATE BID
      .addCase(createBid.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.loading = false
        state.bids.push(action.payload)
      })
      .addCase(createBid.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // FETCH BIDS
      .addCase(fetchBids.pending, (state) => {
        state.bidsLoading = true
        state.error = null
      })
      .addCase(fetchBids.fulfilled, (state, action) => {
        state.bidsLoading = false
        state.bids = action.payload.bids
      })
      .addCase(fetchBids.rejected, (state, action) => {
        state.bidsLoading = false
        state.error = action.payload
      })

      // HIRE BID
      .addCase(hireBid.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(hireBid.fulfilled, (state, action) => {
        state.loading = false
        // Update the hired bid status
        const index = state.bids.findIndex(bid => bid._id === action.payload._id)
        if (index !== -1) {
          state.bids[index] = action.payload
        }
      })
      .addCase(hireBid.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearBidsError, clearBids } = bidsSlice.actions
export default bidsSlice.reducer
