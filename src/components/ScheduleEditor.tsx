"use client";

import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import { setActiveSchedule, setSchedules } from "@/store/slices/scheduleSlice";
import { useAuthContext } from "@/context/AuthContext";
import saveToDatabase from "@/helpers/frontend/saveToDb";
import EditSchedulePopover from "./Popovers/EditSchedulePopover";
import ScheduleSwitcher from "./ScheduleSwitcher";

export default function ScheduleEditor() {
	const storeSelectedSchedule = useAppSelector(
		state => state.schedule.activeSchedule
	);
	const schedules = useAppSelector(state => state.schedule.schedules);
	const activeScheduleType = useAppSelector(
		state => state.schedule.activeScheduleType
	);

	const user = useAuthContext();

	const dispatch = useAppDispatch();

	const deleteSchedule = async () => {
		const token = await user?.getIdToken(true);

		const response = await fetch(
			`http://localhost:3000/api/schedule?id=${storeSelectedSchedule._id}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					authorization: `Bearer ${token}`,
				},
			}
		);

		const deletedSchedule = (await response.json()) as { success: boolean };
		if (!deletedSchedule.success) {
			console.error("Failed to delete schedule");
			return;
		}
		dispatch(
			setSchedules({
				ownerSchedules: schedules.ownerSchedules.filter(
					s => s._id !== storeSelectedSchedule._id
				),
				sharedSchedules: schedules.sharedSchedules.filter(
					s => s._id !== storeSelectedSchedule._id
				),
			})
		);
		dispatch(
			setActiveSchedule({
				type: "all",
				schedule: {
					_id: "all",
					title: "All schedules combined",
				},
			})
		);
		console.info("Deleted schedule", storeSelectedSchedule);
	};

	return (
		<div className="flex flex-row items-center gap-2">
			<h2 className="text-xl text-center hidden sm:inline-block">
				Schedules:{" "}
			</h2>

			<ScheduleSwitcher
				value={storeSelectedSchedule._id}
				onValueChange={(v: string) => {
					if (v === "all") {
						dispatch(
							setActiveSchedule({
								type: "all",
								schedule: {
									_id: "all",
									title: "All schedules combined",
								},
							})
						);
						return;
					}

					const schedulesFlat = [
						...schedules.ownerSchedules,
						...schedules.sharedSchedules,
					];
					const storeSchedule = schedulesFlat.find(
						s => s._id === v
					) as EventStore;

					dispatch(
						setActiveSchedule({
							type: "individual",
							schedule: storeSchedule,
						})
					);
				}}
			/>

			{activeScheduleType === "individual" &&
				(storeSelectedSchedule.users.ownerEmail === user?.email ||
					storeSelectedSchedule.users.sharingWith.find(
						u => u.userEmail === user?.email
					)?.permissions === "write") && (
					<>
						<EditSchedulePopover>
							<button
								type="button"
								className="bg-orange-500 text-white rounded-lg p-2 ml-2"
							>
								<Pencil1Icon />
							</button>
						</EditSchedulePopover>

						<button
							type="button"
							className="bg-red-500 text-white rounded-lg p-2"
							onClick={() => {
								deleteSchedule();
							}}
						>
							<TrashIcon />
						</button>
					</>
				)}
		</div>
	);
}
