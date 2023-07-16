import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	theme: "" as "dark" | "light" | "",
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		toggleTheme: state => {
			state.theme = state.theme === "dark" ? "light" : "dark";
		},
		setTheme: (state, action) => {
			state.theme = action.payload;
		},
	},
});

export const { toggleTheme, setTheme } = uiSlice.actions;
export default uiSlice;
