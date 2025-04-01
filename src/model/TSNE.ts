export function transform(
    X: number[][],
    nDims: number,
    perp: number = 3,
    nIter: number = 1000,
): number[][] {
    const sigmas = findBestSigmas(X, perp);
    const affinities = calculateSymmetricAffinities(X, sigmas);

    let momentum: number;
    let Y = initRandomProjection(X.length, nDims);
    let YPrev = structuredClone(Y);

    for (let i = 0; i < nIter; i++) {
        momentum = getMomentum(i, nIter);
        const gradient = calculateGradient(affinities, Y);
        const YNew = new Array(Y.length);

        for (let j = 0; j < Y.length; j++) {
            YNew[j] = new Array(Y[j].length);

            for (let k = 0; k < Y[j].length; k++) {
                YNew[j][k] =
                    Y[j][k] + gradient[j * nDims + k] * 1 + momentum * (Y[j][k] - YPrev[j][k]);
            }
        }

        YPrev = Y;
        Y = YNew;
    }

    return Y;
}

export function calculateSymmetricAffinities(X: number[][], sigmas: number[]) {
    const distances = getPairwiseDistances(X);
    const affinities = calculateAffinities(distances, sigmas);
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

export function calculateAffinities(distances: number[], sigmas: number[]): number[][] {
    const n = Math.trunc(Math.sqrt(distances.length));
    const affinities = new Array(n);
    const affinitySums = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        affinities[i] = new Array(n).fill(0);

        for (let j = 0; j < n; j++) {
            const affinity = Math.exp(-distances[n * i + j] / (2 * sigmas[i] * sigmas[i]));
            affinities[i][j] = affinity;
            affinitySums[i] += affinity;
        }
    }

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            affinities[i][j] /= affinitySums[i];
        }
    }

    return affinities;
}

export function findBestSigmas(X: number[][], perp: number, maxIterations: number = 50): number[] {
    const lowerBounds = new Array(X.length).fill(1e-3);
    const upperBounds = new Array(X.length).fill(calculateInitialUpperBound(X));
    const sigmas = new Array(X.length).fill((upperBounds[0] + lowerBounds[0]) / 2);
    const distances = getPairwiseDistances(X);

    for (let i = 0; i < sigmas.length; i++) {
        for (let j = 0; j < maxIterations; j++) {
            const affinities = calculateAffinities(distances, sigmas);
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
            Y[i][j] = Math.random() / 1e1 - 5e-2;
        }
    }

    return Y;
}

export function calculateGradient(affinities: number[][], Y: number[][]): number[] {
    const nDim = Y[0].length;
    const gradient = new Array(Y.length * nDim).fill(0);
    const projectedAffinities = calculateProjectedAffinity(Y);

    for (let i = 0; i < Y.length; i++) {
        for (let j = 0; j < Y.length; j++) {
            const coef =
                (affinities[i][j] - projectedAffinities[i * Y.length + j]) *
                Math.pow(1 + euclideanDistanceSquared(Y[i], Y[j]), -1);

            for (let k = 0; k < Y[i].length; k++) {
                gradient[i * nDim + k] += 4 * coef * (Y[i][k] - Y[j][k]);
            }
        }
    }

    return gradient;
}

export function calculateProjectedAffinity(Y: number[][]): number[] {
    const n = Y.length;
    const affinities = new Array(n * n).fill(0);
    const affinitySums = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (i === j) {
                continue;
            }

            const distance = euclideanDistanceSquared(Y[i], Y[j]);
            const affinity = Math.pow(1 + distance, -1);
            affinities[i * n + j] = affinity;
            affinities[j * n + i] = affinity;
            affinitySums[i] += affinity;
            affinitySums[j] += affinity;
        }
    }

    for (let i = 0; i < Y.length; i++) {
        for (let j = 0; j < Y.length; j++) {
            affinities[i * n + j] /= affinitySums[i];
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

function getPairwiseDistances(X: number[][]): number[] {
    const distances = new Array(X.length * X.length);
    let distance;

    for (let i = 0; i < X.length; i++) {
        for (let j = i; j < X.length; j++) {
            if (i === j) {
                distances[X.length * i + j] = 0;
            }

            distance = euclideanDistanceSquared(X[i], X[j]);
            distances[X.length * i + j] = distance;
            distances[X.length * j + i] = distance;
        }
    }

    return distances;
}

function euclideanDistanceSquared(a: number[], b: number[]): number {
    let sum: number = 0;
    let pointDistance: number = 0;

    for (let i = 0; i < a.length; i++) {
        pointDistance = a[i] - b[i];
        sum += pointDistance * pointDistance;
    }

    return sum;
}

function getMomentum(iterCurr: number, iterMax: number): number {
    const momentumStart = 0.5;
    const momentumEnd = 0.8;
    const momentum = momentumStart + (momentumEnd - momentumStart) * (iterCurr / iterMax);
    return momentum;
}

function getCost(P: number[][], Y: number[][]): number {
    const Q = calculateProjectedAffinity(Y);
    let cost = 0;

    for (let i = 0; i < Y.length; i++) {
        for (let j = 0; j < Y.length; j++) {
            if (i === j) {
                continue;
            }
            cost += P[i][j] * Math.log(P[i][j] / Q[i][j]);
        }
    }

    return cost;
}
