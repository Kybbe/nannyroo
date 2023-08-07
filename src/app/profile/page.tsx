"use client";

import {
	AuthError,
	GoogleAuthProvider,
	getAuth,
	isSignInWithEmailLink,
	sendPasswordResetEmail,
	sendSignInLinkToEmail,
	signInWithEmailLink,
	signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	EnvelopeClosedIcon,
} from "@radix-ui/react-icons";
import signUp, { signIn } from "@/helpers/frontend/firebase/Auth";
import { useAuthContext } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import { openAlert } from "@/store/slices/alertSlice";

const provider = new GoogleAuthProvider();

export default function Profile() {
	const [loginInfo, setLoginInfo] = useState({
		email: "",
		password: "",
	});
	const [loginOrRegister, setLoginOrRegister] = useState<"Login" | "Register">(
		"Login"
	);
	const [magicLink, setMagicLink] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<AuthError | null>(null);
	const user = useAuthContext();
	const dispatch = useAppDispatch();

	const auth = getAuth();
	if (isSignInWithEmailLink(auth, window.location.href)) {
		let email = window.localStorage.getItem("emailForSignIn");
		if (!email) {
			// eslint-disable-next-line no-alert
			email = window.prompt("Please provide your email for confirmation");
			if (!email) {
				// User cancelled the input
				email = "";
			}
		}
		// The client SDK will parse the code from the link for you.
		signInWithEmailLink(auth, email, window.location.href)
			.then(result => {
				window.localStorage.removeItem("emailForSignIn");
				console.info("result from login with email link", result);
			})
			.catch(err => {
				console.error(err);
			});
	}

	const loginRegister = async () => {
		if (loading) return;
		if (!loginInfo.email || !loginInfo.password) {
			dispatch(
				openAlert({
					title: "Please enter an email and password",
					alertType: "error",
					alertOrConfirm: "alert",
				})
			);
			return;
		}

		setLoading(true);
		if (loginOrRegister === "Login") {
			const { result: res, error: err } = await signIn(
				loginInfo.email,
				loginInfo.password
			);
			if (err) {
				setError(err);
				setLoading(false);
				return;
			}
			console.info("logged in response", res);
		} else {
			const { result: res, error: err } = await signUp(
				loginInfo.email,
				loginInfo.password
			);
			if (err) {
				setError(err);
				setLoading(false);
				return;
			}
			console.info("register response", res);
		}
		setLoading(false);
	};

	const actionCodeSettings = {
		// URL you want to redirect back to. The domain (www.example.com) for this
		// URL must be in the authorized domains list in the Firebase Console.
		url: "https://sittersync.vercel.app/profile",
		handleCodeInApp: true,
	};

	if (!user)
		return (
			<div className="flex items-center justify-center flex-1">
				<div className="flex flex-col items-center gap-4 p-6 bg-neutral-200 dark:bg-neutral-900 rounded-lg shadow-lg">
					<h2 className="text-2xl font-bold text-center">
						{loginOrRegister} to SitterSync
					</h2>

					<input
						type="email"
						placeholder="email"
						value={loginInfo.email}
						onChange={e => {
							setLoginInfo({ ...loginInfo, email: e.target.value });
						}}
						className="w-full p-1 border-solid border-b border-primaryDark focus:border-primaryDark dark:text-teal-800"
					/>
					{!magicLink && (
						<input
							type="password"
							placeholder="password"
							value={loginInfo.password}
							onChange={e => {
								setLoginInfo({ ...loginInfo, password: e.target.value });
							}}
							className="w-full p-1 border-solid border-b border-primaryDark focus:border-primaryDark dark:text-teal-800"
						/>
					)}
					<button
						className={`bg-primaryDark text-primaryBackground rounded-lg px-4 py-2 w-full ${
							error ? "border-2 border-red-500 bg-red-300 text-neutral-800" : ""
						} hover:bg-teal-800 hover:text-neutral-100 transition-colors`}
						type="button"
						onClick={async () => {
							if (!magicLink) {
								loginRegister();
							} else {
								localStorage.setItem("magicLinkEmail", loginInfo.email);

								sendSignInLinkToEmail(auth, loginInfo.email, actionCodeSettings)
									.catch(err => {
										console.error(err);
										setError(err);
									})
									.finally(() => {
										dispatch(
											openAlert({
												title: "Check your email",
												description: `We sent an email to ${loginInfo.email} with a link to sign in.`,
												alertType: "success",
												alertOrConfirm: "alert",
											})
										);

										setMagicLink(false);
										setLoading(false);
									});
							}
						}}
					>
						{loginOrRegister}
					</button>

					{error && (
						<p className="text-red-500">{`${error.code}, ${error.message}`}</p>
					)}

					{!magicLink && (
						<h2 className="text-xl font-bold text-center dark:text-teal-800">
							OR
						</h2>
					)}

					{!magicLink && (
						<button
							type="button"
							className="bg-primaryDark text-primaryBackground rounded-lg px-4 py-2 w-full hover:bg-teal-800 hover:text-neutral-100 transition-colors flex flex-row items-center"
							onClick={() => {
								setMagicLink(true);
							}}
						>
							Send login link to <EnvelopeClosedIcon className="ml-2 mr-1" />{" "}
							email
						</button>
					)}

					{!magicLink && (
						<button
							className="bg-primaryDark text-primaryBackground rounded-lg px-4 py-2 w-full hover:bg-teal-800 hover:text-neutral-100 transition-colors"
							type="button"
							onClick={async () => {
								setLoading(true);
								signInWithPopup(auth, provider)
									.then(result => {
										const { user: googleUser } = result;
										console.info("googleUser", googleUser);
									})
									.catch(err => {
										console.error(err);
										setError(err);
									});
								setLoading(false);
							}}
						>
							Sign in with Google
						</button>
					)}

					{magicLink && (
						<button
							type="button"
							className="text-primaryDark text-sm mt-4 hover:underline flex flex-row items-center gap-1 hover:gap-2 transition-all"
							onClick={() => {
								setMagicLink(false);
							}}
						>
							<ArrowLeftIcon />
							Go back
						</button>
					)}

					<button
						className="text-primaryDark text-sm mt-4 hover:underline"
						type="button"
						onClick={() => {
							setLoginOrRegister(
								loginOrRegister === "Login" ? "Register" : "Login"
							);
						}}
					>
						Switch to {loginOrRegister === "Login" ? "Register" : "Login"}
					</button>
				</div>
			</div>
		);
	return (
		<div className="flex flex-col items-center gap-1">
			{user.photoURL && (
				<img
					src={user.photoURL}
					alt="Profile pic of user"
					width={200}
					height={200}
					className="rounded-full"
				/>
			)}
			<h2 className="text-2xl font-bold text-center">
				Welcome back, {user.displayName || user.email}!
			</h2>

			{user.displayName && <p className="text-l text-center">{user?.email}</p>}

			<label htmlFor="notis" className="flex flex-row items-center gap-2 mt-4">
				I would like notfications when tasks are completed by others{" "}
				<input
					id="notis"
					name="notis"
					type="checkbox"
					className="cursor-pointer h-4 w-4 dark:text-teal-800"
				/>
			</label>

			<button
				className="bg-primaryDark text-primaryBackground rounded-lg px-4 py-2 hover:bg-teal-800 hover:text-neutral-100 transition-colors"
				type="button"
				onClick={async () => {
					if (!user || !user.email) return;

					sendPasswordResetEmail(auth, user.email)
						.then(() => {
							// Password reset email sent!
							// ..
						})
						.catch(err => {
							console.error(err);
							setError(err);
						});
				}}
			>
				Reset password
			</button>

			<Link
				href="/schedule"
				className="hover:underline mt-20 text-xl flex flex-row justify-center items-center gap-2 hover:gap-4 transition-all"
			>
				Go to schedule
				<ArrowRightIcon
					style={{
						height: "1.5em",
						width: "1.5em",
					}}
				/>
			</Link>
		</div>
	);
}
