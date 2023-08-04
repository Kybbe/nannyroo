import { NextApiRequest, NextApiResponse } from "next";
import admin from "./firebase/adminInit";

export default async function getAndCheckAuth(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!req.headers.authorization) {
		res.status(401).json({ error: "Unauthorized" });
		console.error("No authorization header");
		return { user: null, email: null };
	}

	const user = await admin
		.auth()
		.verifyIdToken(req.headers.authorization.split(" ")[1])
		.catch(error => {
			console.error(error);
			res.status(401).json({ error: "Unauthorized" });
		});

	const email = user?.email;
	if (!email) {
		res.status(401).json({ error: "Unauthorized" });
		console.error("No email");
	}

	return { user, email };
}
