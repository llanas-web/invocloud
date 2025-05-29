<script setup lang="ts">
import type { Invoice } from '~/types'

const supabase = useSupabaseClient()

const open = ref(false)
const fileUrl = ref<string | null>(null) // File URL (can be a Blob or public URL)
const fileName = ref('example.pdf')      // Optional: shown when no preview
const fileType = ref('')

// You can use this to open the modal programmatically
async function showFile(invoice: Invoice) {
    const { data: blob, error } = await supabase.storage.from('invoices').download(invoice.file_path!)
    if (error) {
        console.error("Error downloading invoice file:", error)
        return
    }
    const url = URL.createObjectURL(blob)
    fileType.value = blob.type
    fileUrl.value = url
    fileName.value = invoice.name ?? 'File'
    open.value = true
}

defineExpose({ showFile })
</script>

<template>
    <UModal v-model:open="open" :overlay="true" title="Fichier" class="max-w-3xl">
        <template #body>
            <div class="rounded-lg border p-4 max-h-[70vh] overflow-auto bg-white">
                <template v-if="fileType.includes('pdf')">
                    <iframe :src="fileUrl!" class="w-full h-[60vh] rounded" frameborder="0" />
                </template>
                <template v-else-if="fileType?.match(/\.(png|jpe?g|gif|webp)$/)">
                    <img :src="fileUrl!" :alt="fileName" class="max-w-full max-h-[60vh] mx-auto rounded" />
                </template>
                <template v-else>
                    <p class="text-gray-700 text-center">Fichier : {{ fileName }}</p>
                </template>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end">
                <UButton label="Fermer" @click="open = false" />
            </div>
        </template>
    </UModal>
</template>
