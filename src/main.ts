import type { Ref } from "vue";
import { createApp, ref, watch } from "vue";
import { AuthenticationError, cosineSimilarity, mistralEmbeddings } from "./embeddings";
import { plotEmbeddings } from "./plot";

createApp({
    setup() {
        const texts: Ref<{ text: string }[]> = ref([{ text: "" }]);
        const distances: Ref<{ distance: number }[]> = ref([{ distance: 0 }]);
        const reference: Ref<number> = ref(0);
        const apiKey: Ref<string> = ref("");
        const error: Ref<string> = ref("");

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
            { deep: true }
        );

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
                const embeddings = await mistralEmbeddings(
                    textsFiltered.map((t) => t.text),
                    apiKey.value
                );

                const currentReference = embeddings[reference.value];

                distances.value = embeddings.map((e: number[]) => {
                    return { distance: cosineSimilarity(currentReference, e) };
                });

                distances.value.push({ distance: 0 });
                plotEmbeddings(
                    textsFiltered.map((t) => t.text),
                    embeddings,
                    "plot",
                    reference.value
                );
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
            apiKey,
            distances,
            reference,
            error,

            getEmbeddings,
        };
    },
}).mount("#app");
