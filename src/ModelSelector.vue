<template>
    <section class="box">
        <div class="columns">
            <div class="column is-one-quarter-tablet">
                <div class="field">
                    <label for="model" class="label">Select model:</label>
                    <div class="select is-fullwidth" id="model">
                        <select v-model="modelIdA" @change="modelSelected">
                            <optgroup
                                v-for="(models, provider) in MODELS_AVAILABLE"
                                :label="provider.toString()">
                                <option v-for="(model, id) in models" :value="provider + ':' + id">
                                    {{ model.name }}
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
                        @change="modelUpdated"
                        :disabled="!modelA.apiKeyRequired" />
                </div>
            </div>
        </div>

        <p class="has-text-centered">compare with (optional)</p>

        <div class="columns">
            <div class="column is-one-quarter-tablet">
                <div class="field">
                    <label for="model" class="label">Select model:</label>
                    <div class="select is-fullwidth" id="model">
                        <select v-model="modelIdB" @change="modelSelected">
                            <option value="none">(no model)</option>
                            <optgroup
                                v-for="(models, provider) in MODELS_AVAILABLE"
                                :label="provider.toString()">
                                <option v-for="(model, id) in models" :value="provider + ':' + id">
                                    {{ model.name }}
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
                        @change="modelUpdated"
                        :disabled="!modelB.apiKeyRequired" />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted } from "vue";
import { MODELS_AVAILABLE } from "@/Models";
import type { ModelSelection } from "@/Models";

const modelIdA = ref<string>("Mistral:0");
const modelIdB = ref<string>("none");

const modelA = ref<ModelSelection>({
    name: "Mistral:mistral-embed",
    apiKey: "",
    apiKeyRequired: true,
});

const modelB = ref<ModelSelection>({
    name: "",
    apiKey: "",
    apiKeyRequired: false,
});

const emit = defineEmits(["models-updated"]);

function modelSelected() {
    const [providerA, idA] = modelIdA.value.split(":");
    const modelASelected = MODELS_AVAILABLE[providerA][parseInt(idA)];
    modelA.value.name = providerA + ":" + modelASelected.name;
    modelA.value.apiKeyRequired = modelASelected.apiKeyRequired;

    if (!modelA.value.apiKeyRequired) {
        modelA.value.apiKey = "";
    }

    const [providerB, idB] = modelIdB.value.split(":");
    const modelBSelected = MODELS_AVAILABLE[providerB][parseInt(idB)];
    modelB.value.name = providerB + ":" + modelBSelected.name;
    modelB.value.apiKeyRequired = modelBSelected.apiKeyRequired;

    if (!modelB.value.apiKeyRequired) {
        modelB.value.apiKey = "";
    }

    modelUpdated();
}

function modelUpdated() {
    const models = [modelA.value];

    if (modelB.value?.name) {
        models.push(modelB.value);
    }

    emit("models-updated", models);
}

onMounted(() => {
    modelUpdated();
});
</script>
