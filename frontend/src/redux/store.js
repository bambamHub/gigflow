import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import gigsSlice from './slices/gigsSlice'
import bidsSlice from './slices/bidsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    gigs: gigsSlice,
    bids: bidsSlice
  }
})
