interface ScheduleEvent {
	id: string;
	title: string;
	start?: string;
	end?: string;

	allDay?: boolean;

	backgroundColor?: string;
	borderColor?: string;
	textColor?: string;

	daysOfWeek?: number[];
	groupId?: string;
	startTime?: string;
	endTime?: string;
	startRecur?: Date;
	endRecur?: Date;

	extendedProps?: {
		notes?: string;
		description?: string;
		place?: string;
		completed?: boolean;
	};
}

interface EventStore {
	events: ScheduleEvent[];
}

interface UndoStack {
	id: string;
	action: "add" | "delete" | "edit";
	undoFunc?: () => void;
	oldEvent?: ScheduleEvent | EventImpl;
}
