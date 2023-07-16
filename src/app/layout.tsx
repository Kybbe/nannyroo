import { NextAuthProvider } from "@/components/Layout/NextAuthProvider";
import "./globals.css";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Header from "@/components/Layout/Header";
import { ReduxStoreProvider } from "@/components/Layout/ReduxStoreProvider";

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
				className={`${nunito.className} bg-primaryBackground dark:bg-primaryDark text-primaryDark dark:text-primaryBackground min-h-screen flex flex-col`}
			>
				<ReduxStoreProvider>
					<NextAuthProvider>
						<Header />
						{children}
					</NextAuthProvider>
				</ReduxStoreProvider>
			</body>
		</html>
	);
}
