import { PCA } from "ml-pca";
import Plotly from "plotly.js-basic-dist-min";

export function plotEmbeddings(
    texts: string[],
    embeddings: number[][],
    containerId: string,
    reference: number
) {
    const pca = new PCA(embeddings);
    const embeddingsPca = pca.predict(embeddings);

    const colors = new Array(texts.length).fill(0);
    colors[reference] = 1;

    const trace: Plotly.Data = {
        x: embeddingsPca.getColumn(0),
        y: embeddingsPca.getColumn(1),
        mode: "markers",
        type: "scatter",
        marker: {
            size: 15,
            color: colors,
        },
        text: texts.map((t) => t.substring(0, 35)),
    };

    Plotly.react(
        containerId,
        [trace],
        {
            showlegend: false,
            margin: {
                b: 0,
                t: 0,
                l: 0,
                r: 0,
            },
        },
        {
            displayModeBar: false,
            frameMargins: 0,
            responsive: true,
        }
    );
}
