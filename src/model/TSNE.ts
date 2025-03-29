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

function euclideanDistanceSquared(a: number[], b: number[]): number {
    let sum: number = 0;

    for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
    }

    return sum;
}
