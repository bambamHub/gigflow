import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js' 

export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const response = await api.post('/gigs', gigData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create gig')
    }
  }
)

export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async (search = '', { rejectWithValue }) => {
    try {
      const response = await api.get(`/gigs${search ? `?search=${search}` : ''}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch gigs')
    }
  }
)

const gigsSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.gigs = action.payload
        state.loading = false
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.gigs.unshift(action.payload)
      })
  }
})

export default gigsSlice.reducer
