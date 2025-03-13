import type { Ref } from "vue";
import { createApp, ref, watch } from "vue";
import { AuthenticationError, cosineSimilarity, mistralEmbeddings, openaiEmbeddings } from "./embeddings";
import { plotEmbeddings } from "./plot";

createApp({
    setup() {
        const texts: Ref<{ text: string }[]> = ref([{ text: "" }]);
        const visualized: Ref<boolean> = ref(false);
        const distances: Ref<{ distance: number }[]> = ref([{ distance: 0 }]);
        const reference: Ref<number> = ref(0);
        const apiKey: Ref<string> = ref("");
        const error: Ref<string> = ref("");
        const embeddingModel: Ref<string> = ref("mistral-embed");

        watch(
            texts,
            async (newTexts) => {
                if (newTexts[newTexts.length - 1].text != "") {
                    newTexts.push({
                        text: "",
                    });
                }

                if (distances.value.length < newTexts.length) {
                    distances.value.push({ distance: 0 });
                }
            },
            { deep: true },
        );

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

        async function getEmbeddings() {
            if (apiKey.value == "") {
                error.value = "API key is required!";
                return;
            }

            error.value = "";
            const textsFiltered = texts.value.slice(0, -1);

            if (textsFiltered.length < 2) {
                return;
            }

            try {
                const textsClean = textsFiltered.map((t) => t.text);
                let embeddings;

                if (embeddingModel.value.startsWith("openai")) {
                    embeddings = await openaiEmbeddings(
                        textsClean,
                        apiKey.value,
                        embeddingModel.value.replace("openai-", ""),
                    );
                } else {
                    embeddings = await mistralEmbeddings(textsClean, apiKey.value);
                }

                const currentReference = embeddings[reference.value];

                distances.value = embeddings.map((e: number[]) => {
                    return { distance: cosineSimilarity(currentReference, e) };
                });

                distances.value.push({ distance: 0 });
                plotEmbeddings(
                    textsFiltered.map((t) => t.text),
                    embeddings,
                    "plot",
                    reference.value,
                );
                visualized.value = true;
            } catch (e) {
                if (e instanceof AuthenticationError) {
                    error.value = "Invalid API key!";
                    return;
                }

                throw e;
            }
        }

        return {
            texts,
            embeddingModel,
            apiKey,
            distances,
            reference,
            error,
            visualized,

            getEmbeddings,
            deleteTextIfEmpty,
        };
    },
}).mount("#app");
