import { createSlice } from '@reduxjs/toolkit'

export const LoginState = Object.freeze({
    UNAUTHENTICATED: "LoginState.UNAUTHENTICATED",
    LOGGING_IN: "LoginState.LOGGING_IN",
    ERROR: "LoginState.ERROR",
    AUTHENTICATED: "LoginState.AUTHENTICATED",
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        loginRequest: undefined,
        loginState: LoginState.UNAUTHENTICATED,
        loginToken: undefined,
    },
    reducers: {
        login: (state, data) => {
            state.loginRequest = {
                username: data.payload.username,
                password: data.payload.password,
            }
            state.loginState = LoginState.LOGGING_IN
        },
        logout: (state) => {
            state.loginRequest = undefined
            state.loginState = LoginState.UNAUTHENTICATED
            state.loginToken = undefined
        },
        setLogInError: (state, data) => {
            state.loginRequest = state.loginRequest ?? {}
            state.loginRequest.error = data.payload.error
            state.loginState = LoginState.ERROR
        },
        setLoggedIn: (state, data) => {
            state.loginRequest = undefined
            state.loginState = LoginState.AUTHENTICATED
            state.loginToken = data.payload.token
        },
    },
})

export default authSlice.reducer
export const { login, logout, setLogInError, setLoggedIn } = authSlice.actions
export const selectLoginRequest = state => state.loginRequest
export const selectLoginState = state => state.loginState
export const selectLoginToken = state => state.loginToken