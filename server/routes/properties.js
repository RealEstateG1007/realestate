const express = require('express');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/properties — list with filters
router.get('/', async (req, res) => {
    try {
        const query = { status: 'published' };

        // Filter by type (sale/rent)
        if (req.query.type) query.type = req.query.type;

        // Filter by property type
        if (req.query.propertyType) query.propertyType = req.query.propertyType;

        // Filter by city
        if (req.query.city) query.city = new RegExp(req.query.city, 'i');

        // Filter by bedrooms
        if (req.query.bedrooms) query.bedrooms = { $gte: parseInt(req.query.bedrooms) };

        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = parseInt(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = parseInt(req.query.maxPrice);
        }

        // Filter by furnished status
        if (req.query.furnished) query.furnished = req.query.furnished;

        // Filter by pet friendly
        if (req.query.petFriendly) query.petFriendly = req.query.petFriendly === 'true';

        // Search by keyword in title or description
        if (req.query.keyword) {
            const keyword = new RegExp(req.query.keyword, 'i');
            query.$or = [{ title: keyword }, { description: keyword }];
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const sort = req.query.sort || '-createdAt';

        const properties = await Property.find(query)
            .populate('owner', 'name email role verified')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Property.countDocuments(query);

        res.json({
            success: true,
            count: properties.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            properties
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/properties/user/my-listings — get current user's listings
// NOTE: This must be ABOVE /:id to avoid Express treating "user" as an ID param
router.get('/user/my-listings', protect, async (req, res) => {
    try {
        const properties = await Property.find({ owner: req.user._id }).sort('-createdAt');
        res.json({ success: true, count: properties.length, properties });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/properties/:id — single property
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'name email role phone verified');

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        res.json({ success: true, property });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/properties — create (seller/agent only)
router.post('/', protect, authorize('seller', 'agent', 'admin'), async (req, res) => {
    try {
        req.body.owner = req.user._id;
        const property = await Property.create(req.body);
        res.status(201).json({ success: true, property });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/properties/:id — update (owner only)
router.put('/:id', protect, async (req, res) => {
    try {
        let property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Only owner or admin can update
        if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
        }

        property = await Property.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, property });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/properties/:id — delete (owner only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
        }

        await property.deleteOne();
        res.json({ success: true, message: 'Property deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


module.exports = router;

