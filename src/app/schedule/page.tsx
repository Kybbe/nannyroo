/* eslint-disable no-alert */

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
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import { updateEvent as editStoreEvent } from "@/store/slices/scheduleSlice";
import CreateEventPopover from "@/components/Popovers/CreateEventPopover";
import EditEventPopover from "@/components/Popovers/EditEventPopover";
import { formatTime } from "@/helpers/frontend/DateFormat";
import ScheduleEditor from "@/components/ScheduleEditor";
import saveToDatabase from "@/helpers/frontend/saveToDb";
import UseGetAllFlattenedEvents from "@/hooks/UseGetAllFlattenedEvents";
import UseGetAllWriteableEvents from "@/hooks/UseGetAllWriteableEvents";
import { useAuthContext } from "@/context/AuthContext";

export default function Schedule() {
	const calendarRef = useRef<FullCalendar>(null);
	const eventStore = useAppSelector(state => state.schedule.activeSchedule);
	const allSchedules = useAppSelector(state => state.schedule.schedules);
	const flattenedSchedules = [
		...allSchedules.ownerSchedules,
		...allSchedules.sharedSchedules,
	];
	const flattenedEvents = UseGetAllFlattenedEvents();
	const flattenedWriteableEvents = UseGetAllWriteableEvents();
	const router = useRouter();

	const [undoStack, setUndoStack] = useState<UndoStack[]>([]);

	const [createModalOpen, setCreateModalOpen] = useState<
		| false
		| { x: number; y: number; start: string; end: string; allDay: boolean }
	>(false);

	const [editModalOpen, setEditModalOpen] = useState<
		false | { x: number; y: number; event: ScheduleEvent }
	>(false);

	const dispatch = useAppDispatch();
	const shouldLookDisabled =
		allSchedules.ownerSchedules.length === 0 &&
		allSchedules.sharedSchedules.length === 0;

	useEffect(() => {
		function goToCurrentTime() {
			const currentTime = new Date().toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});
			calendarRef.current?.getApi().scrollToTime(currentTime);
		}

		goToCurrentTime();

		const prevBtn = document.querySelector(
			".fc-next-button.fc-button.fc-button-primary"
		);
		const nextBtn = document.querySelector(
			".fc-prev-button.fc-button.fc-button-primary"
		);
		if (prevBtn && nextBtn) {
			prevBtn.addEventListener("click", goToCurrentTime);
			nextBtn.addEventListener("click", goToCurrentTime);

			return () => {
				prevBtn.removeEventListener("click", goToCurrentTime);
				nextBtn.removeEventListener("click", goToCurrentTime);
			};
		}
		return () => {
			console.info("no prev or next btn");
		};
	}, []);

	const user = useAuthContext();
	if (!user) {
		router.push("/");
	}

	const createEvent = (selectInfo: DateSelectArg) => {
		if (!selectInfo.jsEvent) return;
		setCreateModalOpen({
			x: selectInfo.jsEvent.clientX,
			y: selectInfo.jsEvent.clientY,
			start: selectInfo.start?.toISOString(),
			end: selectInfo.end?.toISOString(),
			allDay: selectInfo.allDay,
		});
	};

	const openEditModal = (clickInfo: EventClickArg) => {
		const storeEvent = flattenedWriteableEvents?.find(
			e => e.id === clickInfo.event.id
		);
		if (!storeEvent) return;

		setEditModalOpen({
			x: clickInfo.jsEvent.clientX,
			y: clickInfo.jsEvent.clientY,
			event: storeEvent as ScheduleEvent,
		});
	};

	const editEvent = (changeInfo: EventChangeArg) => {
		if (!calendarRef.current) {
			console.error("calendarRef is null");
			changeInfo.revert();
			return;
		}
		const event = flattenedWriteableEvents?.find(
			e => e.id === changeInfo.event.id
		);
		if (!event) {
			changeInfo.revert();
			alert("Cannot edit events in schedules without editing permissions");
			return;
		}

		let newEvent: ScheduleEvent;

		if (changeInfo.event.groupId) {
			newEvent = {
				...event,
				startTime: changeInfo.event.startStr.split("T")[1].slice(0, 5),
				endTime: changeInfo.event.endStr.split("T")[1].slice(0, 5),
				allDay: changeInfo.event.allDay,
			};
		} else {
			newEvent = {
				...event,
				start: changeInfo.event.start?.toISOString(),
				end: changeInfo.event.end?.toISOString(),
				allDay: changeInfo.event.allDay,
			};
		}

		dispatch(editStoreEvent(newEvent));
		saveToDatabase(newEvent, newEvent.parentScheduleId, "event", "PUT");

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

	const completeEvent = (id: string, completed: boolean) => {
		const event = flattenedWriteableEvents?.find(e => e.id === id);
		if (!event) return;

		const newEvent = {
			...event,
			extendedProps: {
				...event.extendedProps,
				completed,
			},
		};

		dispatch(editStoreEvent(newEvent));
		saveToDatabase(newEvent, newEvent.parentScheduleId, "event", "PUT");
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const renderEventContent = (eventInfo: any) => {
		const { event } = eventInfo;
		const {
			id,
			start,
			end,
			allDay,
			title,
			parentScheduleId,
			extendedProps: { completed },
		} = event;
		return (
			<>
				<Checkbox.Root
					style={completed ? { opacity: 0.5 } : {}}
					className="bg-white text-black inline-flex items-center justify-center rounded-sm px-2 h-5 w-5"
					checked={completed}
					defaultChecked={completed}
					onCheckedChange={(e: boolean) => {
						completeEvent(id, e);
					}}
					onClick={e => {
						e.stopPropagation();
					}}
				>
					<Checkbox.Indicator className="CheckboxIndicator">
						<CheckIcon />
					</Checkbox.Indicator>
				</Checkbox.Root>

				<p>{flattenedSchedules.find(s => s._id === parentScheduleId)?.title}</p>

				{allDay ? (
					<p className="text-xs" style={completed ? { opacity: 0.5 } : {}}>
						All day
					</p>
				) : (
					<>
						{Math.abs(new Date(start).getTime() - new Date(end).getTime()) >
							1000 * 60 * 25 && (
							<p
								className="text-xs h-fit"
								style={completed ? { opacity: 0.5 } : {}}
							>
								{formatTime(start)} - {formatTime(end)}
							</p>
						)}
					</>
				)}
				<b className="h-fit" style={completed ? { opacity: 0.5 } : {}}>
					{title}
				</b>
			</>
		);
	};

	/* useEffect(() => {
		const undo = () => {
			if (undoStack.length === 0 || !undoStack) return;

			const latestUndo = undoStack.pop();
			if (!latestUndo) return;
			const { id, action, undoFunc, oldEvent } = latestUndo;

			const calendarApi = calendarRef.current?.getApi() as any;
			if (action === "delete") {
				if (!oldEvent) return;
				calendarApi.addEvent(oldEvent);
				dispatch(addStoreEvent(oldEvent));
			} else if (action === "add") {
				const event = eventStore.events.find(e => e.id === id);
				calendarApi.removeEvent(event);
				dispatch(deleteStoreEvent(id));
			} else if (action === "edit") {
				if (!undoFunc) return;
				undoFunc();

				if (!oldEvent) return;

				dispatch(editStoreEvent(oldEvent));
			}
			calendarApi.render();
		};

		const checkUndo = (e: KeyboardEvent) => {
			if ((e.metaKey && e.key === "z") || (e.ctrlKey && e.key === "z")) {
				undo();
			}
		};

		document.addEventListener("keydown", e => {
			checkUndo(e);
		});

		return () => {
			document.removeEventListener("keydown", e => {
				checkUndo(e);
			});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventStore, undoStack]); */

	// create a variable to check if the user is on a mobile device
	const isMobile = window.matchMedia("(max-width: 600px)").matches;

	return (
		<div className="flex flex-col items-center gap-1 flex-1 px-1 sm:px-2 pt-2 max-h-[calc(100vh-96px)] sm:max-h-[calc(100vh-72px)] overflow-hidden">
			<ScheduleEditor />

			<CreateEventPopover
				open={createModalOpen !== false}
				onOpenChange={() => {
					setCreateModalOpen(false);
				}}
				x={createModalOpen === false ? 0 : createModalOpen.x}
				y={createModalOpen === false ? 0 : createModalOpen.y}
				start={createModalOpen === false ? "" : createModalOpen.start}
				end={createModalOpen === false ? "" : createModalOpen.end}
				allDay={createModalOpen === false ? false : createModalOpen.allDay}
				calendarRef={calendarRef}
				setUndoStack={setUndoStack}
			/>

			<EditEventPopover
				open={editModalOpen !== false}
				onOpenChange={() => {
					setEditModalOpen(false);
				}}
				x={editModalOpen === false ? 0 : editModalOpen.x}
				y={editModalOpen === false ? 0 : editModalOpen.y}
				event={editModalOpen === false ? undefined : editModalOpen.event}
				setUndoStack={setUndoStack}
			/>

			<div className="relative min-w-full flex flex-1">
				{shouldLookDisabled && (
					<div className="absolute top-0 left-0 rounded-md w-full h-full bg-[#00000085] z-10 flex justify-center items-center">
						<h1 className="text-4xl text-neutral-100">
							You don't have any schedules yet! Create one to get started.
						</h1>
					</div>
				)}

				<FullCalendar
					plugins={[timeGridPlugin, interactionPlugin]}
					ref={calendarRef}
					slotDuration="00:15:00"
					timeZoneParam="UTC"
					weekNumberCalculation="ISO"
					slotLabelFormat={{
						hour: "numeric",
						minute: "2-digit",
						hour12: false,
					}}
					initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
					headerToolbar={{
						left: "timeGridWeek,timeGridDay",
						center: "title",
						right: "today prev,next",
					}}
					editable
					selectable
					events={
						eventStore._id === "all" ? flattenedEvents : eventStore.events
					}
					select={e => {
						if (shouldLookDisabled) return;
						createEvent(e);
					}}
					eventContent={renderEventContent}
					eventClick={e => {
						if (shouldLookDisabled) return;
						openEditModal(e);
					}}
					eventChange={e => {
						if (shouldLookDisabled) return;
						editEvent(e);
					}}
					expandRows
					longPressDelay={300}
					nowIndicator
				/>
			</div>
		</div>
	);
}
