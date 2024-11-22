const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN;

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

module.exports = { authenticate };
