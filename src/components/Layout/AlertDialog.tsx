"use client";

import * as ReactAlertDialog from "@radix-ui/react-alert-dialog";
import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import { closeAlert } from "@/store/slices/alertSlice";

export default function AlertDialog() {
	const alertInfo = useAppSelector(state => state.alert.alertInfo);
	const dispatch = useAppDispatch();

	const close = () => {
		dispatch(closeAlert());
	};

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Enter") {
				if (alertInfo !== null && alertInfo.onConfirm) alertInfo.onConfirm();
				if (alertInfo !== null) close();
			}
		}
		if (alertInfo !== null) {
			window.addEventListener("keydown", handleKeyDown);
			console.log("added event listener");
		}

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			console.log("removed event listener");
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [alertInfo]);

	return (
		<ReactAlertDialog.Root
			defaultOpen={false}
			open={alertInfo !== null}
			onOpenChange={close}
		>
			<ReactAlertDialog.Portal>
				<ReactAlertDialog.Overlay className="bg-[#00000085] data-[state=open]:animate-overlayShow fixed inset-0 z-10" />
				<ReactAlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] z-20 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white dark:bg-neutral-800 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
					<ReactAlertDialog.Title
						className={`m-0 text-[17px] font-medium ${
							alertInfo?.alertType === "error" && "text-red-500"
						} ${alertInfo?.alertType === "success" && "text-green-500"} ${
							alertInfo?.alertType === "warning" && "text-yellow-500"
						}`}
					>
						{alertInfo?.title}
					</ReactAlertDialog.Title>
					{alertInfo?.description && (
						<ReactAlertDialog.Description className="mt-4 mb-5 text-[15px] leading-normal">
							{alertInfo?.description}
						</ReactAlertDialog.Description>
					)}
					<div className="flex justify-end gap-[25px]">
						{alertInfo?.confirm && (
							<ReactAlertDialog.Cancel asChild>
								<button
									onClick={close}
									type="button"
									className="bg-teal-100 hover:bg-teal-200 focus:shadow-teal-100 dark:bg-teal-900 dark:hover:bg-teal-800 dark:focus:shadow-teal-900 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]"
								>
									{alertInfo?.cancelText || "Cancel"}
								</button>
							</ReactAlertDialog.Cancel>
						)}
						<ReactAlertDialog.Action asChild>
							<button
								onClick={alertInfo?.onConfirm}
								type="button"
								className={`${
									alertInfo?.alertType === "error" &&
									"text-white bg-red-500 hover:bg-red-600 focus:shadow-red-400 dark:focus:shadow-red-800"
								} ${
									alertInfo?.alertType === "success" &&
									"text-white bg-green-500 hover:bg-green-600 focus:shadow-green-400 dark:focus:shadow-green-800"
								} ${
									alertInfo?.alertType === "warning" &&
									"text-white bg-yellow-500 hover:bg-yellow-600 focus:shadow-yellow-400 dark:focus:shadow-yellow-800"
								} inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]`}
							>
								{alertInfo?.confirmText || "OK"}
							</button>
						</ReactAlertDialog.Action>
					</div>
				</ReactAlertDialog.Content>
			</ReactAlertDialog.Portal>
		</ReactAlertDialog.Root>
	);
}
