const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	productName: {type: String, required: true},
	productPrice: {type: Number, required: true},
	productImage: {type: String, required: true},
	productCat: {type: Number, required: true}
});

productSchema.index(
	{
		productName: "text",
		productDesc: "text"
	},
	{
		weights: {
			productName: 5,
			productDesc: 1
		}
	}
);

module.exports = mongoose.model("Product", productSchema);
