import type { ChartItem } from "chart.js";
import Chart from "chart.js/auto";
import { PCA } from "ml-pca";
import * as TSNE from "@/model/TSNE";

const charts: {[key: string]: Chart} = {}

export function plotEmbeddings(
    texts: string[],
    embeddings: number[][],
    containerId: string,
    reference: number,
) {
    if(!(containerId in charts)) {
        charts[containerId] = initChart(containerId);
    } 

    const chart = charts[containerId];
    // const pca = new PCA(embeddings);
    // const embeddingsPca = pca.predict(embeddings);
    const embeddingsPca = TSNE.transform(embeddings, 2);
    console.log(embeddingsPca);

    const colors = new Array(texts.length).fill("grey");
    colors[reference] = "red";

    const data = [];

    for (let r = 0; r < embeddingsPca.length; r++) {
        data.push({ x: embeddingsPca[r][0], y: embeddingsPca[r][1] });
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
