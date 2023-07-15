"use client";

import { useSession } from "next-auth/react";

export default function Profile() {
	const { data: session } = useSession();
	if (!session)
		return (
			<div className="flex flex-col items-center gap-4 mt-24">
				<h2 className="text-2xl font-bold text-center">
					You are not logged in!
				</h2>
			</div>
		);
	return (
		<div className="flex flex-col items-center gap-1">
			{session.user?.image && (
				<img
					src={session.user?.image}
					alt="Profile pic of user"
					width={200}
					height={200}
					className="rounded-full"
				/>
			)}
			<h2 className="text-2xl font-bold text-center">
				Welcome back, {session.user?.name}!
			</h2>

			<p className="text-l text-center">{session.user?.email}</p>

			<label htmlFor="notis" className="flex flex-row items-center gap-2 mt-4">
				I would like notfications when tasks are completed by others{" "}
				<input
					id="notis"
					name="notis"
					type="checkbox"
					className="cursor-pointer h-4 w-4"
				/>
			</label>
		</div>
	);
}
