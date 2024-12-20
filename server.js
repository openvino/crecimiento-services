require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { authenticate } = require("./middlewares");

const app = express();
const port = process.env.PORT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const DOOR_0 = process.env.CRECIMIENTO_DOOR_0;
const DOOR_1 = process.env.CRECIMIENTO_DOOR_1;

app.use(bodyParser.json());

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

app.get("/", (req, res) => {
	res.send("Crecimiento API: ON");
});

app.get("/door-0", async (req, res) => {
	try {
		const doorResponse = await axios.post(DOOR_0, { state: "open" });
		console.log("Door 0 response:", doorResponse.data);

		res.status(200).send("Door 0 opened");
	} catch (error) {
		res.status(500).send("Error opening door 0");
	}
});
app.get("/door-1", async (req, res) => {
	try {
		const doorResponse = await axios.post(DOOR_1, { state: "open" });
		console.log("Door 1 response:", doorResponse.data);

		res.status(200).send("Door 1 opened");
	} catch (error) {
		res.status(500).send("Error opening door 1");
	}
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
