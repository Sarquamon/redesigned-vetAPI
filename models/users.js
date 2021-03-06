const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	userEmail: {
		type: String,
		required: true,
		unique: true,
		match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
	},
	userPwd: {type: String, required: true},
	watchedProductsHistory: [
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product"
			}
		}
	]
});

module.exports = mongoose.model("User", userSchema);
