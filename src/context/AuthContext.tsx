"use client";

import React from "react";
import firebase, { onAuthStateChanged, getAuth } from "firebase/auth";
import Loader from "@/components/Loader";
import firebaseApp from "../helpers/frontend/firebase/firebaseConfig";

const auth = getAuth(firebaseApp);

type User = firebase.User | null;

export const AuthContext = React.createContext<User | null>(null);

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [user, setUser] = React.useState<User | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, u => {
			if (u) {
				setUser(u);
			} else {
				setUser(null);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const authContextValue = React.useMemo(() => user, [user]);

	return (
		<AuthContext.Provider value={authContextValue}>
			<Loader loading={loading}>{children}</Loader>
		</AuthContext.Provider>
	);
};
