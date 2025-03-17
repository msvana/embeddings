export type ModelSelection = {
    name: string;
    apiKey: string;
};

export const MODELS_AVAILABLE = {
    Mistral: ["mistral-embed"],
    OpenAI: ["text-embedding-3-small", "text-embedding-3-large"],
};
