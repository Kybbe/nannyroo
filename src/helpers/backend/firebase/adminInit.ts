import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "./sittersync-firebase-adminsdk-j5zgq-f40209e460.json";

if (admin.apps.length === 0) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount as ServiceAccount),
	});
}

export default admin;
