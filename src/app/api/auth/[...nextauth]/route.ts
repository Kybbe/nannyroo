import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/components/auth/mongodb";
// eslint-disable-next-line import/no-unresolved
import { Adapter } from "next-auth/adapters";
import { CustomsendVerificationRequest } from "@/components/auth/signinemail";

const handler = NextAuth({
	theme: {
		logo: "/logo.svg",
		colorScheme: "auto",
		brandColor: "#E5FFFC",
		buttonText: "#387879",
	},
	adapter: MongoDBAdapter(clientPromise) as Adapter,
	// Configure one or more authentication providers
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID || "",
			clientSecret: process.env.GITHUB_SECRET || "",
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		}),
		EmailProvider({
			server: {
				host: process.env.EMAIL_SERVER_HOST || "",
				port: Number(process.env.EMAIL_SERVER_PORT) || 465,
				auth: {
					user: process.env.EMAIL_SERVER_USER || "",
					pass: process.env.EMAIL_SERVER_PASSWORD || "",
				},
			},
			from: `SitterSync <${process.env.EMAIL_FROM}>`,
			sendVerificationRequest({ identifier, url, provider, theme }) {
				CustomsendVerificationRequest({ identifier, url, provider, theme });
			},
		}),
	],
});

export { handler as GET, handler as POST };
