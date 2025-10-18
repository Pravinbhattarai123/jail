import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type User = {
    id: string
    email: string
    name?: string | null
    role?: string | null
}

export type UserState = {
    user: User | null
}

const initialState: UserState = {
    user: null,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User | null>) {
            state.user = action.payload
        },
        clearUser(state) {
            state.user = null
        },
    },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
