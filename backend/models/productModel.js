const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'please enter product name'],
        },
        description: {
            type: String,
            required: [true, 'please enter product description'],
        },
        price: {
            type: Number,
            required: [true, 'please enter product price'],
        },
        ratings: {
            type: Number,
            default: 0,
        },
        images: [
            {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            },
        ],
        category: {
            type: String,
            required: [true, 'please enter product category'],
        },
        stock: {
            type: Number,
            required: [true, 'please enter product stock'],
            default: 1,
        },
        numOfReviews: {
            type: Number,
            default: 0,
        },
        reviews: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                rating: {
                    type: Number,
                    required: true,
                },
                comment: {
                    type: String,
                    required: true,
                },
            },
        ],
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Product', productSchema);
