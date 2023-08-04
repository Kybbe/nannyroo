"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, DividerHorizontalIcon } from "@radix-ui/react-icons";
import { useAuthContext } from "@/context/AuthContext";

export default function Home() {
	const user = useAuthContext();
	const Router = useRouter();

	return (
		<main className="flex flex-col items-center p-2 sm:p-24">
			<div className="flex flex-col items-center gap-4">
				<h1 className="text-6xl font-bold text-center">SitterSync</h1>
				<h3 className="text-4xl font-bold text-center">
					Schedule for children's habits, to help guardians share those habits
					with nannys.
				</h3>
			</div>

			<DividerHorizontalIcon
				style={{
					height: "2em",
					width: "2em",
				}}
			/>

			<div className="flex flex-col items-center gap-4 mt-4 sm:mt-24">
				<h2 className="text-2xl font-bold text-center">Features:</h2>
				<ul className="flex flex-col items-center gap-4">
					<li className="text-xl font-bold text-center">
						Create a schedule for your child's habits
					</li>
					<li className="text-xl font-bold text-center">
						Share that schedule with your nanny or significant other
					</li>
					<li className="text-xl font-bold text-center">
						Receive notifications when your child's habits are completed
					</li>
				</ul>
			</div>

			<DividerHorizontalIcon
				style={{
					height: "2em",
					width: "2em",
				}}
			/>

			<div className="flex flex-col items-center gap-4 mt-4 sm:mt-24">
				{user ? (
					<h2 className="text-2xl font-bold text-center">
						Welcome back, {user.displayName || user.email}!
					</h2>
				) : (
					<h2 className="text-2xl font-bold text-center">
						Get started today for free!
					</h2>
				)}

				<div className="flex flex-row items-center gap-4">
					{user ? (
						<Link
							href="/schedule"
							className="hover:underline text-xl flex flex-row justify-center items-center gap-2 hover:gap-4 transition-all"
						>
							Go to schedule
							<ArrowRightIcon
								style={{
									height: "1.5em",
									width: "1.5em",
								}}
							/>
						</Link>
					) : (
						<button
							type="button"
							className="bg-primaryDark text-primaryBackground hover:bg-teal-900 transition-colors font-bold text-2xl p-4 rounded-lg"
							onClick={() => {
								Router.push("/profile");
							}}
						>
							Get started for free!
						</button>
					)}
				</div>
			</div>
		</main>
	);
}
