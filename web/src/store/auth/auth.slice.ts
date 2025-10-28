import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthStoreInterface } from "../../interfaces/auth.interface";

const initialState: AuthStoreInterface = {
    user: null,
    token: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<AuthStoreInterface>) => {
            if (globalThis.window !== undefined) {
                localStorage.setItem("user", JSON.stringify(action.payload.user));
            }

            state.user = action.payload.user;
        },
        logout: (state) => {
            if (globalThis.window !== undefined) {
                localStorage.removeItem("user");
            }

            state.user = null;
            state.token = null;
        },
        update: (state, action: PayloadAction<AuthStoreInterface>) => {
            if (globalThis.window !== undefined) {
                localStorage.setItem("user", JSON.stringify(action.payload.user));
            }

            state.user = action.payload.user;
        },
        get: (state) => {
            if (globalThis.window === undefined) {
                return;
            }

            const user = localStorage.getItem("user");

            if (user) {
                try {
                    state.user = JSON.parse(user);
                } catch {
                    state.user = null;
                }
            }
        },
    },
});

export const { login, logout, update, get } = authSlice.actions;

export default authSlice.reducer;
