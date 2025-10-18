"use client"
import React from 'react'
import { Provider } from 'react-redux'
import { makeStore } from './index'

// Create a fresh store per request on the client side
const store = makeStore()

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
