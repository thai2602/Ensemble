import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export const getOpenAI = () => {
    return {
        client: new OpenAI({
            baseURL: "http://127.0.0.1:1234/v1",
            apiKey: "lm-studio"
        }),
        model: "google/gemma-3-4b",
        embeddingModel: null
    };
};
