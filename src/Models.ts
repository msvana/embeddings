type ModelOption = {
    name: string;
    apiKeyRequired: boolean;
};

export type ModelOptions = {
    [key: string]: ModelOption[];
};

export type ModelSelection = {
    name: string;
    apiKey: string;
    apiKeyRequired: boolean;
};

export const MODELS_AVAILABLE: ModelOptions = {
    Mistral: [{ name: "mistral-embed", apiKeyRequired: true }],
    OpenAI: [
        { name: "text-embedding-3-small", apiKeyRequired: true },
        { name: "text-embedding-3-large", apiKeyRequired: true },
    ],
    SentenceTransformers: [{ name: "all-MiniLM-L6-v2", apiKeyRequired: false }],
};
