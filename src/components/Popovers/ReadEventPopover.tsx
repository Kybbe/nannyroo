/* eslint-disable jsx-a11y/label-has-associated-control */
import * as Popover from "@radix-ui/react-popover";
import { formatDate, formatTime } from "@/helpers/frontend/DateFormat";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import styles from "./EditEventPopover.module.scss";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	x?: number;
	y?: number;
	event?: ScheduleEvent;
}

export default function EditEventPopover({
	open,
	onOpenChange,
	x,
	y,
	event,
}: Props) {
	const schedules = useAppSelector(state => state.schedule.schedules);

	if (!event) return null;

	const {
		title,
		start,
		end,

		allDay,

		backgroundColor,
		borderColor,
		textColor,

		daysOfWeek,
		startTime,
		endTime,
		startRecur,
		endRecur,

		parentScheduleId,

		extendedProps: { notes, place, completed },
	} = event as ScheduleEvent;

	const flattenedSchedules = [
		...schedules.ownerSchedules,
		...schedules.sharedSchedules,
	];

	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	return (
		<Popover.Root defaultOpen={false} open={open} onOpenChange={onOpenChange}>
			<Popover.Anchor style={{ position: "absolute", left: x, top: y }} />
			<Popover.Portal>
				<Popover.Content
					className={`${styles.PopoverContent} rounded p-4 bg-neutral-100 dark:bg-neutral-800 shadow-md z-10`}
					sideOffset={5}
				>
					<div className="flex flex-col gap-2">
						<h2 className="text-xl font-bold">{title}</h2>

						{notes && <b>Notes: {notes}</b>}

						{place && <p>Place: {place}</p>}

						<p
							className={
								allDay
									? "text-green-800 dark:text-green-300"
									: "text-red-800 dark:text-red-300"
							}
						>
							Completed: {completed ? "Yes" : "No"}
						</p>

						<p>
							Schedule:{" "}
							{flattenedSchedules.find(s => s._id === parentScheduleId)?.title}
						</p>

						<p
							className={
								allDay
									? "text-green-800 dark:text-green-300"
									: "text-red-800 dark:text-red-300"
							}
						>
							All day: {allDay ? "Yes" : "No"}
						</p>

						{!allDay ? (
							daysOfWeek ? (
								<p>Start: {startTime}</p>
							) : (
								<p>Start: {formatDate(start)}</p>
							)
						) : null}

						{!allDay ? (
							daysOfWeek ? (
								<p>End: {endTime}</p>
							) : (
								<p>End: {formatDate(end)}</p>
							)
						) : null}

						{daysOfWeek && (
							<p>
								Days of week to recur on:{" "}
								{daysOfWeek?.map(d => days[d]).join(", ")}
							</p>
						)}

						{startRecur && <p>Start recurring: {formatDate(startRecur)}</p>}
						{endRecur && <p>End recurring: {formatDate(endRecur)}</p>}
					</div>

					<Popover.Close
						className="PopoverClose absolute top-2 right-2 h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
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
