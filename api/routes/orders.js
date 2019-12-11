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
	const {orderQuantity, productId} = req.body;
	Product.findById(productId)
		.then(product => {
			if (product) {
				const order = new Order({
					_id: mongoose.Types.ObjectId(),
					quantity: orderQuantity,
					product: productId
				});
				return order.save();
			} else {
				console.log(`Error! Null product`);
				res.status(404).json({
					message: `Error! Null product`
				});
			}
		})
		.then(result => {
			console.log(`Success! ${result}`);
			res.status(201).json({
				message: "Order created",
				createdOrder: {
					_id: result._id,
					product: result.product,
					quantity: result.quantity
				},
				request: {
					type: "GET",
					url: `http://localhost:2000/order/${result._id}`
				}
			});
		})
		.catch(err => {
			console.log(`Error! ${err}`);
			res.status(404).json({
				message: `Error!`,
				error: err
			});
		});
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
