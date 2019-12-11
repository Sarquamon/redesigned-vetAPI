const express = require("express");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/user");

const MONGODBURL = `mongodb+srv://admin:${process.env.MONGODB_ATLAS_PWD}@developmentapps-lmcx2.mongodb.net/test?retryWrites=true&w=majority`;

mongoose.connect(
	MONGODBURL,
	{useNewUrlParser: true, useUnifiedTopology: true},
	err => {
		if (!err) {
			console.log("Succesful MongoDB connection");
		} else {
			console.log(`Connection error ${err}`);
		}
	}
);

app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	if (req.method === "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
		return res.status(200).json({});
	}
	next();
});

app.use("/product", productRoutes);
app.use("/order", orderRoutes);
app.use("/user", userRoutes);

app.use((req, res, next) => {
	const error = new Error("Route not found");
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	});
});

module.exports = app;
