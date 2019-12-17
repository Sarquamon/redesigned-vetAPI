const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const checkAuth = require("../middleware/check-auth");
const Product = require("../../models/products");

const router = express.Router();

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, "./uploads/");
	},
	filename: function(req, file, cb) {
		cb(
			null,
			`${new Date().toISOString().replace(/:/g, "-")}${file.originalname}`
		);
	}
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
});

// Get all products from database
router.get("/", (req, res, next) => {
	Product.find()
		.select("productName productPrice _id productImage productCat")
		.exec()
		.then(result => {
			if (result) {
				if (result.length >= 0) {
					const response = {
						count: result.length,
						products: result.map(doc => {
							return {
								_id: doc._id,
								productName: doc.productName,
								productPrice: doc.productPrice,
								productImage: `http://localhost:2000/${doc.productImage}`,
								productCat: doc.productCat,
								request: {
									type: "GET",
									url: `http://localhost:2000/product/${doc._id}`
								}
							};
						})
					};
					console.log(`Success! ${response}`);
					res.status(200).json(response);
				} else {
					console.log(`No entries! ${result}`);
					res
						.status(404)
						.json({message: `No entries have been found ${result}`});
				}
			} else {
				console.log(`Not found! ${result}`);
				res.status(404).json({message: `Not found! ${result}`});
			}
		})
		.catch(err => {
			console.log(`Error! ${err}`);
			res.status(500).json({error: err});
		});
});

// Store data to database
router.post("/", checkAuth, upload.single("productImage"), (req, res, next) => {
	const {productName, productPrice} = req.body;
	console.log(req.file);

	const product = new Product({
		_id: new mongoose.Types.ObjectId(),
		productName: productName,
		productPrice: productPrice,
		productImage: req.file.path
	});

	product
		.save()
		.then(result => {
			console.log(`Success! ${result}`);
			res.status(201).json({
				message: "Product created sucessfully",
				createdProduct: {
					productName: result.productName,
					productPrice: result.productPrice,
					productImage: result.productImage,
					_id: result._id,
					request: {
						type: "GET",
						url: `http://localhost:2000/product/${result._id}`
					}
				}
			});
		})
		.catch(err => {
			console.log(`Error! ${err}`);
			res.status(500).json({error: err});
		});
});

//Get all products from database with the given name
router.get("/searchName/:productName", (req, res, next) => {
	const {productName} = req.params;
	if (productName) {
		Product.find({$text: {$search: productName.toString()}})
			.select("productName productPrice productImage")
			.exec()
			.then(result => {
				console.log(`Success! ${result}`);
				res.status(200).json({
					message: "Success!",
					// products: result
					products: result.map(doc => {
						return {
							_id: doc._id,
							productName: doc.productName,
							productPrice: doc.productPrice,
							productImage: `http://localhost:2000/${doc.productImage}`,
							request: {
								type: "GET",
								url: `http://localhost:2000/product/${doc._id}`
							}
						};
					})
					// products: [
					// 	{
					// 		_id: result[0]._id,
					// 		productName: result[0].productName,
					// 		productPrice: result[0].productPrice,
					// 		productImage: `http://localhost:2000/${result[0].productImage}`
					// 	}
					// ]
				});
			})
			.catch(err => {
				console.log(`Error ${err}`);
				res.status(404).json({
					message: "Product not found"
				});
			});
	} else {
		console.log(`Error! Empty product name`);
		res.status(404).json({
			message: "Error! Empty product name"
		});
	}
});

// Get Specific product from database using ID
router.get("/:productId", (req, res, next) => {
	const {productId} = req.params;

	if (productId) {
		Product.findById(productId)
			.select("productName productPrice _id productImage")
			.exec()
			.then(result => {
				if (result) {
					console.log(`Success! ${result}`);
					res.status(200).json({
						// product: result,
						product: {
							_id: result._id,
							productName: result.productName,
							productPrice: result.productPrice,
							productImage: `http://localhost:2000/${result.productImage}`
						},
						request: {
							type: "GET",
							url: `http://localhost:2000/product`
						}
					});
				} else {
					console.log(`Not found! ${result}`);
					res.status(404).json({message: "Not found"});
				}
			})
			.catch(err => {
				console.log(`Error! ${err}`);
				res.status(500).json({error: err});
			});
	} else {
		console.log(`Not found! ${productId}`);
		res.status(404).json({message: `Not found! ${productId}`});
	}
});

// Delete specific product from database
router.delete("/:productId", checkAuth, (req, res, next) => {
	const {productId} = req.params;

	if (productId) {
		Product.remove({_id: productId})
			.exec()
			.then(result => {
				if (result) {
					console.log(`Success! ${result}`);
					res.status(200).json(result);
				} else {
					console.log(`Not found! ${productId}`);
					res.status(404).json({message: `Not found! ${productId}`});
				}
			})
			.catch(err => {
				console.log(`Error! ${err}`);
				res.status(500).json({error: err});
			});
	} else {
		console.log(`Not found! ${productId}`);
		res.status(404).json({message: `Not found! ${productId}`});
	}
});

// Update specific product from database
router.patch("/:productId", checkAuth, (req, res, next) => {
	const {productId} = req.params;
	if (productId) {
		const updateOps = {};

		for (const ops of req.body) {
			updateOps[ops.propName] = ops.value;
		}

		Product.update({_id: productId}, {$set: updateOps})
			.exec()
			.then(result => {
				if (result) {
					console.log(`Success! ${result}`);
					res.status(200).json({
						message: "Product Updated",
						request: {
							type: "GET",
							url: `http://localhost:2000/product/${productId}`
						}
					});
				} else {
					console.log(`Not found! ${productId}`);
					res.status(404).json({message: `Not found! ${productId}`});
				}
			})
			.catch(err => {
				console.log(`Error! ${err}`);
				res.status(500).json({error: err});
			});
	} else {
		console.log(`Not found! ${productId}`);
		res.status(404).json({message: `Not found! ${productId}`});
	}
});

module.exports = router;
