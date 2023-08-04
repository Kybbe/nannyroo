import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/redux/useAppSelector";

export default function UseGetAllFlattenedEvents() {
	const schedules = useAppSelector(state => state.schedule.schedules);
	const [flattenedEvents, setFlattenedEvents] = useState<
		ScheduleEvent[] | undefined
	>();

	useEffect(() => {
		const flatSchedules = [
			...schedules.ownerSchedules,
			...schedules.sharedSchedules,
		];

		const events = flatSchedules.map((schedule, si) => {
			const { events: evs } = schedule;
			// insert parentScheduleId into each event
			return evs.map((ev, i) => ({
				...ev,
				parentScheduleId: schedule._id,
			}));
		});

		setFlattenedEvents(events.flat());
	}, [schedules.ownerSchedules, schedules.sharedSchedules]);

	return flattenedEvents;
}
