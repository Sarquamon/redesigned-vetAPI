const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const router = express.Router();

const User = require("../../models/users");

const jwt = require("jsonwebtoken");

// create a new user on DB

router.post("/signup", (req, res, next) => {
	const {userEmail, userPwd} = req.body;

	User.find({userEmail: userEmail})
		.exec()
		.then(user => {
			if (user.length <= 0) {
				bcrypt.hash(userPwd, 10, (err, hashed) => {
					if (!err) {
						const user = new User({
							_id: new mongoose.Types.ObjectId(),
							userEmail: userEmail,
							userPwd: hashed
						});

						user
							.save()
							.then(result => {
								console.log(`Success! ${result}`);
								res.status(201).json({
									message: `User created`
								});
							})
							.catch(err => {
								console.log(`Error! ${err}`);
								res.status(500).json({
									message: `Error!`,
									error: err
								});
							});
					} else {
						console.log(`Error! Failed hash`);
						return res.status(500).json({
							message: `Error! Failed hash`,
							error: err
						});
					}
				});
			} else {
				console.log(`Email already taken!`);
				res.status(409).json({
					message: `Email already taken!`
				});
			}
		})
		.catch(err => {
			console.log(`Error! ${err}`);
			res.status(500).json({
				message: `Error`,
				error: err
			});
		});
});

router.post("/login", (req, res, next) => {
	const {userEmail, userPwd} = req.body;
	User.find({userEmail: userEmail})
		.exec()
		.then(result => {
			if (result.length >= 1) {
				bcrypt.compare(userPwd, result[0].userPwd, (err, response) => {
					if (!err) {
						if (response) {
							const token = jwt.sign(
								{email: result[0].userEmail, id: result[0]._id},
								process.env.JWT_KEY,
								{
									expiresIn: "10h"
								}
							);
							return res.status(200).json({
								message: "Auth Successful",
								token: token
							});
						} else {
							return res.status(401).json({
								message: "Auth failed"
							});
						}
					} else {
						return res.status(401).json({
							message: "Auth failed"
						});
					}
				});
			} else {
				return res.status(401).json({
					message: "Auth failed"
				});
			}
		})
		.catch(err => {
			console.log(`Error! ${err}`);
			res.status(500).json({
				message: `Error`,
				error: err
			});
		});
});

router.delete("/userId", (req, res, next) => {
	const {userId} = req.params;

	if (userId) {
		User.remove({_id: userId})
			.exec()
			.then(result => {
				res.status(200).json({
					message: `User deleted`
				});
			})
			.catch(err => {
				console.log(`Error! ${err}`);
				res.status(500).json({
					message: `Error`,
					error: err
				});
			});
	} else {
		console.log(`Error! ${err}`);
		res.status(500).json({
			message: `Error`,
			error: err
		});
	}
});

module.exports = router;
