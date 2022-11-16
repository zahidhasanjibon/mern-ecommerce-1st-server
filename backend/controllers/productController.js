/* eslint-disable no-unused-vars */
// internal import
const Product = require('../models/productModel');
const APiFeatures = require('../utils/apiFeatures');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require("cloudinary")

// Create Product -- Admin
exports.createProduct = async (req, res, next) => {
    try {

        const images = req.body.images
        const imageLink = []
        for (let i = 0; i < images.length; i++) {
            const myCloud = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'products',
            })
            imageLink.push({
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            })

        }


        req.body.images = imageLink
        req.body.user = req.user._id;
        const product = await Product.create(req.body);
        return res.status(201).json({
            success: true,
            product,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// get all products
exports.getAllProducts = async (req, res, next) => {
    try {
        const resultPerPage = 8;
        const productCount = await Product.countDocuments();
        const apiFeatures = new APiFeatures(Product.find(), req.query)
            .search()
            .filter()

        let products = await apiFeatures.query;
        let filteredProductsCount = products.length;
        apiFeatures.pagination(resultPerPage);
        products = await apiFeatures.query.clone();

        return res.status(200).json({
            success: true,
            products,
            productCount,
            resultPerPage,
            filteredProductsCount
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};
// get all products (--ADMIN)
exports.getAllProductsAdmin = async (req, res, next) => {
    try {
        const products = await Product.find()

        return res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// get single product details
exports.getProductDetails = async (req, res, next) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);

        if (!product) {
            return next(new ErrorHandler('product not found', 404));
        }

        return res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// update product -- Admin
exports.updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        let product = await Product.findById(id);
        if (!product) {
            return next(new ErrorHandler('product not found', 404));
        }
            if(req.body.images !== 'undefined'){
                for (let j = 0; j < product.images.length; j++) {
                    await cloudinary.v2.uploader.destroy(product.images[j].public_id)
                }
                const imageLink = []

             for (let i = 0; i < req.body.images.length; i++) {
                const myCloud = await cloudinary.v2.uploader.upload(req.body.images[i],{
                    folder:"products"
                })
                imageLink.push({
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                })
            }
            req.body.images = imageLink
            }
            
   
        product = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        return res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// delete product -- Admin
exports.deleteProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);

        if (!product) {
            return next(new ErrorHandler('product not found', 404));
        }

        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id)
            
        }


        await product.remove();

        return res.status(200).json({
            success: true,
            message: 'product deleted successfully',
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// create review or update review
exports.createProductReview = async (req, res, next) => {
    try {
        const { comment, rating, productId } = req.body;

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        };
        const product = await Product.findById(productId);

        const isReviewd = product.reviews.find(
            (rev) => rev.user.toString() === req.user._id.toString()
        );

        if (isReviewd) {
            product.reviews.forEach((rev) => {
                if (rev.user.toString() === req.user._id.toString()) {
                    rev.rating = rating;
                    rev.comment = comment;
                }
            });
        } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        let total = 0;
        product.reviews.forEach((rev) => {
            total += rev.rating;
        });
        const avg = total / product.reviews.length;
        product.ratings = avg;
        await product.save({ validateBeforeSave: false });

        return res.status(200).json({ success: true, product });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// get all reviews of product
exports.getProductReviews = async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.id);
        if (!product) {
            return next(new ErrorHandler(`product not found`, 404));
        }
        return res.status(200).json({ success: true, reviews: product.reviews });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

//  Delete Review
exports.deleteReview = async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.productId);
        if (!product) {
            return next(new ErrorHandler(`product not found`, 404));
        }
        const reviews = product.reviews.filter(
            (rev) => rev._id.toString() !== req.query.id.toString()
        );
        let ratings;
        if (reviews.length === 0) {
            ratings = 0;
        } else {
            let total = 0;
            reviews.forEach((rev) => {
                total += rev.rating;
            });
            ratings = total / reviews.length;
        }

        const numOfReviews = reviews.length;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.query.productId,
            {
                reviews,
                ratings,
                numOfReviews,
            },
            { new: true, runValidators: true, useFindAndModify: false }
        );

        return res.status(200).json({ success: true, reviews: updatedProduct.reviews });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};
