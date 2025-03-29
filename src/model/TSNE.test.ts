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
    ]

    const affinities = TSNE.calculateAffinities(X, 1)
    expect(affinities.length).to.equal(6);

    for(let i = 0; i < affinities.length; i++) {
        let sum = 0;

        for(let j = 0; j < affinities.length; j++) {
            sum += affinities[i][j];
        }

        expect(Math.abs(sum - 1)).to.lessThanOrEqual(1e-6);
    }

});
