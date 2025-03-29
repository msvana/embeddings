export function transform(
    X: number[][],
    nDims: number,
    perp: number = 5,
    nIter: number = 100,
): number[][] {
    const sigmas = findBestSigmas(X, perp);
    const affinities = calculateSymmetricAffinities(X, sigmas);
    let Y = initRandomProjection(X.length, nDims);
    let YPrev = structuredClone(Y);

    for (let i = 0; i < nIter; i++) {
        const gradient = calculateGradient(affinities, Y);
        const YNew = new Array(Y.length);

        for (let j = 0; j < Y.length; j++) {
            YNew[j] = new Array(Y[j].length);

            for (let k = 0; k < Y[j].length; k++) {
                YNew[j][k] = Y[j][k] + gradient[j][k] * 1e-4;
            }
        }

        YPrev = Y;
        Y = YNew;
    }

    return Y;
}

export function calculateSymmetricAffinities(X: number[][], sigmas: number[]) {
    const affinities = calculateAffinities(X, sigmas);
    const symmetricAffinities = new Array(X.length);

    for (let i = 0; i < X.length; i++) {
        symmetricAffinities[i] = new Array(X.length).fill(0);
    }

    for (let i = 0; i < X.length; i++) {
        for (let j = i + 1; j < X.length; j++) {
            const p = (affinities[i][j] + affinities[j][i]) / (2 * X.length);
            symmetricAffinities[i][j] = p;
            symmetricAffinities[j][i] = p;
        }
    }

    return symmetricAffinities;
}

export function calculateAffinities(X: number[][], sigmas: number[]): number[][] {
    const affinities = new Array(X.length);
    const affinitySums = new Array(X.length).fill(0);

    for (let i = 0; i < X.length; i++) {
        affinities[i] = new Array(X.length).fill(0);

        for (let j = 0; j < X.length; j++) {
            if (i === j) {
                continue;
            }

            const distance = euclideanDistanceSquared(X[i], X[j]);
            const affinity = Math.exp(-distance / (2 * sigmas[i] * sigmas[i]));
            affinities[i][j] = affinity;
            affinitySums[i] += affinity;
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
    const lowerBounds = new Array(X.length).fill(1e-3);
    const upperBounds = new Array(X.length).fill(calculateInitialUpperBound(X));
    const sigmas = new Array(X.length).fill((upperBounds[0] + lowerBounds[0]) / 2);

    for (let i = 0; i < sigmas.length; i++) {
        for (let j = 0; j < maxIterations; j++) {
            const affinities = calculateAffinities(X, sigmas);
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

export function initRandomProjection(nSamples: number, nDims: number): number[][] {
    const Y: number[][] = new Array(nSamples);

    for (let i = 0; i < nSamples; i++) {
        Y[i] = new Array(nDims);
        for (let j = 0; j < nDims; j++) {
            Y[i][j] = Math.random() / 1e2 - 5e-3;
        }
    }

    return Y;
}

export function calculateGradient(affinities: number[][], Y: number[][]): number[][] {
    const gradient = new Array(Y.length);
    const projectedAffinities = calculateProjectedAffinity(Y);

    for (let i = 0; i < Y.length; i++) {
        gradient[i] = new Array(Y[i].length).fill(0);

        for (let j = 0; j < Y.length; j++) {
            const coef =
                (affinities[i][j] - projectedAffinities[i][j]) *
                (1 + euclideanDistanceSquared(Y[i], Y[j]));

            for (let k = 0; k < Y[i].length; k++) {
                gradient[i][k] += 4 * coef * (Y[i][k] - Y[j][k]);
            }
        }
    }

    return gradient;
}

export function calculateProjectedAffinity(Y: number[][]): number[][] {
    const affinities = new Array(Y.length);
    const affinitySums = new Array(Y.length).fill(0);

    for (let i = 0; i < Y.length; i++) {
        affinities[i] = new Array(Y.length).fill(0);

        for (let j = 0; j < Y.length; j++) {
            if (i === j) {
                continue;
            }

            const distance = euclideanDistanceSquared(Y[i], Y[j]);
            const affinity = Math.pow(1 + distance, -1);
            affinities[i][j] = affinity;
            affinitySums[i] += affinity;
        }
    }

    for (let i = 0; i < Y.length; i++) {
        for (let j = 0; j < Y.length; j++) {
            affinities[i][j] /= affinitySums[i];
        }
    }

    return affinities;
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
