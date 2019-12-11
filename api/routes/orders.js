const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
	res.status(200).json({
		message: "Here are the orders"
	});
});

router.post("/", (req, res, next) => {
	res.status(201).json({
		message: "Order created"
	});
});

router.get("/:orderId", (req, res, next) => {
	const {orderId} = req.params;
	res.status(200).json({
		message: "Here are the order details: ",
		orderId: orderId
	});
});

module.exports = router;
