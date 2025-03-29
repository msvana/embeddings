import { test, expect } from "vitest";
import * as TSNE from "./TSNE.ts";

test("calculates affinities properly", () => {
    const X: number[][] = [
        [1, 2, 3],
        [2, 3, 1],
        [2, 2, 2],
        [1, 2, 1],
        [3, 2, 3],
        [3, 0, 3],
    ];

    const affinities = TSNE.calculateAffinities(X, 1);
    expect(affinities.length).to.equal(6);

    for (let i = 0; i < affinities.length; i++) {
        let sum = 0;

        for (let j = 0; j < affinities.length; j++) {
            sum += affinities[i][j];
        }

        expect(Math.abs(sum - 1)).to.lessThanOrEqual(1e-6);
    }
});

test("calculates perplexity correctly", () => {
    const affinities = [
        [0, 0.4, 0.3, 0.3],
        [0.2, 0, 0.5, 0.3],
        [0.1, 0.3, 0, 0.6],
        [0.2, 0.4, 0, 0.4],
    ];

    const perplexity = TSNE.calculatePerplexity(affinities[0]);
    console.log(perplexity);
    expect(Math.abs(perplexity - 2.971)).to.lessThan(1e-4);
});

test("calculates sigma upper bound properly", () => {
    const X = [
        [0, 1],
        [0, 2],
        [0, 4],
    ];

    const upperBound = TSNE.calculateInitialUpperBound(X);
    const expectedUpperBound = Math.log(9) + 10;
    expect(Math.abs(upperBound - expectedUpperBound)).to.lessThan(1e-6);
});

test("finds best sigmas correctly", () => {
    const X: number[][] = [
        [1, 2, 3],
        [2, 3, 1],
        [2, 2, 2],
        [1, 2, 1],
        [3, 2, 3],
        [3, 0, 3],
    ];

    const sigmas = TSNE.findBestSigmas(X, 3);

    for (let i = 0; i < X.length; i++) {
        expect(sigmas[i]).to.lessThan(2);
        expect(sigmas[i]).to.greaterThan(0);
    }
});
