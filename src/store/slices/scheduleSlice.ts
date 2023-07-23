import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	schedule: {
		events: [],
	} as EventStore,
};

const scheduleSlice = createSlice({
	name: "schedule",
	initialState,
	reducers: {
		setSchedule: (state, action) => {
			state.schedule = action.payload;
		},
		addEvent: (state, action) => {
			state.schedule.events.push(action.payload);
		},
		updateEvent: (state, action) => {
			const eventIndex = state.schedule.events.findIndex(
				event => event.id === action.payload.id
			);
			state.schedule.events[eventIndex] = action.payload;
		},
		deleteEvent: (state, action) => {
			state.schedule.events = state.schedule.events.filter(
				event => event.id !== action.payload
			);
		},
	},
});

export const { setSchedule, addEvent, updateEvent, deleteEvent } =
	scheduleSlice.actions;
export default scheduleSlice;
