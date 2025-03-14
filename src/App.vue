<template>
    <section class="box">
        <div class="columns">
            <div class="column is-narrow-tablet">
                <div class="field">
                    <label for="model" class="label">Select model:</label>
                    <div class="select is-fullwidth" id="model">
                        <select v-model="embeddingModel" @change="getEmbeddings">
                            <optgroup label="Mistral">
                                <option value="mistral-embed">mistral-embed</option>
                            </optgroup>
                            <optgroup label="OpenAI">
                                <option value="openai-text-embedding-3-small">
                                    text-embedding-3-small
                                </option>
                                <option value="openai-text-embedding-3-large">
                                    text-embedding-3-large
                                </option>
                            </optgroup>
                        </select>
                    </div>
                </div>
            </div>

            <div class="column">
                <div class="field">
                    <label for="api-key" class="label">API Key:</label>
                    <input
                        type="password"
                        class="input"
                        id="api-key"
                        placeholder="Provide your API key"
                        v-model="apiKey"
                        @change="getEmbeddings"
                    />
                </div>
            </div>
        </div>
    </section>

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
                            getEmbeddings();
                        "
                        v-model="text.text"
                    ></textarea>

                    <p v-if="reference !== idx && text.text !== ''">
                        Score: <strong>{{ distances[idx].distance }}</strong>
                    </p>
                </div>
            </div>
        </div>

        <div class="column is-half-tablet">
            <div class="box">
                <h2 class="is-size-5 has-text-centered">Visualization</h2>
                <div style="height: 25rem" class="is-relative" v-show=visualized>
                    <canvas id="plot"></canvas>
                </div>
                <p class="m-6 has-text-centered has-text-grey" v-if="!visualized">
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

import * as Embeddings from "./embeddings";
import { plotEmbeddings } from "./plot";

const texts: Ref<{ text: string }[]> = ref([{ text: "" }]);
const visualized: Ref<boolean> = ref(false);
const distances: Ref<{ distance: number }[]> = ref([{ distance: 0 }]);
const reference: Ref<number> = ref(0);
const apiKey: Ref<string> = ref("");
const error: Ref<string> = ref("");
const embeddingModel: Ref<string> = ref("mistral-embed");

watch(texts, ensureEmptyTextAtEnd, { deep: true });

function ensureEmptyTextAtEnd(newTexts: { text: string }[]) {
    if (newTexts[newTexts.length - 1].text != "") {
        newTexts.push({
            text: "",
        });
    }

    if (distances.value.length < newTexts.length) {
        distances.value.push({ distance: 0 });
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

async function getEmbeddings() {
    if (apiKey.value === "") {
        error.value = "API key is required!";
        return;
    }

    error.value = "";
    const textsClean = getCleanTexts();

    try {
        let embeddings;

        if (embeddingModel.value.startsWith("openai")) {
            embeddings = await Embeddings.openaiEmbeddings(
                textsClean,
                apiKey.value,
                embeddingModel.value.replace("openai-", ""),
            );
        } else {
            embeddings = await Embeddings.mistralEmbeddings(textsClean, apiKey.value);
        }

        const currentReference = embeddings[reference.value];

        distances.value = embeddings.map((e: number[]) => {
            return { distance: Embeddings.cosineSimilarity(currentReference, e) };
        });

        distances.value.push({ distance: 0 });
        plotEmbeddings(textsClean, embeddings, "plot", reference.value);
        visualized.value = true;
    } catch (e) {
        if (e instanceof Embeddings.AuthenticationError) {
            error.value = "Invalid API key!";
            return;
        }

        throw e;
    }
}
</script>
