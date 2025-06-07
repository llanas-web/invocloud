<script setup lang="ts">
import { ref } from 'vue'
import type { Invoice } from '~/types';

const open = ref(false)
const invoiceToAccept = ref<Invoice | null>(null)

function showAcceptSideover(invoice: Invoice) {
    invoiceToAccept.value = invoice
    open.value = true
}

defineExpose({
    showAcceptSideover
})

</script>

<template>
    <USlideover v-model:open="open">
        <template #content>
            <Placeholder class="h-full m-4" />
        </template>
    </USlideover>
</template>