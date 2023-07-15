"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
	const { data: session } = useSession();
	return (
		<main className="flex bg-primaryBackground dark:bg-primaryDark text-primaryDark dark:text-primaryBackground flex-col items-center p-2 sm:p-24">
			<div className="flex flex-col items-center gap-4">
				<h1 className="text-6xl font-bold text-center">SitterSync</h1>
				<h3 className="text-4xl font-bold text-center">
					Schedule for children's habits, to help guardians share those habits
					with nannys.
				</h3>
			</div>

			<div className="flex flex-col items-center gap-4 mt-24">
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

			<div className="flex flex-col items-center gap-4 mt-24">
				{session ? (
					<h2 className="text-2xl font-bold text-center">
						Welcome back, {session.user?.name}!
					</h2>
				) : (
					<h2 className="text-2xl font-bold text-center">
						Get started today for free!
					</h2>
				)}

				<div className="flex flex-row items-center gap-4">
					{session ? (
						<Link href="/schedule" className="hover:underline">
							Go to schedule
						</Link>
					) : (
						<button
							type="button"
							className="bg-primaryDark text-primaryBackground hover:bg-teal-900 transition-colors font-bold text-2xl p-4 rounded-lg"
							onClick={() => {
								signIn();
							}}
						>
							Sign up / Sign in
						</button>
					)}
				</div>
			</div>
		</main>
	);
}
