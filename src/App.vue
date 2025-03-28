<template>
    <ModelSelector @models-updated="onUpdateModels" />

    <section class="notification is-danger is-light has-text-centered" v-if="error">
        <p>{{ error }}</p>
    </section>

    <section class="columns">
        <div class="column is-half-tablet">
            <div class="box">
                <h2 class="is-size-5 has-text-centered">Input texts</h2>

                <div class="field mt-3" v-for="(text, idx) in texts">
                    <label class="is-pulled-right radio">
                        <input
                            type="radio"
                            id="reference"
                            name="reference"
                            v-model="reference"
                            :value="idx"
                            @change="updateEmbeddings"
                        />
                        is reference text
                    </label>

                    <label for="input-text" class="label">Text {{ idx + 1 }}:</label>
                    <textarea
                        class="textarea"
                        id="input-text"
                        placeholder="Type your text here"
                        rows="2"
                        @change="
                            deleteTextIfEmpty(idx);
                            updateEmbeddings();
                        "
                        v-model="text.text"
                    ></textarea>

                    <p v-if="reference !== idx && embeddingsResultsA.distances.length > idx">
                        Scores:<br>
                        <span class="tag is-primary is-medium mb-1">
                            {{ modelsSelected[0].name }}:&nbsp;
                            <b>{{ embeddingsResultsA.distances[idx].toFixed(3) }}</b>
                        </span>
                        &nbsp;
                        <span class="tag is-info is-medium mb-1" v-if="embeddingsResultsB.distances.length > idx">
                            {{ modelsSelected[1].name }}:&nbsp;
                            <b>{{ embeddingsResultsB.distances[idx].toFixed(3) }}</b>
                        </span>
                    </p>
                </div>
            </div>
        </div>

        <div class="column is-half-tablet">
            <div class="box">
                <h2 class="is-size-5 has-text-centered">Visualization</h2>
                <h3 class="is-size-6 has-text-centered mt-2" v-if="modelsSelected.length > 0">
                    {{ modelsSelected[0].name }}
                </h3>
                <div
                    style="height: 25rem"
                    class="is-relative"
                    v-show="embeddingsResultsA.visualized"
                >
                    <canvas id="plot-a"></canvas>
                </div>
                <h3 class="is-size-6 has-text-centered mt-3" v-if="modelsSelected.length > 1">
                    {{ modelsSelected[1].name }}
                </h3>
                <div
                    style="height: 25rem"
                    class="is-relative"
                    v-show="embeddingsResultsB.visualized"
                >
                    <canvas id="plot-b"></canvas>
                </div>
                <p
                    class="m-6 has-text-centered has-text-grey"
                    v-if="!embeddingsResultsA.visualized"
                >
                    Add at least two texts to see the visualization
                </p>
                <p></p>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { ref, watch } from "vue";

import ModelSelector from "@/ModelSelector.vue";
import * as Embeddings from "@/embeddings";
import { plotEmbeddings } from "@/Plot";
import type { ModelSelection } from "@/Models";

type EmbeddingResults = {
    visualized: boolean;
    distances: number[];
    embeddings: number[][];
    plotContainerId: string;
};

class InvalidApiKeyError extends Error {}

const modelsSelected: Ref<ModelSelection[]> = ref([]);
const texts: Ref<{ text: string }[]> = ref([{ text: "" }]);
const reference: Ref<number> = ref(0);
const error: Ref<string> = ref("");

const embeddingsResultsA: Ref<EmbeddingResults> = ref({
    visualized: false,
    distances: [0],
    embeddings: [],
    plotContainerId: "plot-a",
});

const embeddingsResultsB: Ref<EmbeddingResults> = ref({
    visualized: false,
    distances: [0],
    embeddings: [],
    plotContainerId: "plot-b",
});

let firstModelUpdate: boolean = true;

watch(texts, ensureEmptyTextAtEnd, { deep: true });

function onUpdateModels(models: ModelSelection[]) {
    console.log(models);

    modelsSelected.value = models;

    if (modelsSelected.value.length == 1) {
        embeddingsResultsB.value.visualized = false;
        embeddingsResultsB.value.embeddings = [];
        embeddingsResultsB.value.distances = [0];
    }

    if (!firstModelUpdate) {
        updateEmbeddings();
    }

    firstModelUpdate = false;
}

function ensureEmptyTextAtEnd(newTexts: { text: string }[]) {
    if (newTexts[newTexts.length - 1].text != "") {
        newTexts.push({
            text: "",
        });
    }
}

function deleteTextIfEmpty(index: number) {
    if (index == texts.value.length - 1) {
        return;
    }

    if (texts.value[index].text == "" && texts.value.length > 1) {
        texts.value.splice(index, 1);
    }

    if (reference.value == index) {
        reference.value = 0;
    }
}

function getCleanTexts(): string[] {
    const textsFiltered = texts.value.slice(0, -1);
    const textsClean = textsFiltered.map((t) => t.text);
    return textsClean;
}

async function updateEmbeddings() {
    error.value = "";
    embeddingsResultsA.value.visualized = false;
    embeddingsResultsB.value.visualized = false;

    try {
        await updateEmbeddingsForModel(modelsSelected.value[0], embeddingsResultsA.value);

        if (modelsSelected.value.length == 2) {
            await updateEmbeddingsForModel(modelsSelected.value[1], embeddingsResultsB.value);
        }
    } catch (e) {
        if (e instanceof InvalidApiKeyError) {
            return;
        }

        if (e instanceof Embeddings.AuthenticationError) {
            error.value = "One or more API keys are invalid";
        }

        throw e;
    }
}

async function updateEmbeddingsForModel(modelSelection: ModelSelection, results: EmbeddingResults) {
    const modelNameSplit = modelSelection.name.split(":");
    const embeddingProvider = modelNameSplit[0];
    const embeddingModel = modelNameSplit[1];

    if (modelSelection.apiKey === "") {
        error.value = "API key is required!";
        throw new InvalidApiKeyError();
    }

    const texts = getCleanTexts();

    if (texts.length == 0) {
        return;
    }

    switch (embeddingProvider) {
        case "OpenAI":
            results.embeddings = await Embeddings.openaiEmbeddings(
                texts,
                modelSelection.apiKey,
                embeddingModel
            );
            break;
        case "Mistral":
            results.embeddings = await Embeddings.mistralEmbeddings(texts, modelSelection.apiKey);
            break;
    }

    const currentReference = results.embeddings[reference.value];
    results.distances = results.embeddings.map((e: number[]) => {
        return Embeddings.cosineSimilarity(currentReference, e);
    });

    console.log(texts.length);

    if (texts.length >= 2) {
        plotEmbeddings(texts, results.embeddings, results.plotContainerId, reference.value);
        results.visualized = true;
    }
}
</script>
