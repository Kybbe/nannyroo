/* eslint-disable jsx-a11y/label-has-associated-control */
import * as Popover from "@radix-ui/react-popover";
import { useEffect, useState } from "react";
import * as Select from "@radix-ui/react-select";
import {
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	PlusIcon,
	TrashIcon,
} from "@radix-ui/react-icons";
import { getAuth } from "firebase/auth";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import { updateSchedule } from "@/store/slices/scheduleSlice";
import saveToDatabase from "@/helpers/frontend/saveToDb";
import { openAlert } from "@/store/slices/alertSlice";
import { useAuthContext } from "@/context/AuthContext";
import styles from "./EditEventPopover.module.scss";

interface Props {
	children: React.ReactNode;
}

export default function EditSchedulePopover({ children }: Props) {
	const [open, setOpen] = useState(false);
	const [nextSharee, setNextSharee] = useState({
		email: "",
		permissions: "read" as "read" | "write",
	});
	const user = useAuthContext();

	const activeSchedule = useAppSelector(state => state.schedule.activeSchedule);
	const schedules = useAppSelector(state => state.schedule.schedules);
	const dispatch = useAppDispatch();

	const [data, setData] = useState({
		users: activeSchedule?.users || {
			ownerEmail: "",
			sharingWith: [],
		},
	});

	useEffect(() => {
		setData({
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
			users: data.users,
		};

		const response = await fetch(`/api/schedule?id=${activeSchedule._id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(newSchedule),
		});

		const editedSchedule = (await response.json()) as { success: boolean };
		if (!editedSchedule.success) {
			console.error("Failed to edit schedule");
			return;
		}

		console.info("Edited schedule", newSchedule);

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
							style={{ marginBottom: 10, marginRight: 15 }}
						>
							Edit who can view and edit "{activeSchedule?.title}"
						</p>
						{activeSchedule.users.ownerEmail === user?.email && (
							<fieldset className="Fieldset flex gap-5 items-center">
								<label className="Label w-20" htmlFor="Owner">
									Owner
								</label>
								<input
									className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-6 dark:text-teal-800"
									id="Owner"
									placeholder="Owner"
									defaultValue={data.users.ownerEmail}
									onChange={e => {
										setData({
											...data,
											users: {
												...data.users,
												ownerEmail: e.target.value,
											},
										});
									}}
								/>
							</fieldset>
						)}
						<fieldset className="Fieldset flex flex-col gap-3 items-center">
							<h2 className="pt-4">Sharing with</h2>
							<ul className="flex flex-col gap-2 w-full">
								{data.users.sharingWith.map(({ userEmail, permissions }) => (
									<li
										className="flex flex-row gap-2 items-center"
										key={userEmail}
									>
										<input
											className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-[35px] dark:text-teal-800"
											id="sharedWith"
											placeholder="Sharee email"
											defaultValue={userEmail}
											onBlur={e => {
												setData({
													...data,
													users: {
														...data.users,
														sharingWith: data.users.sharingWith.map(u => {
															if (u.userEmail === userEmail) {
																return {
																	...u,
																	userEmail: e.target.value,
																};
															}
															return u;
														}),
													},
												});
											}}
										/>

										<Select.Root
											value={permissions}
											onValueChange={e => {
												setData({
													...data,
													users: {
														...data.users,
														sharingWith: data.users.sharingWith.map(u => {
															if (u.userEmail === userEmail) {
																return {
																	...u,
																	permissions: e as "read" | "write",
																};
															}
															return u;
														}),
													},
												});
											}}
											aria-label="Permissions"
										>
											<Select.Trigger className="inline-flex items-center justify-center rounded px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-white text-teal-900 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-teal-500 outline-none">
												<Select.Value placeholder="Select permissions" />
												<Select.Icon className="text-teal-800">
													<ChevronDownIcon />
												</Select.Icon>
											</Select.Trigger>
											<Select.Portal>
												<Select.Content className="overflow-hidden z-10 bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
													<Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-teal-900 cursor-default">
														<ChevronUpIcon />
													</Select.ScrollUpButton>
													<Select.Viewport className="p-[5px]">
														<Select.Group>
															<Select.Item
																value="read"
																className="text-[13px] leading-none text-teal-800 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-teal-100 data-[highlighted]:text-teal-800"
															>
																<Select.ItemText>Read</Select.ItemText>
																<Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
																	<CheckIcon />
																</Select.ItemIndicator>
															</Select.Item>

															<Select.Item
																value="write"
																className="text-[13px] leading-none text-teal-800 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-teal-100 data-[highlighted]:text-teal-800"
															>
																<Select.ItemText>Write</Select.ItemText>
																<Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
																	<CheckIcon />
																</Select.ItemIndicator>
															</Select.Item>
														</Select.Group>
													</Select.Viewport>
													<Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-teal-800 cursor-default">
														<ChevronDownIcon />
													</Select.ScrollDownButton>
												</Select.Content>
											</Select.Portal>
										</Select.Root>

										<button
											type="button"
											className="bg-red-500 text-white hover:bg-red-600 transition-colors font-bold text-l p-2 px-2 rounded-lg h-[35px] leading-none"
											onClick={() => {
												setData({
													...data,
													users: {
														...data.users,
														sharingWith: data.users.sharingWith.filter(
															u => u.userEmail !== userEmail
														),
													},
												});
											}}
										>
											<TrashIcon />
										</button>
									</li>
								))}

								{data.users.sharingWith.length === 0 && (
									<li className="flex flex-row gap-2 items-center">
										<p className="text-gray-400">Not sharing with anyone</p>
									</li>
								)}
							</ul>

							<div className="flex flex-row gap-2 pb-4 items-center w-full">
								<input
									className="Input w-full inline-flex items-center justify-center flex-1 rounded-sm px-2 h-[35px] dark:text-teal-800"
									id="sharedWith"
									placeholder="Sharee email"
									value={nextSharee.email}
									onChange={e => {
										setNextSharee({
											...nextSharee,
											email: e.target.value,
										});
									}}
								/>

								<Select.Root
									value={nextSharee.permissions}
									onValueChange={e => {
										setNextSharee({
											...nextSharee,
											permissions: e as "read" | "write",
										});
									}}
								>
									<Select.Trigger
										className="inline-flex items-center justify-center rounded px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-white text-teal-900 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-teal-500 outline-none"
										aria-label="Permissions"
									>
										<Select.Value placeholder="Select permissions" />
										<Select.Icon className="text-teal-800">
											<ChevronDownIcon />
										</Select.Icon>
									</Select.Trigger>
									<Select.Portal>
										<Select.Content className="overflow-hidden z-10 bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
											<Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-teal-900 cursor-default">
												<ChevronUpIcon />
											</Select.ScrollUpButton>
											<Select.Viewport className="p-[5px]">
												<Select.Group>
													<Select.Item
														value="read"
														className="text-[13px] leading-none text-teal-800 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-teal-100 data-[highlighted]:text-teal-800"
													>
														<Select.ItemText>Read</Select.ItemText>
														<Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
															<CheckIcon />
														</Select.ItemIndicator>
													</Select.Item>

													<Select.Item
														value="write"
														className="text-[13px] leading-none text-teal-800 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-teal-100 data-[highlighted]:text-teal-800"
													>
														<Select.ItemText>Write</Select.ItemText>
														<Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
															<CheckIcon />
														</Select.ItemIndicator>
													</Select.Item>
												</Select.Group>
											</Select.Viewport>
											<Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-teal-800 cursor-default">
												<ChevronDownIcon />
											</Select.ScrollDownButton>
										</Select.Content>
									</Select.Portal>
								</Select.Root>

								<button
									type="button"
									className="bg-primaryDark text-primaryBackground hover:bg-teal-900 transition-colors font-bold text-l p-2 px-2 rounded-lg h-[35px] leading-none"
									onClick={() => {
										setData({
											...data,
											users: {
												...data.users,
												sharingWith: [
													...data.users.sharingWith,
													{
														userEmail: nextSharee.email,
														permissions: nextSharee.permissions,
													},
												],
											},
										});
										setNextSharee({
											email: "",
											permissions: "read",
										});
									}}
								>
									<PlusIcon />
								</button>
							</div>
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
