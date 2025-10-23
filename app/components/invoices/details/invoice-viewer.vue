<script lang="ts" setup>
    import { ref, watch } from 'vue'
    import type { InvoiceViewModel } from '~/viewmodels/invoice/invoice.vm';

    const { invoice, actions: { download: { execute, pending, error } } } = useInvoiceDetails();

    const fileUrl = ref<string | null>(null)
    const fileType = ref<string>('')
    const fileName = ref<string>('example.pdf')

    const loadInvoiceFile = async (invoice: InvoiceViewModel | null) => {
        if (!invoice) return

        const blob = await execute()

        fileUrl.value = URL.createObjectURL(blob)
        fileType.value = blob.type
        fileName.value = invoice.name ?? 'File'
    }

    watch(invoice, (newInvoice) => {
        if (newInvoice) {
            loadInvoiceFile(newInvoice)
        }
    }, { immediate: true })
</script>

<template>
    <div class="bg-white shadow h-full w-full">
        <div v-if="pending" class="text-center text-gray-500">Chargement du fichier…</div>
        <div v-else-if="error" class="text-red-600 text-center">{{ error.message }}</div>
        <template v-else-if="fileUrl">
            <ClientOnly>
                <CommonFileViewer :fileUrl="fileUrl" :fileType="fileType" :fileName="fileName" />
            </ClientOnly>
        </template>
    </div>
</template>
