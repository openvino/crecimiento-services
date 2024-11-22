require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = process.env.PORT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN;

app.use(bodyParser.json());

const authenticate = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res
			.status(401)
			.json({ error: "Unauthorized: Missing or invalid token" });
	}

	const token = authHeader.split(" ")[1];
	if (token !== API_BEARER_TOKEN) {
		return res.status(403).json({ error: "Forbidden: Invalid token" });
	}

	next();
};

app.post("/checkin", authenticate, async (req, res) => {
	console.log("Body:", req.body);

	const { did, email } = req.body;
	console.log(did, email);

	if (!did || !email) {
		return res
			.status(400)
			.json({ error: "Missing required fields: did, email" });
	}

	const now = new Date();
	const time = new Date(now.getTime());
	try {
		const response = await axios.post(
			`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
			{
				fields: {
					did: did,
					email: email,
					timestamp: time,
				},
			},
			{
				headers: {
					Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
					"Content-Type": "application/json",
				},
			}
		);

		res.status(201).json({ status: "Ok", record: response.data });
	} catch (error) {
		console.error(
			"Error saving data to Airtable:",
			error.response?.data || error.message
		);
		res
			.status(500)
			.json({ status: "Error", error: "Failed to save data to Airtable" });
	}
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
