import { createSlice } from '@reduxjs/toolkit';
import enums from '../../constant/enum';

const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    role: enums.ROLES.UNKNOWN,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
            state.role = action.payload.role;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.role = enums.ROLES.UNKNOWN;
        },
        setToken: (state, action) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        refreshToken: (state, action) => {
            state.accessToken = action.payload;
        },
    },
});

export const { loginSuccess, logout, refreshToken, setToken } = authSlice.actions;
export default authSlice.reducer;
