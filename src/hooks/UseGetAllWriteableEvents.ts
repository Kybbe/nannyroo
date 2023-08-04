import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import UseGetAllFlattenedEvents from "./UseGetAllFlattenedEvents";
import { useAppSelector } from "./redux/useAppSelector";

export default function UseGetAllWriteableEvents() {
	const flattenedEvents = UseGetAllFlattenedEvents();
	const user = useAuthContext();
	const schedules = useAppSelector(state => state.schedule.schedules);

	const [writeableEvents, setWriteableEvents] = useState<
		ScheduleEvent[] | undefined
	>();

	useEffect(() => {
		if (!flattenedEvents || !user) return;

		const writeable = flattenedEvents.filter(event => {
			const flattenedSchedules = [
				...schedules.ownerSchedules,
				...schedules.sharedSchedules,
			];
			const parentSchedule = flattenedSchedules.find(
				sch => sch._id === event.parentScheduleId
			);
			if (!parentSchedule) return false;

			return (
				parentSchedule.users.ownerEmail === user.email ||
				parentSchedule.users.sharingWith.find(
					u => u.userEmail === user.email && u.permissions === "write"
				)
			);
		});

		setWriteableEvents(writeable);
	}, [flattenedEvents, user, schedules]);

	return writeableEvents;
}
