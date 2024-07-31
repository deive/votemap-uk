import { createSlice } from '@reduxjs/toolkit'

const awsSlice = createSlice({
    name: 'aws',
    initialState: {
        clientInitilised: false,
    },
    reducers: {
        setInitilised: (state) => {
            state.clientInitilised = true
        },
    },
})

export default awsSlice.reducer
export const { setInitilised } = awsSlice.actions
export const selectClientInitilised = state => state.clientInitilised