export function calculateAffinities(X: number[][], sigma: number): number[][] {
    const affinities = new Array(X.length);

    for (let i = 0; i < affinities.length; i++) {
        affinities[i] = new Array(X.length).fill(0);
    }

    const affinitySums = new Array(X.length).fill(0);

    for (let i = 0; i < X.length; i++) {
        for (let j = i + 1; j < X.length; j++) {
            const distance = euclideanDistanceSquared(X[i], X[j]);
            const affinity = Math.exp(-distance / (2 * sigma * sigma));
            affinities[i][j] = affinity;
            affinities[j][i] = affinity;
            affinitySums[i] += affinity;
            affinitySums[j] += affinity;
        }
    }

    for (let i = 0; i < X.length; i++) {
        for (let j = 0; j < X.length; j++) {
            affinities[i][j] /= affinitySums[i];
        }
    }

    return affinities;
}

export function findBestSigmas(X: number[][], perp: number, maxIterations: number = 50): number[] {
    const lowerBounds = new Array(X.length).fill(1e-6);
    const upperBounds = new Array(X.length).fill(calculateInitialUpperBound(X));
    const sigmas = new Array(X.length).fill((upperBounds[0] + lowerBounds[0]) / 2);

    for (let i = 0; i < sigmas.length; i++) {
        for (let j = 0; j < maxIterations; j++) {
            const affinities = calculateAffinities(X, sigmas[i]);
            const currentPerplexity = calculatePerplexity(affinities[i]);

            if (Math.abs(perp - currentPerplexity) <= 1e-6) {
                break;
            }

            if (currentPerplexity < perp) {
                lowerBounds[i] = sigmas[i];
            } else {
                upperBounds[i] = sigmas[i];
            }

            sigmas[i] = (upperBounds[i] + lowerBounds[i]) / 2;
        }
    }

    return sigmas;
}

export function calculatePerplexity(affinities: number[]): number {
    let H = 0;

    for (let i = 0; i < affinities.length; i++) {
        let P = affinities[i];
        H += P * Math.log2(P + 1e-10);
    }

    H = -H;

    const perplexity = Math.pow(2, H);
    return perplexity;
}

export function calculateInitialUpperBound(X: number[][]): number {
    let maxDistance = 0;
    let distance;

    for (let i = 0; i < X.length; i++) {
        for (let j = i + 1; j < X.length; j++) {
            distance = euclideanDistanceSquared(X[i], X[j]);
            if (maxDistance < distance) {
                maxDistance = distance;
            }
        }
    }

    const upperBound = Math.log(maxDistance + 1e-6) + 10;
    return upperBound;
}

function euclideanDistanceSquared(a: number[], b: number[]): number {
    let sum: number = 0;

    for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
    }

    return sum;
}
