const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,

	products: [
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product"
			},
			quantity: {type: Number, default: 1, required: true}
		}
	]

	// product: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: "Product",
	// 	required: true
	// }
	// quantity: {type: Number, default: 1, required: true}
});

module.exports = mongoose.model("Order", orderSchema);
