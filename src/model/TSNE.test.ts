import { test, expect } from "vitest";
import * as TSNE from "./TSNE.ts";

const X: number[][] = [
    [1, 2, 3],
    [2, 3, 1],
    [2, 2, 2],
    [1, 2, 1],
    [3, 2, 3],
    [3, 0, 3],
];

test("calculates affinities properly", () => {
    const sigmas = new Array(X.length).fill(1);
    const affinities = TSNE.calculateAffinities(X, sigmas);
    expect(affinities.length).to.equal(6);

    for (let i = 0; i < affinities.length; i++) {
        let sum = 0;

        for (let j = 0; j < affinities.length; j++) {
            sum += affinities[i][j];
        }

        expect(Math.abs(sum - 1)).to.lessThanOrEqual(1e-6);
    }
});

test("calculates symmetric affinities properly", () => {
    const sigmas = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
    const symmetricAffinities = TSNE.calculateSymmetricAffinities(X, sigmas);

    for (let i = 0; i < X.length; i++) {
        expect(symmetricAffinities[i][i]).to.equal(0);

        for (let j = i; j < X.length; j++) {
            expect(symmetricAffinities[i][j]).to.equal(symmetricAffinities[j][i]);
        }
    }
});

test("calculates projected affinities properly", () => {
    const affinities = TSNE.calculateProjectedAffinity(X);
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
    const sigmas = TSNE.findBestSigmas(X, 3);

    for (let i = 0; i < X.length; i++) {
        expect(sigmas[i]).to.lessThan(2);
        expect(sigmas[i]).to.greaterThan(0);
    }
});

test("initializes random solution properly", () => {
    const Y = TSNE.initRandomProjection(10, 2);

    expect(Y.length).to.equal(10);

    for (const y of Y) {
        expect(y.length).to.equal(2);
        expect(Math.abs(y[0])).to.lessThanOrEqual(1e-2);
        expect(Math.abs(y[1])).to.lessThanOrEqual(1e-2);
    }
});

test("entire transformation works", () => {
    const Y = TSNE.transform(X, 2, 4);

    for (const y of Y) {
        let row = "";

        for (const n of y) {
            row += `${n.toFixed(3)} `;
        }

        // console.log(row);
    }
});
