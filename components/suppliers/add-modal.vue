<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { UButton } from '#components'

const { openModal: open, formState, isLoading, emailField, addEmail, onSubmit } = useSupplierCreate();

const columns: TableColumn<{ email: string }>[] = [
    { accessorKey: 'email', header: 'Email' },
    {
        accessorKey: 'actions', header: '', meta: { class: { td: 'text-end', th: 'text-right' } }, cell: ({ row }) => {
            return h(UButton, {
                icon: 'i-lucide-trash',
                color: 'error',
                variant: 'subtle',
                class: 'text-right',
                onClick: () => {
                    const index = formState.emails?.indexOf(row.original.email)
                    if (index !== undefined && index > -1) {
                        formState.emails?.splice(index, 1)
                    }
                }
            })
        }
    }
];
</script>

<template>
    <UModal v-model:open="open" title="Nouveau fournisseur" description="Ajouter un nouveau fournisseur">
        <UButton label="Nouveau fournisseur" icon="i-lucide-plus" />

        <template #body>
            <UForm :state="formState" class="space-y-4" @submit="onSubmit">
                <UFormField label="Nom" placeholder="John Doe" name="name">
                    <UInput v-model="formState.name" class="w-full" :disabled="isLoading" />
                </UFormField>
                <UTable v-if="formState.emails?.length" :data="formState.emails?.map(email => ({ email }))"
                    :columns="columns" class="flex-1" />
                <div class="w-full flex items-center gap-2">
                    <UInput v-model="emailField" class="flex-grow" placeholder="Ajouter un email"
                        :disabled="isLoading" />
                    <UButton color="primary" variant="solid" icon="i-lucide-plus" @click="addEmail" />
                </div>
                <div class="flex justify-end gap-2">
                    <UButton label="Annuler" color="neutral" variant="subtle" @click="open = false"
                        :disabled="isLoading" />
                    <UButton label="Créer" color="primary" variant="solid" type="submit" :loading="isLoading" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
