const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	const {authorization} = req.headers;
	const token = authorization.split(" ")[1];
	try {
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userVer = decoded;
		next();
	} catch (error) {
		return res.status(401).json({
			message: "Auth Failed"
		});
	}
};
