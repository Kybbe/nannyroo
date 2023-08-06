interface ScheduleEvent {
	_id: string;
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
	startRecur?: string;
	endRecur?: string;

	parentScheduleId?: string;

	extendedProps: {
		notes?: string;
		place?: string;
		completed?: boolean;
	};
}

interface EventStore {
	_id: string;
	title: string;
	users: {
		ownerEmail: string;
		sharingWith: {
			userEmail: string;
			permissions: "read" | "write";
		}[];
	};
	events: ScheduleEvent[];
}

interface UndoStack {
	id: string;
	action: "add" | "delete" | "edit";
	undoFunc?: () => void;
	oldEvent?: ScheduleEvent | EventImpl;
}
