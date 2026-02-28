const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Using gemini-2.5-flash as the default model
const MODEL_NAME = 'gemini-2.5-flash';

// POST /api/ai/generate-description — Generate a property description
router.post('/generate-description', protect, authorize('seller', 'agent', 'admin'), async (req, res) => {
    try {
        const { title, price, bedrooms, bathrooms, type, propertyType, city, address, sqft } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'AI feature is not configured.' });
        }

        const prompt = `
You are an expert real estate copywriter. Write a highly engaging, professional, and SEO-friendly property description for the following listing. Highlight the best features and create excitement. Keep it under 200 words.

Property Details:
- Title: ${title || 'Not specified'}
- Type: ${propertyType || 'Property'} for ${type || 'sale'}
- Location: ${address || 'Not specified'}, ${city || 'Not specified'}
- Price: $${price || 'Not specified'}
- Bedrooms: ${bedrooms || 'Not specified'}
- Bathrooms: ${bathrooms || 'Not specified'}
- Square Feet: ${sqft || 'Not specified'}

Format the output as plain text with line breaks for readability. Do not include markdown formatting like ** or ##.
`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });

        res.json({
            success: true,
            description: response.text
        });

    } catch (err) {
        console.error('AI Description Error:', err);
        res.status(500).json({ success: false, message: 'Failed to generate description' });
    }
});

// POST /api/ai/nl-search — Natural Language Search to JSON Filters
router.post('/nl-search', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'AI feature is not configured.' });
        }

        const prompt = `
You are a real estate search assistant. Extract search filters from the user's natural language query and return ONLY a valid JSON object. 

Possible fields to extract:
- "type": either "sale" or "rent"
- "propertyType": "apartment", "house", "villa", "condo", "townhouse", "land", or "commercial"
- "city": string name of the city
- "minPrice": number
- "maxPrice": number
- "bedrooms": number
- "petFriendly": boolean
- "furnished": "unfurnished", "semi-furnished", or "fully-furnished"

If a field is not mentioned in the query, DO NOT include it in the JSON. Extract prices accurately (e.g., "$1.5M" -> 1500000).

User Query: "${query}"
`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const filters = JSON.parse(response.text);

        res.json({
            success: true,
            filters
        });

    } catch (err) {
        console.error('AI NL Search Error:', err);
        res.status(500).json({ success: false, message: 'Failed to parse search query' });
    }
});

// POST /api/ai/chat — Real Estate Assistant Chatbot
router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'AI feature is not configured.' });
        }

        // Fetch top 5 recent published properties for basic context (RAG)
        const recentProperties = await Property.find({ status: 'published' })
            .sort('-createdAt')
            .limit(5)
            .select('title type propertyType price city bedrooms bathrooms');

        const contextStr = recentProperties.map(p =>
            `- ${p.title} (${p.propertyType} for ${p.type} in ${p.city}): $${p.price}, ${p.bedrooms} beds, ${p.bathrooms} baths`
        ).join('\n');

        const systemInstruction = `
You are a helpful and polite Real Estate AI Assistant for RealEstate Connect.
Use the following context of our newest property listings to help answer user questions. If they ask about properties we have, suggest from this list. If the user asks something completely unrelated to real estate, politely steer the conversation back.

Current Recent Listings Context:
${contextStr}
`;

        // Format history for Gemini SDK
        // Gemini expects: { role: 'user' | 'model', parts: [{ text: '...' }] }
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        formattedHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: formattedHistory,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        res.json({
            success: true,
            reply: response.text
        });

    } catch (err) {
        console.error('AI Chat Error:', err);
        res.status(500).json({ success: false, message: 'Failed to process chat message' });
    }
});

module.exports = router;
