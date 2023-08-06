"use client";

import { Pencil1Icon, PersonIcon, TrashIcon } from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import { setActiveSchedule, setSchedules } from "@/store/slices/scheduleSlice";
import { useAuthContext } from "@/context/AuthContext";
import EditSchedulePopover from "./Popovers/EditSchedulePopover";
import ScheduleSwitcher from "./ScheduleSwitcher";
import ShareePopover from "./Popovers/ShareePopover";

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
			`/api/schedule?id=${storeSelectedSchedule._id}`,
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
						<Tooltip.Provider delayDuration={400}>
							<Tooltip.Root>
								<ShareePopover>
									<Tooltip.Trigger asChild>
										<button
											type="button"
											className="bg-purple-500 text-white rounded-lg p-2 ml-2"
										>
											<PersonIcon />
										</button>
									</Tooltip.Trigger>
								</ShareePopover>
								<Tooltip.Portal>
									<Tooltip.Content
										className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white dark:bg-neutral-800 px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
										sideOffset={5}
									>
										Share schedule with others
										<Tooltip.Arrow className="fill-white dark:fill-neutral-800" />
									</Tooltip.Content>
								</Tooltip.Portal>
							</Tooltip.Root>
						</Tooltip.Provider>

						<Tooltip.Provider delayDuration={400}>
							<Tooltip.Root>
								<EditSchedulePopover>
									<Tooltip.Trigger asChild>
										<button
											type="button"
											className="bg-orange-500 text-white rounded-lg p-2"
										>
											<Pencil1Icon />
										</button>
									</Tooltip.Trigger>
								</EditSchedulePopover>
								<Tooltip.Portal>
									<Tooltip.Content
										className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white dark:bg-neutral-800 px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
										sideOffset={5}
									>
										Edit schedule
										<Tooltip.Arrow className="fill-white dark:fill-neutral-800" />
									</Tooltip.Content>
								</Tooltip.Portal>
							</Tooltip.Root>
						</Tooltip.Provider>

						<Tooltip.Provider delayDuration={400}>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<button
										type="button"
										className="bg-red-500 text-white rounded-lg p-2"
										onClick={() => {
											deleteSchedule();
										}}
									>
										<TrashIcon />
									</button>
								</Tooltip.Trigger>
								<Tooltip.Portal>
									<Tooltip.Content
										className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white dark:bg-neutral-800 px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
										sideOffset={5}
									>
										Delete
										<Tooltip.Arrow className="fill-white dark:fill-neutral-800" />
									</Tooltip.Content>
								</Tooltip.Portal>
							</Tooltip.Root>
						</Tooltip.Provider>
					</>
				)}
		</div>
	);
}
