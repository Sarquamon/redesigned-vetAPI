const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
	res.status(200).json({
		message: "You're in GET method on /products"
	});
});

router.post("/", (req, res, next) => {
	const {productName, productPrice} = req.body;
	res.status(201).json({
		message: "You're in POST method on /products",
		productName: `This is the product name: ${productName}`,
		productPrice: `This is the product price: ${productPrice}`
	});
});

router.get("/:productId", (req, res, next) => {
	const {productId} = req.params;

	if (productId === "salomon") {
		res.status(200).json({
			message: `hola ${productId}`,
			id: productId
		});
	} else {
		res.status(200).json({
			message: `Hola man`
		});
	}
});

module.exports = router;
