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
			const event = state.schedule.events.find(e => e.id === action.payload.id);
			if (event) {
				Object.assign(event, action.payload);
			}
		},
		deleteEvent: (state, action) => {
			state.schedule.events = state.schedule.events.filter(
				event => event.id !== action.payload.id
			);
		},
	},
});

export const { setSchedule, addEvent, updateEvent, deleteEvent } =
	scheduleSlice.actions;
export default scheduleSlice;
