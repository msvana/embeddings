<template>
    <section class="box">
        <a href="#" @click="toggleRolled">
            <h2 class="is-size-5 has-text-centered">
                Advanced settings
                <span class="icon is-small">
                    <i
                        class="fas fa-angle-down"
                        aria-hidden="true"
                        v-if="rolledClass == 'rolled-up'"></i>
                    <i class="fas fa-angle-up" aria-hidden="true" v-else></i>
                </span>
            </h2>
        </a>

        <div :class="rolledClass">
            <div class="columns">
                <div class="column is-half-tablet is-offset-one-quarter-tablet">
                    <div class="field">
                        <label for="visualization-method" class="label"
                            >Visualization method:</label
                        >
                        <div class="select is-fullwidth">
                            <select id="visualization-method" v-model="settings.visualization">
                                <option value="pca">PCA</option>
                                <option value="tsne">tSNE (experimental)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { ref, defineEmits, onMounted, watch } from "vue";

export type Settings = {
    visualization: "pca" | "tsne";
};

const rolledClass: Ref<string> = ref("rolled-up");
const settings: Ref<Settings> = ref({ visualization: "pca" });

const emit = defineEmits(["settings-updated"]);

function toggleRolled() {
    if (rolledClass.value === "rolled-up") {
        rolledClass.value = "rolled-down";
    } else {
        rolledClass.value = "rolled-up";
    }
}

function settingsUpdated() {
    emit("settings-updated", settings.value);
}

watch(settings, settingsUpdated, {deep: true});
onMounted(settingsUpdated);
</script>

<style>
.rolled-up {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.25s ease-out;
}

.rolled-down {
    max-height: 150px;
    transition: max-height 0.25s ease-in;
    overflow: hidden;
}
</style>
