import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const createBid = createAsyncThunk('bids/createBid', async (bidData) => {
  const response = await api.post('/bids', bidData)
  return response.data
})

export const fetchBids = createAsyncThunk('bids/fetchBids', async (gigId) => {
  const response = await api.get(`/bids/${gigId}`)
  return response.data
})

export const hireBid = createAsyncThunk('bids/hireBid', async (bidId) => {
  const response = await api.patch(`/bids/${bidId}/hire`)
  return response.data
})

const bidsSlice = createSlice({
  name: 'bids',
  initialState: {
    bids: [],
    loading: false,
    notifications: []
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBids.fulfilled, (state, action) => {
        state.bids = action.payload
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.bids.push(action.payload)
      })
  }
})

export default bidsSlice.reducer
