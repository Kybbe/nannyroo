/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	signInWithEmailAndPassword,
	getAuth,
	createUserWithEmailAndPassword,
	AuthError,
} from "firebase/auth";
import firebaseApp from "./firebaseConfig";

const auth = getAuth(firebaseApp);

export default async function signUp(email: string, password: string) {
	let result = null;
	let error = null as AuthError | null;
	try {
		result = await createUserWithEmailAndPassword(auth, email, password);
	} catch (e: AuthError | any) {
		error = e;
	}

	return { result, error };
}

export async function signIn(email: string, password: string) {
	let result = null;
	let error = null as AuthError | null;
	try {
		result = await signInWithEmailAndPassword(auth, email, password);
	} catch (e: AuthError | any) {
		error = e;
	}

	return { result, error };
}

export async function signOut() {
	let result = null;
	let error = null;
	try {
		result = await auth.signOut();
	} catch (e) {
		error = e;
	}

	return { result, error };
}
