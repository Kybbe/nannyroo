"use client";

import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useRef, useState } from "react";
import {
	DateSelectArg,
	EventChangeArg,
	EventClickArg,
} from "@fullcalendar/core";
import { EventImpl } from "@fullcalendar/core/internal";

interface UndoStack {
	id: string;
	action: "add" | "delete" | "edit";
	undoFunc?: () => void;
	oldEvent?: Event | EventImpl;
}

interface Event {
	id: string;
	title: string;
	start?: Date;
	end?: Date;

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
	events: Event[];
}

export default function Schedule() {
	const calendarRef = useRef<FullCalendar>(null);
	const [eventStore, setEventStore] = useState<EventStore>({
		events: [
			{
				id: "1",
				title: "Event 1",
				start: new Date(),
				end: new Date(Date.now() + 1000 * 60 * 60 * 1),
				borderColor: "lightgray",
				backgroundColor: "#e6e89a",
			},
			{
				id: "2",
				title: "Recurring event",
				backgroundColor: "#e6e89a",
				groupId: "Recurrence",
				daysOfWeek: [1, 4],
				startTime: "10:00",
				endTime: "11:00",
			},
		],
	});
	const [undoStack, setUndoStack] = useState<UndoStack[]>([]); // [{event, action}

	const createEvent = (selectInfo: DateSelectArg) => {
		const title = prompt("Please enter a new title for your event");
		if (!calendarRef.current) {
			console.error("calendarRef is null");
			return;
		}
		const calendarApi = calendarRef.current.getApi();

		calendarApi.unselect(); // clear date selection

		if (title) {
			calendarApi.addEvent({
				id: createEventId(),
				title,
				start: selectInfo.startStr,
				end: selectInfo.endStr,
				allDay: selectInfo.allDay,
			});
		}
	};

	const deleteEvent = (clickInfo: EventClickArg) => {
		if (
			// eslint-disable-next-line no-restricted-globals
			confirm(
				`Are you sure you want to delete the event '${clickInfo.event.title}'`
			)
		) {
			const { id } = clickInfo.event;
			clickInfo.event.remove();
			setUndoStack([
				...undoStack,
				{ id, action: "delete", oldEvent: clickInfo.event },
			]);
		}
	};

	const editEvent = (changeInfo: EventChangeArg) => {
		if (!calendarRef.current) {
			console.error("calendarRef is null");
			return;
		}
		const event = eventStore.events.find(e => e.id === changeInfo.event.id);
		if (!event) return;

		let newEvent: Event;

		if (changeInfo.event.groupId) {
			newEvent = {
				...event,
				startTime: changeInfo.event.startStr.split("T")[1].slice(0, 5),
				endTime: changeInfo.event.endStr.split("T")[1].slice(0, 5),
			};
		} else {
			newEvent = {
				...event,
				start: changeInfo.event.start as Date,
				end: changeInfo.event.end as Date,
			};
		}

		setEventStore({
			...eventStore,
			events: eventStore.events.map(e => (e.id === newEvent.id ? newEvent : e)),
		});

		setUndoStack([
			...undoStack,
			{
				id: changeInfo.event.id,
				action: "edit",
				undoFunc: changeInfo.revert,
				oldEvent: event,
			},
		]);
	};

	const createEventId = () => String(eventStore.events.length + 1);

	useEffect(() => {
		const undo = () => {
			if (undoStack.length === 0 || !undoStack) return;

			const latestUndo = undoStack.pop();
			if (!latestUndo) return;
			const { id, action, undoFunc, oldEvent } = latestUndo;

			const calendarApi = calendarRef.current?.getApi() as any;
			if (action === "delete") {
				if (!oldEvent) return;
				calendarApi.addEvent(oldEvent);
			} else if (action === "add") {
				const event = eventStore.events.find(e => e.id === id);
				calendarApi.removeEvent(event);
				setEventStore({
					...eventStore,
					events: eventStore.events.filter(e => e.id !== id),
				});
			} else if (action === "edit") {
				if (!undoFunc) return;
				undoFunc();

				if (!oldEvent) return;

				const oldEventRevamped = {
					...oldEvent,
					start: oldEvent.start as Date,
					end: oldEvent.end as Date,
				} as Event;

				setEventStore({
					...eventStore,
					events: eventStore.events.map(e =>
						e.id === oldEvent.id ? oldEventRevamped : e
					),
				});
			}
			calendarApi.render();
		};

		const checkUndo = (e: KeyboardEvent) => {
			if ((e.metaKey && e.key === "z") || (e.ctrlKey && e.key === "z")) {
				undo();
			}
		};

		// create listener for cmd+z or ctrl+z
		document.addEventListener("keydown", e => {
			checkUndo(e);
		});

		return () => {
			document.removeEventListener("keydown", e => {
				checkUndo(e);
			});
		};
	}, [eventStore.events, undoStack]);

	return (
		<div className="flex flex-col items-center gap-4 flex-1 p-2">
			<h1 className="text-xl text-center">Schedule</h1>

			<div className="min-w-full min-h-full">
				<FullCalendar
					plugins={[timeGridPlugin, interactionPlugin]}
					ref={calendarRef}
					initialView="timeGridWeek"
					headerToolbar={{
						left: "prev,next",
						center: "title",
						right: "timeGridWeek,timeGridDay",
					}}
					editable
					selectable
					events={eventStore && eventStore.events && eventStore.events.slice()}
					select={createEvent}
					/* eventContent={renderEventContent} */
					eventClick={deleteEvent}
					eventChange={editEvent}
				/>
			</div>
		</div>
	);
}
