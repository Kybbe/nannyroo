/* eslint-disable jsx-a11y/label-has-associated-control */
import * as Popover from "@radix-ui/react-popover";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import { addEvent as createStoreEvent } from "@/store/slices/scheduleSlice";
import FullCalendar from "@fullcalendar/react";
import { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { formatDate, formatTime } from "@/helpers/DateFormat";
import styles from "./CreateEventPopover.module.scss";

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
	const eventStore = useAppSelector(state => state.schedule.schedule);
	const dispatch = useAppDispatch();

	const createEventId = () => String(eventStore.events.length + 1);

	const [showExtraOptions, setShowExtraOptions] = useState(false);

	const isMobile = window.matchMedia("(max-width: 600px)").matches;

	const [data, setData] = useState({
		title: "",
		start: propStart || "",
		end: propEnd || "",
		startRecur: "",
		endRecur: "",
		allDay: propAllDay || false,
		recurring: false,
		daysOfWeek: [],
		notes: "",
		place: "",
	} as {
		title: string;
		start: string;
		end: string;
		startRecur: string;
		endRecur: string;
		allDay: boolean;
		recurring: boolean;
		daysOfWeek: { label: string; value: number }[];
		notes: string;
		place: string;
	});

	useEffect(() => {
		setData({
			title: "",
			start: propStart || "",
			end: propEnd || "",
			startRecur: "",
			endRecur: "",
			allDay: propAllDay || false,
			recurring: false,
			daysOfWeek: [],
			notes: "",
			place: "",
		});
	}, [open, propStart, propEnd]);

	function createEvent() {
		const {
			title,
			allDay,
			recurring,
			daysOfWeek,
			notes,
			place,
			start,
			end,
			startRecur,
			endRecur,
		} = data;
		if (!calendarRef || !calendarRef.current) {
			console.error("calendarRef is null");
			return;
		}
		if (!title) return;

		const calendarApi = calendarRef.current.getApi();
		calendarApi.unselect(); // clear date selection

		let newEvent: ScheduleEvent;
		if (recurring) {
			if (daysOfWeek.length === 0) {
				alert("Please select at least one day of the week");
				return;
			}

			newEvent = {
				id: createEventId(),
				title,
				startTime: formatTime(start),
				endTime: formatTime(end),
				startRecur,
				endRecur,
				allDay,
				groupId: title + start + end + allDay,
				extendedProps: {
					notes,
					place,
					completed: false,
				},
				daysOfWeek: daysOfWeek.map(d => d.value),
			};

			if (!newEvent.startRecur) delete newEvent.startRecur;
			if (!newEvent.endRecur) delete newEvent.endRecur;
		} else {
			const startFormatted = new Date(data.start);
			const endFormatted = new Date(data.end);

			// check if start is before end
			if (startFormatted > endFormatted) {
				alert("Start date must be before end date");
				return;
			}

			const ISOStart = startFormatted.toISOString();
			const ISOEnd = endFormatted.toISOString();

			newEvent = {
				id: createEventId(),
				title,
				start: ISOStart,
				end: ISOEnd,
				allDay,
				extendedProps: {
					notes,
					place,
					completed: false,
				},
			};
		}

		dispatch(createStoreEvent(newEvent));
		setUndoStack(prev => [
			...prev,
			{
				id: newEvent.id,
				action: "add",
			},
		]);
		onOpenChange(false);
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
					className={`${styles.PopoverContent} rounded p-4 bg-slate-200 dark:bg-gray-800 shadow-md z-10`}
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
								className="border-teal-700 border-2 border-solid text-teal-700 hover:border-teal-950 hover:text-teal-950 transition-colors rounded-md px-4 py-2 text-sm font-bold"
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
						className="PopoverClose absolute top-2 right-2 h-6 w-6 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center"
						aria-label="Close"
					>
						X
					</Popover.Close>
					<Popover.Arrow className={`${styles.PopoverArrow} shadow-md`} />
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
