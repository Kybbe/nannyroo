import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	activeSchedule: {
		_id: "all",
		title: "All schedules combined",
		users: {
			ownerEmail: "",
			sharingWith: [],
		},
		events: [],
	} as EventStore,
	activeScheduleType: "all" as "all" | "individual",
	schedules: {
		ownerSchedules: [],
		sharedSchedules: [],
	} as {
		ownerSchedules: EventStore[];
		sharedSchedules: EventStore[];
	},
};

const scheduleSlice = createSlice({
	name: "schedule",
	initialState,
	reducers: {
		setActiveSchedule: (state, action) => {
			if (action.payload.type === "all") {
				state.activeSchedule = {
					_id: "all",
					title: "All schedules combined",
					users: {
						ownerEmail: "",
						sharingWith: [],
					},
					events: state.schedules.ownerSchedules
						.concat(state.schedules.sharedSchedules)
						.flatMap(schedule => schedule.events),
				};
				state.activeScheduleType = "all";
			} else if (action.payload.type === "individual") {
				state.activeSchedule = action.payload.schedule;
				state.activeScheduleType = "individual";
			}
		},
		updateSchedule: (state, action) => {
			const ownerOrShared = action.payload.type;
			if (ownerOrShared === "owner") {
				const scheduleIndex = state.schedules.ownerSchedules.findIndex(
					schedule => schedule._id === action.payload.schedule._id
				);
				state.schedules.ownerSchedules[scheduleIndex] = action.payload.schedule;
			} else if (ownerOrShared === "shared") {
				const scheduleIndex = state.schedules.sharedSchedules.findIndex(
					schedule => schedule._id === action.payload.schedule._id
				);
				state.schedules.sharedSchedules[scheduleIndex] =
					action.payload.schedule;
			} else {
				throw new Error("Invalid schedule type");
			}
		},
		addEvent: (state, action) => {
			const flattenedSchedules = [
				...state.schedules.ownerSchedules,
				...state.schedules.sharedSchedules,
			];
			const parentSchedule = action.payload.parentScheduleId
				? flattenedSchedules.find(
						sch => sch._id === action.payload.parentScheduleId
				  )
				: flattenedSchedules.find(sch => sch._id === state.activeSchedule._id);
			if (!parentSchedule) return;

			parentSchedule.events.push(action.payload);
		},
		updateEvent: (state, action) => {
			const flattenedSchedules = [
				...state.schedules.ownerSchedules,
				...state.schedules.sharedSchedules,
			];
			const parentSchedule = action.payload.parentScheduleId
				? flattenedSchedules.find(
						sch => sch._id === action.payload.parentScheduleId
				  )
				: flattenedSchedules.find(sch => sch._id === state.activeSchedule._id);
			if (!parentSchedule) return;

			const eventIndex = parentSchedule.events.findIndex(
				event => event.id === action.payload.id
			);
			parentSchedule.events[eventIndex] = action.payload;
		},
		deleteEvent: (state, action) => {
			const flattenedSchedules = [
				...state.schedules.ownerSchedules,
				...state.schedules.sharedSchedules,
			];
			const parentSchedule = action.payload.parentScheduleId
				? flattenedSchedules.find(
						sch => sch._id === action.payload.parentScheduleId
				  )
				: flattenedSchedules.find(sch => sch._id === state.activeSchedule._id);
			if (!parentSchedule) return;

			parentSchedule.events = parentSchedule.events.filter(
				event => event.id !== action.payload.id
			);
		},

		setSchedules: (state, action) => {
			state.schedules = action.payload;
		},
		addSchedule: (state, action) => {
			const ownerOrShared = action.payload.type;
			if (ownerOrShared === "owner") {
				state.schedules.ownerSchedules.push(action.payload.schedule);
			} else if (ownerOrShared === "shared") {
				state.schedules.sharedSchedules.push(action.payload.schedule);
			} else {
				throw new Error("Invalid schedule type");
			}
		},
		deleteSchedule: (state, action) => {
			const ownerOrShared = action.payload.type;
			if (ownerOrShared === "owner") {
				state.schedules.ownerSchedules = state.schedules.ownerSchedules.filter(
					schedule => schedule._id !== action.payload.id
				);
			} else if (ownerOrShared === "shared") {
				state.schedules.sharedSchedules =
					state.schedules.sharedSchedules.filter(
						schedule => schedule._id !== action.payload.id
					);
			} else {
				throw new Error("Invalid schedule type");
			}
		},
	},
});

export const {
	setActiveSchedule,
	updateSchedule,
	addEvent,
	updateEvent,
	deleteEvent,
	setSchedules,
	addSchedule,
	deleteSchedule,
} = scheduleSlice.actions;
export default scheduleSlice;
