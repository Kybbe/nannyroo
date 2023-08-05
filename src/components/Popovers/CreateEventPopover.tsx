/* eslint-disable jsx-a11y/label-has-associated-control */
import * as Popover from "@radix-ui/react-popover";
import FullCalendar from "@fullcalendar/react";
import { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { addEvent as createStoreEvent } from "@/store/slices/scheduleSlice";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import { formatDate, formatTime } from "@/helpers/frontend/DateFormat";
import saveToDatabase from "@/helpers/frontend/saveToDb";
import styles from "./CreateEventPopover.module.scss";
import ColorPicker from "../ColorPicker";
import ScheduleSwitcher from "../ScheduleSwitcher";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	x?: number;
	y?: number;
	start?: string;
	end?: string;
	allDay?: boolean;
	calendarRef?: React.MutableRefObject<FullCalendar | null>;
	setUndoStack: React.Dispatch<React.SetStateAction<UndoStack[]>>;
}

export default function CreateEventPopover({
	open,
	onOpenChange,
	x,
	y,
	start: propStart,
	end: propEnd,
	allDay: propAllDay,
	calendarRef,
	setUndoStack,
}: Props) {
	const eventStore = useAppSelector(state => state.schedule.activeSchedule);
	const activeSchedule = useAppSelector(state => state.schedule.activeSchedule);
	const allSchedules = useAppSelector(state => state.schedule.schedules);
	const dispatch = useAppDispatch();

	const flattenedSchedules = [
		...allSchedules.ownerSchedules,
		...allSchedules.sharedSchedules,
	];

	const createEventId = () =>
		String(Math.round(Math.random() * 10000000000000));

	const [showExtraOptions, setShowExtraOptions] = useState(false);

	const isMobile = window.matchMedia("(max-width: 600px)").matches;

	const [data, setData] = useState({
		title: "",
		parentScheduleId:
			eventStore._id === "all"
				? flattenedSchedules.length === 1
					? flattenedSchedules[0]._id
					: undefined
				: eventStore._id,
		start: propStart || "",
		end: propEnd || "",
		startRecur: "",
		endRecur: "",
		allDay: propAllDay || false,
		recurring: false,
		daysOfWeek: [],
		notes: "",
		place: "",
		backgroundColor: "",
		borderColor: "",
		textColor: "",
	} as {
		title: string;
		parentScheduleId?: string;
		start: string;
		end: string;
		startRecur: string;
		endRecur: string;
		allDay: boolean;
		recurring: boolean;
		daysOfWeek: { label: string; value: number }[];
		notes: string;
		place: string;
		backgroundColor: string;
		borderColor: string;
		textColor: string;
	});

	useEffect(() => {
		setData({
			title: "",
			parentScheduleId:
				eventStore._id === "all"
					? flattenedSchedules.length === 1
						? flattenedSchedules[0]._id
						: undefined
					: eventStore._id,
			start: propStart || "",
			end: propEnd || "",
			startRecur: "",
			endRecur: "",
			allDay: propAllDay || false,
			recurring: false,
			daysOfWeek: [],
			notes: "",
			place: "",
			backgroundColor: "",
			borderColor: "",
			textColor: "",
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, propStart, propEnd]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function createRecurringEvent(event: any) {
		if (event.daysOfWeek?.length === 0) {
			// eslint-disable-next-line no-alert
			alert("Please select at least one day of the week");
			return null;
		}

		const newEvent = {
			id: createEventId(),
			title: event.title.slice(0, 25),
			parentScheduleId: event.parentScheduleId,
			startTime: formatTime(event.start),
			endTime: formatTime(event.end),
			startRecur: event.startRecur,
			endRecur: event.endRecur,
			allDay: event.allDay,
			groupId: event.title + event.start + event.end + event.allDay,
			backgroundColor: event.backgroundColor,
			borderColor: event.borderColor,
			textColor: event.textColor,
			extendedProps: {
				notes: event.extendedProps?.notes,
				place: event.extendedProps?.place,
				completed: false,
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			daysOfWeek: event.daysOfWeek?.map((d: any) => d.value),
		};

		if (!newEvent.startRecur) delete newEvent.startRecur;
		if (!newEvent.endRecur) delete newEvent.endRecur;
		if (!newEvent.daysOfWeek) delete newEvent.daysOfWeek;

		return newEvent as ScheduleEvent;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function createNormalEvent(event: any) {
		const startFormatted = new Date(data.start);
		const endFormatted = new Date(data.end);

		// check if start is before end
		if (startFormatted > endFormatted) {
			// eslint-disable-next-line no-alert
			alert("Start date must be before end date");
			return null;
		}

		const ISOStart = startFormatted.toISOString();
		const ISOEnd = endFormatted.toISOString();

		const newEvent = {
			id: createEventId(),
			title: event.title.slice(0, 25),
			parentScheduleId: event.parentScheduleId,
			start: ISOStart,
			end: ISOEnd,
			allDay: event.allDay,
			backgroundColor: event.backgroundColor,
			borderColor: event.borderColor,
			textColor: event.textColor,
			extendedProps: {
				notes: event.notes,
				place: event.place,
				completed: false,
			},
		};

		return newEvent as ScheduleEvent;
	}

	function createEvent() {
		const { title, recurring } = data;
		if (!calendarRef || !calendarRef.current) {
			console.error("calendarRef is null");
			return;
		}
		if (!title) {
			alert("Please enter a title");
			return;
		}
		if (title.length > 25) {
			alert("Title must be less than 25 characters");
			return;
		}

		const calendarApi = calendarRef.current.getApi();
		calendarApi.unselect(); // clear date selection

		let newEvent: ScheduleEvent;
		if (recurring) {
			const res = createRecurringEvent(data);
			if (!res) return;
			newEvent = res;
		} else {
			const res = createNormalEvent(data);
			if (!res) return;
			newEvent = res;
		}

		dispatch(createStoreEvent(newEvent));
		setUndoStack(prev => [
			...prev,
			{
				id: newEvent.id,
				action: "add",
			},
		]);
		console.info("New event", newEvent);
		saveToDatabase(
			newEvent,
			newEvent.parentScheduleId || activeSchedule._id,
			"event",
			"POST"
		);
		onOpenChange(false);
	}

	function setColor(color: {
		textColor: string;
		backgroundColor: string;
		borderColor: string;
	}) {
		setData({ ...data, ...color });
	}

	return (
		<Popover.Root
			defaultOpen={false}
			open={open}
			onOpenChange={onOpenChange}
			modal={isMobile}
		>
			<Popover.Anchor style={{ position: "absolute", left: x, top: y }} />
			<Popover.Portal>
				<Popover.Content
					className={`${styles.PopoverContent} rounded p-4 bg-neutral-100 dark:bg-gray-800 shadow-md z-10`}
					sideOffset={5}
				>
					<form
						style={{ display: "flex", flexDirection: "column", gap: 10 }}
						onSubmit={e => {
							e.preventDefault();
							createEvent();
						}}
					>
						<p
							className="Text m-0 text-sm font-bold"
							style={{ marginBottom: 10 }}
						>
							Create event
						</p>
						<fieldset className="Fieldset flex gap-5 items-center">
							<label className="Label w-20" htmlFor="parentScheduleId">
								Schedule
							</label>
							<ScheduleSwitcher
								value={data.parentScheduleId}
								onValueChange={(v: string) => {
									setData({ ...data, parentScheduleId: v });
								}}
								showAll={false}
							/>
						</fieldset>
						<fieldset className="Fieldset flex gap-5 items-center">
							<label className="Label w-20" htmlFor="Title">
								Title
							</label>
							<input
								className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6"
								id="Title"
								placeholder="Title"
								onChange={e => {
									setData({ ...data, title: e.target.value });
								}}
							/>
						</fieldset>
						{!data.allDay && (
							<>
								<fieldset className="Fieldset flex gap-5 items-center">
									<label className="Label w-20" htmlFor="start">
										Start
									</label>
									<input
										className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6"
										id="start"
										value={
											data.start
												? data.recurring
													? formatTime(data.start)
													: formatDate(data.start)
												: ""
										}
										onChange={e => {
											setData({ ...data, start: e.target.value });
										}}
									/>
								</fieldset>
								<fieldset className="Fieldset flex gap-5 items-center">
									<label className="Label w-20" htmlFor="end">
										End
									</label>
									<input
										className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6"
										id="end"
										value={
											data.end
												? data.recurring
													? formatTime(data.end)
													: formatDate(data.end)
												: ""
										}
										onChange={e => {
											setData({ ...data, end: e.target.value });
										}}
									/>
								</fieldset>
							</>
						)}
						<fieldset className="Fieldset flex gap-5 items-center">
							<label className="Label w-20" htmlFor="allDay">
								All day
							</label>
							<Checkbox.Root
								className="bg-white inline-flex items-center justify-center rounded-sm px-2 h-6 w-6"
								checked={data.allDay}
								onCheckedChange={(e: boolean) => {
									setData({ ...data, allDay: e });
								}}
								id="allDay"
							>
								<Checkbox.Indicator className="CheckboxIndicator">
									<CheckIcon />
								</Checkbox.Indicator>
							</Checkbox.Root>
						</fieldset>
						<fieldset className="Fieldset flex gap-5 items-center">
							<label className="Label w-20" htmlFor="recurring">
								Recurring event
							</label>

							<Checkbox.Root
								className="bg-white inline-flex items-center justify-center rounded-sm px-2 h-6 w-6"
								checked={data.recurring}
								onCheckedChange={(e: boolean) => {
									setData({ ...data, recurring: e });
								}}
								id="recurring"
							>
								<Checkbox.Indicator className="CheckboxIndicator">
									<CheckIcon />
								</Checkbox.Indicator>
							</Checkbox.Root>
						</fieldset>
						{data.recurring && (
							<>
								<fieldset className="Fieldset flex gap-5 items-center">
									<label className="Label w-20" htmlFor="recurring">
										Recurring event
									</label>
									<MultiSelect
										className="MultiSelect w-full"
										options={[
											{ label: "Monday", value: 1 },
											{ label: "Tuesday", value: 2 },
											{ label: "Wednesday", value: 3 },
											{ label: "Thursday", value: 4 },
											{ label: "Friday", value: 5 },
											{ label: "Saturday", value: 6 },
											{ label: "Sunday", value: 0 },
										]}
										value={data.daysOfWeek}
										onChange={(d: { label: string; value: number }[]) => {
											setData({
												...data,
												daysOfWeek: d,
											});
										}}
										labelledBy="Select"
									/>
								</fieldset>

								<fieldset className="Fieldset flex gap-5 items-center">
									<label className="Label w-20" htmlFor="startRecur">
										Start recurring (optional)
									</label>
									<input
										type="date"
										className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6"
										id="startRecur"
										value={data.startRecur}
										onChange={e => {
											setData({ ...data, startRecur: e.target.value });
										}}
									/>
								</fieldset>
								<fieldset className="Fieldset flex gap-5 items-center">
									<label className="Label w-20" htmlFor="endRecur">
										End recurring (optional)
									</label>
									<input
										type="date"
										className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6"
										id="endRecur"
										value={data.endRecur}
										onChange={e => {
											setData({ ...data, endRecur: e.target.value });
										}}
									/>
								</fieldset>
							</>
						)}
						<ColorPicker
							color={{
								textColor: data.textColor,
								backgroundColor: data.backgroundColor,
								borderColor: data.borderColor,
							}}
							setColor={c => {
								setColor(c);
							}}
						/>
						<button
							type="button"
							className="border-b-2 border-teal-700 border-solid transition-colors px-4 py-2 text-sm font-bold"
							onClick={() => {
								setShowExtraOptions(!showExtraOptions);
							}}
						>
							{showExtraOptions ? "Hide" : "Show"} extra options
						</button>
						{showExtraOptions && (
							<>
								<fieldset className="Fieldset flex gap-5 items-center">
									<label className="Label w-20" htmlFor="notes">
										Notes
									</label>
									<input
										className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6"
										id="notes"
										defaultValue=""
										onChange={e => {
											setData({ ...data, notes: e.target.value });
										}}
									/>
								</fieldset>
								<fieldset className="Fieldset flex gap-5 items-center">
									<label className="Label w-20" htmlFor="place">
										Place
									</label>
									<input
										className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6"
										id="place"
										defaultValue=""
										onChange={e => {
											setData({ ...data, place: e.target.value });
										}}
									/>
								</fieldset>
							</>
						)}
						<div className="flex flex-row justify-end gap-2">
							<button
								type="button"
								className="border-teal-700 border-2 border-solid text-teal-700 hover:border-teal-950 hover:text-teal-950 dark:hover:border-teal-500 dark:hover:text-teal-500 transition-colors rounded-md px-4 py-2 text-sm font-bold"
								onClick={() => {
									onOpenChange(false);
								}}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="bg-primaryDark text-primaryBackground hover:bg-teal-900 transition-colors rounded-md px-4 py-2 text-sm font-bold"
							>
								Create
							</button>
						</div>
					</form>
					<Popover.Close
						className="PopoverClose absolute top-2 right-2 h-6 w-6 rounded-full bg-neutral-100 dark:bg-gray-800 flex items-center justify-center"
						aria-label="Close"
					>
						X
					</Popover.Close>
					<Popover.Arrow
						className={`${styles.PopoverArrow} shadow-md fill-neutral-100 dark:fill-gray-800`}
					/>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
