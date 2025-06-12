// models/Result.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    quantity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "cancelled"],
    },
}, {
    timestamps: true,
}
);

const Result = mongoose.model("Order", orderSchema);

export default Result;



