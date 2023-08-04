"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { useAuthContext } from "@/context/AuthContext";

export default function LoginLogoutBtn() {
	const user = useAuthContext();
	const router = useRouter();

	if (user) {
		return (
			<>
				<Link href="/profile">Welcome {user.displayName || user.email}!</Link>
				<button
					type="button"
					onClick={async () => {
						console.info("Signed out");
						const auth = getAuth();
						const { result, error } = await signOut(auth);

						if (error) {
							console.error(error);
							return;
						}
						console.info("Signed out result", result);
					}}
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
			onClick={() => {
				router.push("/profile");
			}}
			className="hover:underline font-bold"
		>
			Sign in
		</button>
	);
}
