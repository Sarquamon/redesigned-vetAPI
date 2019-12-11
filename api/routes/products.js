const express = require("express");
const mongoose = require("mongoose");
const Product = require("../../models/products");

const router = express.Router();

router.get("/", (req, res, next) => {
	Product.find()
		.exec()
		.then(result => {
			if (result) {
				if (result.length >= 0) {
					console.log(`Success! ${result}`);
					res.status(200).json(result);
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

router.post("/", (req, res, next) => {
	const {productName, productPrice} = req.body;

	const product = new Product({
		_id: new mongoose.Types.ObjectId(),
		productName: productName,
		productPrice: productPrice
	});

	product
		.save()
		.then(result => {
			console.log(`Success! ${result}`);
			res.status(201).json({
				message: "You're in POST method on /products",
				createdProduct: result
			});
		})
		.catch(err => {
			console.log(`Error! ${err}`);
			res.status(500).json({error: err});
		});
});

router.get("/:productId", (req, res, next) => {
	const {productId} = req.params;

	if (productId) {
		Product.findById(productId)
			.exec()
			.then(result => {
				if (result) {
					console.log(`Success! ${result}`);
					res.status(200).json(result);
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

router.delete("/:productId", (req, res, next) => {
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

router.patch("/:productId", (req, res, next) => {
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

module.exports = router;
