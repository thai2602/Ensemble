import express from 'express';
import { getOpenAI } from '../lib/aiConfig.js';
import { searchDesignKnowledge } from '../lib/vectorSearch.js';

const router = express.Router();

// 1. TOOL DEFINITION
const designToolDefinition = {
    type: "function",
    function: {
        name: "update_website_design",
        description: "Update website design based on user request",
        parameters: {
            type: "object",
            properties: {
                colorPalette: {
                    type: "object",
                    properties: {
                        primary: { type: "string", description: "Main brand color (Hex code, e.g. #FF5733)" },
                        secondary: { type: "string", description: "Supporting color (Hex code)" },
                        background: { type: "string", description: "Page background color (Hex code)" },
                        text: { type: "string", description: "Main text color (High contrast with background)" },
                        accent: { type: "string", description: "Highlight/Action color (Hex code)" }
                    },
                    required: ["primary", "secondary", "background", "text", "accent"]
                },
                layoutMode: {
                    type: "string",
                    enum: ["standard", "split_screen", "bento_grid"],
                    description: "Overall layout mode"
                },
                heroContent: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "Catchy main title (max 10 words)" },
                        subtitle: { type: "string", description: "Short description" },
                        buttonText: { type: "string" }
                    }
                },
                activeSections: {
                    type: "array",
                    items: { type: "string", enum: ["products", "story", "album", "contact"] },
                    description: "Order of sections to display"
                },
                responseMessage: {
                    type: "string",
                    description: "A friendly, creative response to the user explaining the artistic choice of this palette in Vietnamese."
                }
            },
            required: ["colorPalette", "layoutMode", "activeSections", "responseMessage"]
        }
    }
};

// 2. API ENDPOINT
router.post('/design-chat', async (req, res) => {
    try {
        const { userRequest } = req.body;
        const aiConfig = getOpenAI();

        if (!aiConfig) {
            return res.json({
                type: 'message',
                message: "SYSTEM: GROQ_API_KEY or OPENAI_API_KEY is missing. Please configure backend .env"
            });
        }

        const { client, model } = aiConfig;

        // --- RAG RETRIEVAL ---
        const relevantContexts = await searchDesignKnowledge(userRequest);
        const contextString = relevantContexts.length > 0
            ? relevantContexts.map(c => `- ${c.text}`).join("\n")
            : "No specific design rules found. Use general creativity.";

        const completion = await client.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: `You are a professional UI/UX Designer. 
          Task: Listen to user ideas and use the 'update_website_design' tool to redesign the website with a custom COLOR PALETTE.
          
          *** DESIGN KNOWLEDGE BASE (Strictly Follow These Rules if Applicable) ***
          ${contextString}

          *** COLOR THEORY INSTRUCTIONS ***
          You are not limited to fixed themes. You must GENERATE a custom 'colorPalette' (Hex codes) that matches the user's vibe perfectly.
          - **Accessibility Rule**: Ensure 'text' color has HIGH CONTRAST against 'background'.
          - **Vietnamese Response**: Your 'responseMessage' must be in Vietnamese, explaining why you chose these colors.

          Component Definitions:
          - "contact": The Shop Info Card (Phone, Email, Address, Description). Often placed at the top.
          - "products": The Product Grid (Menu/Items). The core content.
          - "story": About Us / Brand Story section.
          - "album": Photo Gallery.

          Rules:
          1. **Layout Order**: The order of 'activeSections' EXACTLY determines the vertical order of components on the page.
          2. **DEFAULT LAYOUT**: Keep "contact" at the VERY TOP unless the user explicitly asks to move it. Standard order: ["contact", "products", "story", "album"].
          3. **TEXT CONTENT**: Do NOT provide 'heroContent' (title/subtitle) unless the user explicitly requests to change the TEXT. If the user only asks for style/color/layout changes, strictly OMIT 'heroContent' from the tool output to preserve the user's current text.
          4. **Response Message**: Explain your design choices creatively in Vietnamese.
          `
                },
                { role: "user", content: userRequest }
            ],
            tools: [designToolDefinition],
            tool_choice: "auto"
        });

        const message = completion.choices[0].message;

        // Check if AI called the tool
        if (message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            if (toolCall && toolCall.function && toolCall.function.name === "update_website_design") {
                const newDesignConfig = JSON.parse(toolCall.function.arguments);

                return res.json({
                    type: 'design_update',
                    message: newDesignConfig.responseMessage || "I've updated the design for you! What do you think?",
                    config: newDesignConfig
                });
            }
        }

        // Normal chat
        res.json({
            type: 'message',
            message: message.content
        });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

// New Endpoint: Get Design Suggestions from Knowledge Base
router.post('/suggest-styles', async (req, res) => {
    try {
        const { query } = req.body;
        // If query is provided, search. If not, maybe return random or everything?
        // For now, let's treat an empty query as "random"
        let suggestions = [];

        if (query && query.trim().length > 0) {
            suggestions = await searchDesignKnowledge(query);
        } else {
            // Random suggestion fallback: Pick 3 random items from searchDesignKnowledge logic 
            // Since searchDesignKnowledge relies on query, we can't easily use it for "random" without exporting the KB.
            // But we can just pass a generic term like "popular" or hack it.
            // Better: use searchDesignKnowledge with a generic broad term if specific implementation is hidden, 
            // OR finding meaningful way to get randoms.
            // For now let's pass "modern" as default or handle it in client.
            suggestions = await searchDesignKnowledge("modern colorful creative");
        }

        res.json({
            suggestions: suggestions.map(s => ({
                id: s.id,
                name: s.id.replace('_', ' ').toUpperCase(),
                description: s.text,
                keywords: s.keywords
            }))
        });

    } catch (error) {
        console.error("Suggestion Error:", error);
        res.status(500).json({ error: "Failed to get suggestions" });
    }
});

export default router;
