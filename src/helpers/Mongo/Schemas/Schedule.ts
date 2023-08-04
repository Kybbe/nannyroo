import mongoose, { Schema, model } from "mongoose";

const schedule = new Schema<EventStore>({
	title: { type: String, required: true },
	users: {
		ownerEmail: { type: String, required: true },
		sharingWith: [
			{
				userEmail: { type: String, required: true },
				permissions: { type: String, required: true },
			},
		],
	},
	events: [
		{
			id: { type: String, required: true },
			title: { type: String, required: true },
			start: { type: String, required: false },
			end: { type: String, required: false },
			allDay: { type: Boolean, required: false },
			backgroundColor: { type: String, required: false },
			borderColor: { type: String, required: false },
			textColor: { type: String, required: false },
			daysOfWeek: { type: [Number], required: false, default: () => undefined },
			groupId: { type: String, required: false },
			startTime: { type: String, required: false },
			endTime: { type: String, required: false },
			startRecur: { type: String, required: false },
			endRecur: { type: String, required: false },
			extendedProps: {
				notes: { type: String, required: false },
				place: { type: String, required: false },
				completed: { type: Boolean, required: false },
			},
		},
	],
});

export default mongoose.models.schedule ||
	model<EventStore>("schedule", schedule);
