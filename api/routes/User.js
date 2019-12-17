const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const router = express.Router();

const User = require("../../models/users");
const Product = require("../../models/products");

const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");

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
									message: `User created`,
									res: result
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
									expiresIn: "90h"
								}
							);
							return res.status(200).json({
								message: "Auth Successful",
								userId: result[0]._id,
								userEmail: result[0].userEmail,
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

router.delete("/:userId", (req, res, next) => {
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

router.post(
	"/updateUserProdHist/:productId&:userId",
	// checkAuth,
	(req, res, next) => {
		const {productId, userId} = req.params;

		console.log(`Producto: ${productId}`);
		console.log(`Usuario: ${userId}`);

		Product.findById(productId)
			.select("_id productName productImage productPrice")
			.then(productRes => {
				// console.log(productRes);

				if (productRes) {
					// 	console.log(productRes);

					const product = {
						product: productRes
					};
					// console.log(product);

					User.findByIdAndUpdate(
						{
							_id: userId
						},
						{$push: {watchedProductsHistory: product}},
						{new: true, useFindAndModify: false}
					)
						.then(result => {
							console.log(`User: ${result}`);
							res.status(200).json({
								message: "Success!",
								productId: result
							});
						})
						.catch(err => {
							console.log(err);
							res.status(404).json({
								message: "Error! User not found",
								Error: err
							});
						});
				} else {
					console.log(err);
					res.status(404).json({
						message: "Error! Product not found",
						Error: err
					});
				}
			})
			.catch(err => {
				console.log(err);

				res.status(404).json({
					message: "Error! Product not found",
					Error: err
				});
			});
	}
);

router.get(
	"/allWatchedProducts/:userId",
	/* checkAuth, */ (req, res, next) => {
		const {userId} = req.params;
		User.findById(userId)
			.select("_id watchedProductsHistory")
			.populate("watchedProductsHistory.product")
			.then(result => {
				console.log(`Success! ${result}`);

				res.status(200).json({
					message: "Success!",
					products: result
				});
			})
			.catch(err => {
				console.log(`Error! ${err}`);
				res.status(404).json({
					message: "User not found!",
					Error: err
				});
			});
	}
);

router.get(
	"/recommendCat/:cat",
	/* checkAuth, */ (req, res, next) => {
		const {cat} = req.params;

		if (cat) {
			Product.find({productCat: {$gte: parseInt(cat, 10)}})
				.then(result => {
					console.log(result);
					res.status(200).json({
						message: "Success!",
						products: result
					});
				})
				.catch(err => {
					console.log(`Error! ${err}`);
					res.status(404).json({
						message: "Error!",
						Error: err
					});
				});
		} else {
			console.log(`Error! ${err}`);
			res.status(404).json({
				message: "Error!",
				Error: err
			});
		}
	}
);

router.get(
	"/recommendedProducts/:userId",
	/* checkAuth, */ (req, res, next) => {
		const {userId} = req.params;
		const watchedProductsHistory = [];
		let avg = 0;

		User.findById(userId)
			.select("_id watchedProductsHistory")
			.populate("watchedProductsHistory.product")
			.then(prodHistList => {
				if (prodHistList) {
					prodHistList.watchedProductsHistory.forEach(element => {
						// console.log(`Element: ${element.product}`);

						watchedProductsHistory.push(element.product);
					});
				}
				watchedProductsHistory.forEach(product => {
					avg += product.productCat;
				});
				avg = avg / watchedProductsHistory.length;

				res.status(200).json({
					message: "Success!",
					category: avg
				});
			})
			.catch(err => {
				console.log(`Error! ${err}`);
				res.status(404).json({
					message: "User not found!",
					Error: err
				});
			});
	}
);

module.exports = router;
