<script lang="ts" setup>
import type { Invoice } from '~/types'
import { ref, watch } from 'vue'

const { downloadInvoiceFile } = useInvoices()

const props = defineProps<{
    invoice: Invoice
}>()

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const fileUrl = ref<string | null>(null)
const fileType = ref<string>('')
const fileName = ref<string>('example.pdf')

const loadInvoiceFile = async (invoice: Invoice) => {
    loading.value = true
    errorMessage.value = null

    try {
        const blob = await downloadInvoiceFile(invoice.file_path!)

        fileUrl.value = URL.createObjectURL(blob)
        fileType.value = blob.type
        fileName.value = invoice.name ?? 'File'
    } catch (err: any) {
        console.error('Error downloading invoice:', err)
        errorMessage.value = 'Impossible de charger le fichier.'
    } finally {
        loading.value = false
    }
}

watch(() => props.invoice, loadInvoiceFile, { immediate: true })
</script>

<template>
    <div class="bg-white shadow w-full">
        <div v-if="loading" class="text-center text-gray-500">Chargement du fichier…</div>
        <div v-else-if="errorMessage" class="text-red-600 text-center">{{ errorMessage }}</div>
        <template v-else-if="fileUrl">
            <div v-if="fileType.includes('pdf')" class="relative h-full">
                <iframe :src="fileUrl" class="w-full h-full" frameborder="0" toolbar="0" title="Invoice PDF Preview" />
            </div>

            <div v-else-if="fileType.match(/^(image|audio|video|text|application)\/[a-z0-9.+-]+$/i)"
                class="text-center">
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
    </div>
</template>
