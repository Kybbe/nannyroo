import "./globals.css";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Header from "@/components/Layout/Header";
import { ReduxStoreProvider } from "@/components/Layout/ReduxStoreProvider";
import { AuthContextProvider } from "@/context/AuthContext";
import AlertDialog from "@/components/Layout/AlertDialog";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "SitterSync",
	description:
		"Schedule for children's habits, to help guardians share those habits with nannys.",
	themeColor: "#E5FFFC",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className={`${nunito.className} bg-neutral-50 dark:bg-neutral-950 text-primaryDark dark:text-primaryBackground min-h-screen flex flex-col`}
			>
				<ReduxStoreProvider>
					<AuthContextProvider>
						<Header />
						{children}

						<AlertDialog />
					</AuthContextProvider>
				</ReduxStoreProvider>
			</body>
		</html>
	);
}
