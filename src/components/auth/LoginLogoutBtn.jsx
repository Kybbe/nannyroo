"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function LoginLogoutBtn() {
	const { data: session } = useSession();
	if (session) {
		return (
			<>
				<Link href="/profile">Welcome {session.user.name}!</Link>
				<button
					type="button"
					onClick={() => signOut()}
					className="hover:underline font-bold"
				>
					Sign out
				</button>
			</>
		);
	}
	return (
		<button
			type="button"
			onClick={() => signIn()}
			className="hover:underline font-bold"
		>
			Sign in
		</button>
	);
}
