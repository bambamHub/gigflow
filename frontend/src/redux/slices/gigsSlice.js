import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchGigs = createAsyncThunk('gigs/fetchGigs', async ({ search = '' } = {}) => {
  const params = search ? `?search=${search}` : ''
  const response = await api.get(`/gigs${params}`)
  return response.data
})

export const createGig = createAsyncThunk('gigs/createGig', async (gigData) => {
  const response = await api.post('/gigs', gigData)
  return response.data
})

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
