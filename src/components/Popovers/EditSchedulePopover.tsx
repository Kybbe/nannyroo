/* eslint-disable jsx-a11y/label-has-associated-control */
import * as Popover from "@radix-ui/react-popover";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import { deleteSchedule, updateSchedule } from "@/store/slices/scheduleSlice";
import saveToDatabase from "@/helpers/frontend/saveToDb";
import { openAlert } from "@/store/slices/alertSlice";
import { useAuthContext } from "@/context/AuthContext";
import styles from "./EditEventPopover.module.scss";

interface Props {
	children: React.ReactNode;
}

export default function EditSchedulePopover({ children }: Props) {
	const [open, setOpen] = useState(false);

	const activeSchedule = useAppSelector(state => state.schedule.activeSchedule);
	const schedules = useAppSelector(state => state.schedule.schedules);
	const dispatch = useAppDispatch();

	const [data, setData] = useState({
		id: activeSchedule?._id || "",
		title: activeSchedule?.title || "",
		users: activeSchedule?.users || {
			ownerEmail: "",
			sharingWith: [],
		},
	});

	useEffect(() => {
		setData({
			id: activeSchedule?._id || "",
			title: activeSchedule?.title || "",
			users: activeSchedule?.users || {
				ownerEmail: activeSchedule?.users.ownerEmail || "",
				sharingWith: activeSchedule?.users.sharingWith || [],
			},
		});
	}, [activeSchedule]);

	const saveSchedule = async () => {
		if (!checkEmail(data.users.ownerEmail)) {
			console.error("Invalid owner email");
			dispatch(
				openAlert({
					title: "Invalid owner email",
					alertType: "error",
					alertOrConfirm: "alert",
				})
			);
			return;
		}

		if (data.users.ownerEmail !== activeSchedule.users.ownerEmail) {
			dispatch(
				openAlert({
					title: "Changing owner email",
					description:
						"Changing the owner email will make you lose access to this schedule. Are you sure you want to continue?",
					cancelText: "Cancel",
					confirmText: "Continue with change",
					alertType: "warning",
					confirm: true,
					onConfirm: () => {
						dispatch(
							deleteSchedule({
								type: "owner",
								id: activeSchedule._id,
							})
						);
						save();
					},
				})
			);

			setOpen(false);
			return;
		}

		save();
	};

	const save = async () => {
		const auth = getAuth();
		const token = await auth.currentUser?.getIdToken(true);
		if (!token) {
			console.error("Failed to get token");
			return;
		}

		if (
			data.users.sharingWith.some(({ userEmail }) => !checkEmail(userEmail))
		) {
			console.error("Invalid sharee email");
			dispatch(
				openAlert({
					title: "Invalid email, cannot share with user",
					alertType: "error",
					alertOrConfirm: "alert",
				})
			);
			return;
		}

		const schedulesFlat = [
			...schedules.ownerSchedules,
			...schedules.sharedSchedules,
		];
		const storeSchedule = schedulesFlat.find(
			s => s._id === activeSchedule._id
		) as EventStore;

		const scheduleType = schedules.ownerSchedules.includes(storeSchedule);

		const newSchedule = {
			...activeSchedule,
			title: data.title,
			users: data.users,
		};

		dispatch(
			updateSchedule({
				type: scheduleType ? "owner" : "shared",
				schedule: newSchedule,
			})
		);
		saveToDatabase(newSchedule, undefined, "schedule", "PUT");
		setOpen(false);
	};

	const checkEmail = (email: string) => {
		const regex = /\S+@\S+\.\S+/;
		return regex.test(email);
	};

	return (
		<Popover.Root defaultOpen={false} open={open} onOpenChange={setOpen}>
			<Popover.Trigger asChild>{children}</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					onInteractOutside={e => {
						const target = e.target as HTMLElement;
						if (target.classList.contains("AlertDialog")) {
							e.preventDefault();
							e.stopPropagation();
						}
					}}
					className={`${styles.PopoverContent} rounded p-4 bg-neutral-100 dark:bg-neutral-800 shadow-md z-10`}
					sideOffset={5}
				>
					<form
						style={{ display: "flex", flexDirection: "column", gap: 10 }}
						onSubmit={e => {
							e.preventDefault();
							saveSchedule();
						}}
					>
						<p
							className="Text m-0 text-sm font-bold"
							style={{ marginBottom: 10 }}
						>
							Edit schedule
						</p>
						<fieldset className="Fieldset flex gap-5 items-center">
							<label className="Label w-20" htmlFor="Id">
								Id
							</label>
							<input
								className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6 dark:text-teal-800"
								id="Id"
								disabled
								defaultValue={data.id}
							/>
						</fieldset>
						<fieldset className="Fieldset flex gap-5 items-center">
							<label className="Label w-20" htmlFor="Title">
								Title
							</label>
							<input
								className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6 dark:text-teal-800"
								id="Title"
								placeholder="Title"
								defaultValue={data.title}
								onChange={e => {
									if (!e.target.value) {
										dispatch(
											openAlert({
												title: "Title cannot be empty",
												alertType: "error",
												alertOrConfirm: "alert",
											})
										);
										return;
									}
									if (e.target.value.length > 25) {
										dispatch(
											openAlert({
												title: "Title cannot be longer than 25 characters",
												alertType: "error",
												alertOrConfirm: "alert",
											})
										);
										return;
									}
									setData({ ...data, title: e.target.value });
								}}
							/>
						</fieldset>
					</form>
					<Popover.Close
						className="PopoverClose absolute top-2 right-2 h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
						aria-label="Close"
					>
						X
					</Popover.Close>
					<Popover.Arrow className={`${styles.PopoverArrow} shadow-md`} />

					<button
						type="button"
						className="bg-primaryDark text-primaryBackground hover:bg-teal-900 transition-colors w-full font-bold text-l p-2 px-2 rounded-lg mt-2"
						onClick={() => {
							saveSchedule();
						}}
					>
						Save
					</button>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
