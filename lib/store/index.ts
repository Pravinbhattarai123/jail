import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'

export const makeStore = () =>
    configureStore({
        reducer: {
            user: userReducer,
        },
        devTools: process.env.NODE_ENV !== 'production',
    })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
