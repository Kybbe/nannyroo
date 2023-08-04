/* eslint-disable jsx-a11y/label-has-associated-control */
import * as Popover from "@radix-ui/react-popover";
import { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import {
	deleteEvent,
	updateEvent as editStoreEvent,
} from "@/store/slices/scheduleSlice";
import { formatDate, formatTime } from "@/helpers/frontend/DateFormat";
import saveToDatabase from "@/helpers/frontend/saveToDb";
import UseGetAllWriteableEvents from "@/hooks/UseGetAllWriteableEvents";
import styles from "./EditEventPopover.module.scss";
import ColorPicker from "../ColorPicker";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	x?: number;
	y?: number;
	event?: ScheduleEvent;
	setUndoStack: React.Dispatch<React.SetStateAction<UndoStack[]>>;
}

export default function EditEventPopover({
	open,
	onOpenChange,
	x,
	y,
	event,
	setUndoStack,
}: Props) {
	const eventStore = useAppSelector(state => state.schedule.activeSchedule);
	const flattenedWriteableEvents = UseGetAllWriteableEvents();
	const dispatch = useAppDispatch();

	const [showExtraOptions, setShowExtraOptions] = useState(false);

	const isMobile = window.matchMedia("(max-width: 600px)").matches;

	const [startEnd, setStartEnd] = useState({
		start: event?.start || event?.startTime,
		end: event?.end || event?.endTime,
	});

	const [data, setData] = useState({
		title: event?.title || "",
		start: formatDate(event?.start) || event?.startTime || "",
		end: formatDate(event?.end) || event?.endTime || "",
		allDay: event?.allDay || false,
		recurring: event?.daysOfWeek?.length !== 0 || false,
		startRecur: event?.startRecur || "",
		endRecur: event?.endRecur || "",
		backgroundColor: event?.backgroundColor,
		borderColor: event?.borderColor,
		textColor: event?.textColor,
		daysOfWeek:
			event?.daysOfWeek?.map(d => ({
				label: [
					"Sunday",
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
					"Saturday",
				][d],
				value: d,
			})) || ([] as { label: string; value: number }[]),
		notes: event?.extendedProps?.notes || "",
		place: event?.extendedProps?.place || "",
	});

	useEffect(() => {
		const isRecurring =
			(event?.daysOfWeek?.length !== 0 && event?.daysOfWeek !== undefined) ||
			false;

		setData({
			title: event?.title || "",
			start: formatDate(event?.start) || event?.startTime || "",
			end: formatDate(event?.end) || event?.endTime || "",
			allDay: event?.allDay || false,
			backgroundColor: event?.backgroundColor,
			borderColor: event?.borderColor,
			textColor: event?.textColor,
			recurring: isRecurring,
			startRecur: event?.startRecur || "",
			endRecur: event?.endRecur || "",
			daysOfWeek:
				event?.daysOfWeek?.map(d => ({
					label: [
						"Sunday",
						"Monday",
						"Tuesday",
						"Wednesday",
						"Thursday",
						"Friday",
						"Saturday",
					][d],
					value: d,
				})) || [],
			notes: event?.extendedProps?.notes || "",
			place: event?.extendedProps?.place || "",
		});

		setStartEnd({
			start: isRecurring ? event?.startTime : formatDate(event?.start),
			end: isRecurring ? event?.endTime : formatDate(event?.end),
		});
	}, [event, open]);

	const saveEvent = () => {
		const id = event?.id;
		const storeEvent = flattenedWriteableEvents?.find(e => e.id === id);
		if (!storeEvent) return;

		let ISOStart = data.start;
		let ISOEnd = data.end;

		if (!data.recurring) {
			const startFormatted = new Date(data.start);
			const endFormatted = new Date(data.end);

			// check if start is before end
			if (startFormatted > endFormatted) {
				alert("Start date must be before end date");
				return;
			}

			ISOStart = startFormatted.toISOString();
			ISOEnd = endFormatted.toISOString();
		}

		let newEvent: ScheduleEvent;

		if (data.recurring) {
			newEvent = {
				id: storeEvent.id,
				parentScheduleId: storeEvent.parentScheduleId,
				title: data.title,
				startTime: ISOStart,
				endTime: ISOEnd,
				startRecur: data.startRecur,
				endRecur: data.endRecur,
				allDay: data.allDay,
				daysOfWeek: data.daysOfWeek.map(d => d.value),
				backgroundColor: data.backgroundColor,
				borderColor: data.borderColor,
				textColor: data.textColor,
				groupId:
					storeEvent.groupId ||
					data.title + data.start + data.end + data.allDay,
				extendedProps: {
					...storeEvent.extendedProps,
					notes: data.notes,
					place: data.place,
				},
			} as ScheduleEvent;

			if (newEvent.daysOfWeek?.length === 0) {
				delete newEvent.daysOfWeek;
			}
			if (!newEvent.startRecur) delete newEvent.startRecur;
			if (!newEvent.endRecur) delete newEvent.endRecur;
		} else {
			newEvent = {
				id: storeEvent.id,
				parentScheduleId: storeEvent.parentScheduleId,
				title: data.title,
				start: ISOStart,
				end: ISOEnd,
				allDay: data.allDay,
				backgroundColor: data.backgroundColor,
				borderColor: data.borderColor,
				textColor: data.textColor,
				extendedProps: {
					...storeEvent.extendedProps,
					notes: data.notes,
					place: data.place,
				},
			} as ScheduleEvent;
		}

		dispatch(editStoreEvent(newEvent));
		setUndoStack(prev => [
			...prev,
			{
				id: newEvent.id,
				action: "edit",
				oldEvent: storeEvent,
			},
		]);
		saveToDatabase(newEvent, storeEvent.parentScheduleId, "event", "PUT");
		onOpenChange(false);
	};

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
							saveEvent();
						}}
					>
						<p
							className="Text m-0 text-sm font-bold"
							style={{ marginBottom: 10 }}
						>
							Edit event
						</p>
						<fieldset className="Fieldset flex gap-5 items-center">
							<label className="Label w-20" htmlFor="Title">
								Title
							</label>
							<input
								className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6"
								id="Title"
								placeholder="Title"
								defaultValue={data.title}
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
										value={startEnd.start || ""}
										onChange={e => {
											setData({ ...data, start: e.target.value });
											setStartEnd({ ...startEnd, start: e.target.value });
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
										value={startEnd.end || ""}
										onChange={e => {
											setData({ ...data, end: e.target.value });
											setStartEnd({ ...startEnd, end: e.target.value });
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
								defaultChecked={data.allDay}
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
								defaultChecked={data.recurring}
								onCheckedChange={(e: boolean) => {
									const newStart = e
										? formatTime(event?.start)
										: formatDate(event?.start);
									const newEnd = e
										? formatTime(event?.end)
										: formatDate(event?.end);

									setStartEnd({
										start: newStart,
										end: newEnd,
									});

									setData({
										...data,
										recurring: e,
										daysOfWeek: e ? data.daysOfWeek : [],
										start: newStart || "",
										end: newEnd || "",
										startRecur: e ? data.startRecur : "",
										endRecur: e ? data.endRecur : "",
									});
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
								textColor: data.textColor || "",
								backgroundColor: data.backgroundColor || "",
								borderColor: data.borderColor || "",
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
										defaultValue={data.notes}
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
										defaultValue={data.place}
										onChange={e => {
											setData({ ...data, place: e.target.value });
										}}
									/>
								</fieldset>
							</>
						)}
						<div className="flex flex-row justify-between gap-2">
							<div className="left flex flex-row gap-2">
								<button
									type="button"
									onClick={() => {
										dispatch(deleteEvent(event?.id || ""));
										onOpenChange(false);
									}}
									className="border-red-700 border-2 border-solid text-red-700 hover:border-red-950 hover:text-red-950 transition-colors rounded-md px-4 py-2 text-sm font-bold"
								>
									Delete
								</button>
							</div>

							<div className="right flex flex-row gap-2">
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
										Save
									</button>
								</div>
							</div>
						</div>
					</form>
					<Popover.Close
						className="PopoverClose absolute top-2 right-2 h-6 w-6 rounded-full bg-neutral-100 dark:bg-gray-800 flex items-center justify-center"
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
