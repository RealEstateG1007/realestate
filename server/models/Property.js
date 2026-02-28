const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 120
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 2000
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    type: {
        type: String,
        enum: ['sale', 'rent'],
        required: true
    },
    propertyType: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'condo', 'townhouse', 'land', 'commercial'],
        required: true
    },
    bedrooms: {
        type: Number,
        min: 0,
        default: 0
    },
    bathrooms: {
        type: Number,
        min: 0,
        default: 0
    },
    sqft: {
        type: Number,
        min: 0
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        trim: true
    },
    images: [{
        type: String
    }],
    amenities: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'pending', 'sold', 'rented'],
        default: 'draft'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    geoLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    petFriendly: {
        type: Boolean,
        default: false
    },
    furnished: {
        type: String,
        enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
        default: 'unfurnished'
    }
}, {
    timestamps: true
});

// Index for search performance
propertySchema.index({ city: 1, price: 1, type: 1, status: 1 });
propertySchema.index({ owner: 1 });

module.exports = mongoose.model('Property', propertySchema);
