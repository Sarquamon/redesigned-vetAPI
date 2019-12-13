const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Order = require("../../models/order");
const Product = require("../../models/products");
const checkAuth = require("../middleware/check-auth");

router.get("/", checkAuth, (req, res, next) => {
	Order.find()
		.select("_id products")
		.populate("products.product")
		.exec()
		.then(result => {
			console.log(`Resultado: ${result}`);
			res.status(200).json({
				message: `Success! Here are all the orders`,
				orders: result
			});
		})
		.catch(err => {
			console.log(`Error! ${err} `);
			res.status(500).json({
				message: `Error! ${err}`
			});
		});
});

router.get("/checkSimilarProd", checkAuth, (req, res, next) => {
	const {activeProduct} = req.body;
	const elementWithSameProd = [];
	const possibleProducts = [];

	Order.find()
		.select("_id products")
		.populate("products.product")
		.exec()
		.then(result => {
			if (result) {
				const sameProductsArray = [];
				result.forEach(element => {
					if (element.products.length > 1) {
						sameProductsArray.push(element.products);
						// console.log(`elemento: ${element.products}`);
					}
				});

				//stores order which contains same product as listed
				sameProductsArray.forEach(element => {
					for (let i = 0; i < element.length; i++) {
						if (element[i].product._id == activeProduct) {
							elementWithSameProd.push(element);
						}
					}
				});

				//Stores the different products that is inside the order which contains the same product
				//(stores all other products but not the same as listed)
				elementWithSameProd.forEach(possibleProduct => {
					// console.log(`possibleProduct: ${possibleProduct}`);
					for (let i = 0; i < possibleProduct.length; i++) {
						if (!(possibleProduct[i].product._id == activeProduct)) {
							// console.log("no es igual");
							// console.log(
							// 	`Diferent Product id: ${possibleProduct[i].product._id}`
							// );

							possibleProducts.push(possibleProduct[i].product._id);
						} else {
							// console.log("es igual");
						}
					}
				});

				res.status(200).json({
					message:
						"This are the different products in the orders that contain the same product",
					possibleProducts: possibleProducts
				});
			}
		})
		.catch(err => {
			console.log(`Error! ${err} `);
			res.status(500).json({
				message: `Error! ${err}`
			});
		});
});

router.post("/", checkAuth, (req, res, next) => {
	const {orderedProducts} = req.body;

	const productArray = [];

	if (orderedProducts.length > 1) {
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

					// console.log(productArray);
					// console.log(product);

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
					// console.log(`Success! ${result._id}`);
					for (let i = 1; i < orderedProducts.length; i++) {
						console.log(`Posision: ${i} valor: ${orderedProducts[i]}`);

						const product = {
							product: orderedProducts[i].productId,
							quantity: orderedProducts[i].productQuantity
						};

						Order.findByIdAndUpdate(
							{_id: result._id},
							{$push: {products: product}},
							{new: true, useFindAndModify: false}
						)
							.then(finalResult => {
								if (finalResult) {
									console.log(`Success ${finalResult}`);
									res.status(201).json({
										message: "Order created"
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

					// console.log(productArray);
					// console.log(product);

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
