import { getOpenAI } from './aiConfig.js';
// Removed static JSON import to support older Node versions
// import designKnowledge from '../data/designKnowledge.json' assert { type: "json" }; 
// Standard import for JSON in newer node requires assertion, but might fail in some setups. Safer to use fs.readFileSync.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Knowledge Base Safely
let knowledgeBase = [];
try {
    const kbPath = path.join(__dirname, '../data/designKnowledge.json');
    const rawData = fs.readFileSync(kbPath, 'utf8');
    knowledgeBase = JSON.parse(rawData);
} catch (e) {
    console.error("Failed to load designKnowledge.json", e);
}

// In-memory cache for embeddings to avoid re-fetching
// structure: { [id]: [vector] }
const embeddingCache = {};

// Math Helper: Cosine Similarity
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    return (magnitudeA && magnitudeB) ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

// Math Helper: Keyword Overlap Score
function keywordScore(query, keywordsStr) {
    if (!keywordsStr) return 0;
    const queryTokens = query.toLowerCase().split(/\s+/);
    const targetTokens = keywordsStr.toLowerCase().split(/[\s,]+/);

    let score = 0;
    queryTokens.forEach(q => {
        if (targetTokens.includes(q)) score += 1;
    });
    return score;
}

export async function searchDesignKnowledge(userQuery) {
    const { client, embeddingModel } = getOpenAI() || {};

    // Use keywords if no AI client
    if (!client) {
        console.log("Vector search unavailable (no API key), using keyword fallback.");
        return keywordSearch(userQuery);
    }

    try {
        // STRATEGY 1: Vector Search (if embeddingModel is available)
        if (embeddingModel) {
            // 1. Context Embeddings (Lazy Load)
            for (const item of knowledgeBase) {
                if (!embeddingCache[item.id]) {
                    const res = await client.embeddings.create({
                        model: embeddingModel,
                        input: item.text + " " + item.keywords,
                    });
                    embeddingCache[item.id] = res.data[0].embedding;
                }
            }

            // 2. Query Embedding
            const queryRes = await client.embeddings.create({
                model: embeddingModel,
                input: userQuery,
            });
            const queryVector = queryRes.data[0].embedding;

            // 3. Rank
            const scoredItems = knowledgeBase.map(item => ({
                ...item,
                score: cosineSimilarity(queryVector, embeddingCache[item.id])
            }));

            // Return Top 3 objects
            return scoredItems
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);
        }

        // STRATEGY 2: Keyword Fallback (if using Groq or no embedding model)
        console.log("Vector search unavailable (no embedding model), using keyword fallback.");
        return keywordSearch(userQuery);

    } catch (error) {
        console.error("Vector Search Error:", error);
        return []; // Fail safe
    }
}

function keywordSearch(userQuery) {
    const scoredItems = knowledgeBase.map(item => ({
        ...item,
        score: keywordScore(userQuery, item.keywords)
    }));

    return scoredItems
        .sort((a, b) => b.score - a.score)
        .filter(item => item.score > 0)
        .slice(0, 3);
}
