import type { ChartItem } from "chart.js";
import Chart from "chart.js/auto";
import { PCA } from "ml-pca";
import { TSNE } from "msvana-tsne";

const charts: { [key: string]: Chart } = {};

export function plotEmbeddings(
    texts: string[],
    embeddings: number[][],
    containerId: string,
    reference: number,
    visualization: "pca" | "tsne",
) {
    if (!(containerId in charts)) {
        charts[containerId] = initChart(containerId);
    }

    const chart = charts[containerId];
    const data = transformations[visualization](embeddings);
    const colors = new Array(texts.length).fill("grey");
    colors[reference] = "red";

    chart.data = {
        datasets: [
            {
                data: data,
                backgroundColor: colors,
            },
        ],
        labels: texts.map((t) => t.substring(0, 35)),
    };
    chart.update();
}

function initChart(containerId: string): Chart {
    const ctx = document.getElementById(containerId) as ChartItem;

    return new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [
                {
                    data: [],
                    backgroundColor: "red",
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
            },
            elements: {
                point: {
                    radius: 8,
                },
            },
            scales: {
                x: {
                    ticks: {
                        display: false,
                    },
                },
                y: {
                    ticks: {
                        display: false,
                    },
                },
            },
            maintainAspectRatio: false,
        },
    });
}

type TransformationResults = { x: number; y: number }[];

const transformations = {
    pca: function (embeddings: number[][]): TransformationResults {
        const pca = new PCA(embeddings);
        const embeddingsPca = pca.predict(embeddings);

        const data = [];

        for (let r = 0; r < embeddingsPca.rows; r++) {
            data.push({ x: embeddingsPca.getRow(r)[0], y: embeddingsPca.getRow(r)[1] });
        }

        return data;
    },
    tsne: function (embeddings: number[][]): TransformationResults {
        const tsne = new TSNE({ learningRate: 1 });
        const transformed = tsne.transform(embeddings);

        const data = [];

        for (let r = 0; r < transformed.length; r++) {
            data.push({ x: transformed[r][0], y: transformed[r][1] });
        }

        return data;
    },
};
