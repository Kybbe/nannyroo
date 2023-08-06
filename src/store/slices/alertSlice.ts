import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	alertInfo: null as {
		title: string;
		description?: string;
		cancelText?: string;
		confirmText?: string;
		alertType: "error" | "success" | "warning";
		confirm: boolean;
		onConfirm: () => void;
	} | null,
};

const alertSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		openAlert: (state, action) => {
			state.alertInfo = action.payload;
		},
		closeAlert: state => {
			state.alertInfo = null;
		},
	},
});

export const { openAlert, closeAlert } = alertSlice.actions;
export default alertSlice;
