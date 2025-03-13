export type Embedding = {
    embedding: number[];
};

export class AuthenticationError extends Error {}

export async function mistralEmbeddings(texts: string[], apiKey: string): Promise<number[][]> {
    const response = await fetch("https://api.mistral.ai/v1/embeddings", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            input: texts,
            model: "mistral-embed",
            encoding_format: "float",
        }),
    });

    if (response.status === 401) {
        throw new AuthenticationError("Invalid API key");
    }

    const result = await response.json();
    const embeddings = result.data.map((e: Embedding) => e.embedding);
    return embeddings;
}

export async function openaiEmbeddings(
    texts: string[],
    apiKey: string,
    model: string,
): Promise<number[][]> {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            input: texts,
            model: model,
        }),
    });

    if (response.status === 401) {
        throw new AuthenticationError("Invalid API key");
    }

    const result = await response.json();
    const embeddings = result.data.map((e: Embedding) => e.embedding);
    return embeddings;
}

export function cosineSimilarity(a: number[], b: number[]): number {
    return dotProduct(a, b) / (norm(a) * norm(b));
}

function dotProduct(a: number[], b: number[]): number {
    let dotProduct = 0.0;

    for (const i in a) {
        dotProduct += a[i] * b[i];
    }

    return dotProduct;
}

function norm(vec: number[]): number {
    let sumOfSquares = 0.0;

    for (const dim of vec) {
        sumOfSquares += dim * dim;
    }

    return Math.sqrt(sumOfSquares);
}
