<script setup lang="ts">
import { VPdfViewer, useLicense } from '@vue-pdf-viewer/viewer'

const props = defineProps<{
    fileUrl: string;
    fileType: string;
    fileName: string;
}>()
console.log(import.meta.env.VPV_LICENSE_KEY);
useLicense(import.meta.env.VPV_LICENSE_KEY || '')

const { fileUrl, fileType, fileName } = toRefs(props)
</script>
<template>
    <template v-if="fileUrl">
        <div v-if="fileType.includes('pdf')" class="relative h-full">
            <VPdfViewer :src="fileUrl" />
        </div>

        <div v-else-if="fileType.match(/^(image|audio|video|text|application)\/[a-z0-9.+-]+$/i)" class="text-center">
            <img v-if="fileType.startsWith('image/')" :src="fileUrl" :alt="fileName"
                class="max-w-full max-h-[60vh] mx-auto rounded" />
            <audio v-else-if="fileType.startsWith('audio/')" :src="fileUrl" controls class="mx-auto" />
            <video v-else-if="fileType.startsWith('video/')" :src="fileUrl" controls
                class="max-w-full max-h-[60vh] mx-auto rounded" />
            <a v-else :href="fileUrl" download class="text-blue-500 underline">
                Télécharger le fichier : {{ fileName }}
            </a>
        </div>

        <div v-else class="text-gray-700 text-center">
            Aperçu indisponible. Fichier : {{ fileName }}
        </div>
    </template>
</template>