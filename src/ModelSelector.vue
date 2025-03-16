<template>
    <section class="box">
        <div class="columns">
            <div class="column is-one-quarter-tablet">
                <div class="field">
                    <label for="model" class="label">Select model:</label>
                    <div class="select is-fullwidth" id="model">
                        <select v-model="modelA.name" @change="modelsUpdated">
                            <optgroup
                                v-for="(models, provider) in MODELS_AVAILABLE"
                                :label="provider"
                            >
                                <option v-for="model in models" :value="provider + ':' + model">
                                    {{ model }}
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
                        v-model="modelA.apiKey"
                        @change="modelsUpdated"
                    />
                </div>
            </div>
        </div>

        <p class="has-text-centered">compare with (optional)</p>

        <div class="columns">
            <div class="column is-one-quarter-tablet">
                <div class="field">
                    <label for="model" class="label">Select model:</label>
                    <div class="select is-fullwidth" id="model">
                        <select v-model="modelB.name" @change="modelsUpdated">
                            <optgroup
                                v-for="(models, provider) in MODELS_AVAILABLE"
                                :label="provider"
                            >
                                <option v-for="model in models" :value="provider + ':' + model">
                                    {{ model }}
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
                        v-model="modelB.apiKey"
                        @change="modelsUpdated"
                    />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted } from "vue";
import { MODELS_AVAILABLE } from "@/Models";
import type { ModelSelection } from "@/Models";

const modelA = ref<ModelSelection>({ name: "Mistral:mistral-embed", apiKey: "" });
const modelB = ref<ModelSelection>({ name: "", apiKey: "" });

const emit = defineEmits(["models-updated"]);

function modelsUpdated() {
    const models = [modelA.value];

    if (modelB.value?.name) {
        models.push(modelB.value);
    }

    emit("models-updated", models);
}

onMounted(() => {
    modelsUpdated();
});
</script>
