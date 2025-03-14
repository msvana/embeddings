import type { ChartItem } from "chart.js";
import Chart from "chart.js/auto";
import { PCA } from "ml-pca";

let chart: Chart | null = null;

export function plotEmbeddings(
    texts: string[],
    embeddings: number[][],
    containerId: string,
    reference: number,
) {
    if (chart === null) {
        chart = initChart(containerId);
    }

    const pca = new PCA(embeddings);
    const embeddingsPca = pca.predict(embeddings);

    const colors = new Array(texts.length).fill("grey");
    colors[reference] = "red";

    const data = [];

    for (let r = 0; r < embeddingsPca.rows; r++) {
        const row = embeddingsPca.getRow(r);
        data.push({ x: row[0], y: row[1] });
    }

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
