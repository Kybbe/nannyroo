import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	user: null as any,
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action) => {
			state.user = action.payload;
		},
		logout: state => {
			state.user = null;
		},
	},
});

export const { setUser, logout } = userSlice.actions;
export default userSlice;
