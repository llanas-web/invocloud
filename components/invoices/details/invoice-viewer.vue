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
    <div class="bg-white shadow h-full w-full">
        <div v-if="loading" class="text-center text-gray-500">Chargement du fichier…</div>
        <div v-else-if="errorMessage" class="text-red-600 text-center">{{ errorMessage }}</div>
        <template v-else-if="fileUrl">
            <CommonFileViewer :fileUrl="fileUrl" :fileType="fileType" :fileName="fileName" />
        </template>
    </div>
</template>
