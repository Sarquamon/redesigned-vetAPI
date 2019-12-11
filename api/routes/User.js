const express = require("express");
const mongoose = require("mongoose");
const User = require("../../models/users");

const router = express.Router();

router.post("/signup", (req, res, next) => {
	const {userEmail, userPwd} = req.body;

	const user = new User({
		_id: new mongoose.Types.ObjectId(),
		userEmail: userEmail,
		userPwd: userPwd
	});
});

module.exports = router;
