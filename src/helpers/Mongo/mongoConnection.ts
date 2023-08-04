/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

const connectionString = process.env.MONGODB_URI;
let cachedClient = (global as any).mongoose;

if (!cachedClient) {
	(global as any).mongoose = { conn: null, promise: null };
	cachedClient = (global as any).mongoose;
}

/**
 * Returns a connection to the MongoDB database if it exists, otherwise it creates a new connection.
 * This function is used to prevent multiple connections to the database.
 * @returns {Promise<mongoose.Connection>}
 */
async function mongoConnection() {
	if (!connectionString || connectionString === undefined) {
		throw new Error(
			"Please define the MONGODB_URI environment variable in a .env.local file."
		);
	}

	if (cachedClient.conn) {
		return cachedClient.conn;
	}

	if (!cachedClient.promise) {
		cachedClient.promise = mongoose
			.connect(connectionString)
			.then(client => client);
		mongoose.set("strictQuery", true);
	}

	try {
		cachedClient.conn = await cachedClient.promise;
	} catch (error) {
		cachedClient.promise = null;
		console.error(error);
		throw error;
	}

	return cachedClient.conn;
}

export default mongoConnection;
