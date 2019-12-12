const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Order = require("../../models/order");
const Product = require("../../models/products");
const checkAuth = require("../middleware/check-auth");

router.get("/", checkAuth, (req, res, next) => {
	Order.find()
		.select("_id product quantity")
		.populate("product", "productName productPrice")
		.exec()
		.then(result => {
			console.log(`Success! ${result}`);
			res.status(200).json({
				message: "Here are all the orders",
				count: result.length,
				orders: result.map(doc => {
					return {
						_id: doc._id,
						product: doc.product,
						quantity: doc.quantity,
						request: {
							type: "GET",
							url: `http://localhost:2000/order/${doc._id}`
						}
					};
				})
			});
		})
		.catch(err => {
			console.log(`Error! ${err}`);
			res.status(500).json({
				message: `Error!`,
				error: err
			});
		});
});

router.post("/", checkAuth, (req, res, next) => {
	const {orderedProducts} = req.body;

	const productArray = [];

	if (orderedProducts.length > 1) {
		console.log("Mayor a 2");
	} else {
		const productId = orderedProducts[0].productId;
		const productQuantity = orderedProducts[0].productQuantity;
		// console.log(productId);
		// console.log(productQuantity);
		Product.findById(productId)
			.select("_id productName productPrice productImage")
			.then(result => {
				if (result) {
					// console.log(`Success! ${result}`);

					const product = {
						product: result,
						quantity: productQuantity
					};

					productArray.push(product);
					console.log(productArray);
					console.log(product);

					const order = new Order({
						_id: mongoose.Types.ObjectId(),
						products: productArray[0]
					});
					return order.save();
				} else {
					console.log(`Error! Product not found ${err}`);
					res.status(404).json({
						message: `Error! Product not found ${err}`
					});
				}
			})
			.then(result => {
				if (result) {
					// console.log(`Success! ${result}`);
					// console.log(`product: ${result.products[0].product}`);
					// console.log(`Quantity: ${result.products[0].quantity}`);

					res.status(201).json({
						message: "Order created",
						createdOrder: {
							_id: result._id,
							product: result.products[0].product,
							quantity: result.products[0].quantity
						}
					});
				} else {
					console.log(`Error! ${err} `);
					res.status(500).json({
						message: `Error! ${err}`
					});
				}
			})
			.catch(err => {
				console.log(`Error! ${err} `);
				res.status(500).json({
					message: `Error! ${err}`
				});
			});
	}
});

router.get("/:orderId", checkAuth, (req, res, next) => {
	const {orderId} = req.params;

	Order.findById(orderId)
		.select("_id product quantity")
		.exec()
		.then(result => {
			if (result) {
				console.log(`Success! ${result}`);
				res.status(200).json({
					message: "Here are the order details: ",
					order: result,
					request: {
						type: "GET",
						url: `http://localhost:2000/order`
					}
				});
			} else {
				console.log(`Error! ${err}`);
				res.status(404).json({
					message: `Error! Order not found`,
					error: err
				});
			}
		})
		.catch(err => {
			console.log(`Error! ${err}`);
			res.status(404).json({
				message: `Error! Order not found`,
				error: err
			});
		});
});

module.exports = router;
