export type ModelSelection = {
    name: string;
    apiKey: string;
};

export const MODELS_AVAILABLE = {
    Mistral: ["mistral-embed"],
    OpenAI: ["text-embedding-small", "text-embedding-large"],
};
