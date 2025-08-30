<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

definePageMeta({
    layout: 'app'
})

const { formRef, formState, invoiceFile, isLoading, isDirty } = useInvoiceCreate()

const items = ref<BreadcrumbItem[]>([
    {
        label: 'Factures',
        icon: 'i-lucide-files',
        to: '/app'
    },
    {
        label: `Nouvelle Facture`,
        icon: 'i-lucide-file-text',
    }
])

const fileUrl = computed(() => invoiceFile.value ? URL.createObjectURL(invoiceFile.value) : '')
const fileType = computed(() => invoiceFile.value ? invoiceFile.value.type : '')
const fileName = computed(() => invoiceFile.value ? invoiceFile.value.name : 'example.pdf')

const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files ? target.files[0] : null

    if (file) {
        invoiceFile.value = file
        formState.name = formState.name ?? file.name
        formState.file_path = fileUrl.value
    } else {
        invoiceFile.value = null
        formState.name = formState.name ?? ''
        formState.file_path = ''
    }
}

const triggerFilePicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = onFileChange
    input.click()
}


const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')
const isFormOpen = ref(false)
</script>
<template>
    <UDashboardPanel id="invoices-new" :default-size="25" :min-size="20" :max-size="100" resizable>
        <template #header>
            <UDashboardNavbar :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                    <UBreadcrumb :items="items" class="hidden md:flex" />
                </template>
                <template #left>
                </template>
                <template #right>
                    <template v-if="isMobile">
                        <UButton v-if="fileUrl" label="Voir la facture" variant="ghost" size="md"
                            trailingIcon="i-lucide-eye" @click="isFormOpen = true" />
                        <UButton v-else icon="i-lucide-plus" class="rounded-full" size="lg"
                            @click="triggerFilePicker" />
                    </template>

                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div class="p-2">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                    <UIcon name="i-lucide-file-text" class="text-primary" /> Détails de la facture
                </h2>
                <InvoicesDetailsCreateForm />
            </div>
            <div class="flex justify-end p-4 mt-auto space-x-4">
                <UButton label="Annuler" color="neutral" variant="subtle" :disabled="isLoading"
                    @click="navigateTo('/app')" />
                <UButton label="Sauvegarder" color="success" :loading="isLoading" @click="formRef?.submit()"
                    :disabled="!isDirty" />
            </div>
        </template>
    </UDashboardPanel>
    <template v-if="fileUrl">
        <USlideover v-if="isMobile" v-model:open="isFormOpen">
            <template #body>
                <CommonFileViewer :fileUrl="fileUrl" :fileType="fileType" :fileName="fileName" />
            </template>
        </USlideover>
        <CommonFileViewer class="w-full" :fileUrl="fileUrl" :fileType="fileType" :fileName="fileName" />
    </template>
    <div v-else class="bg-white shadow w-full flex items-center justify-center p-4">
        <UButton icon="i-lucide-plus" class="rounded-full" size="lg" @click="triggerFilePicker" />
    </div>
</template>