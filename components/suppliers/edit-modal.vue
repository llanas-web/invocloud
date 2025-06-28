<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import { UButton } from '#components'

const { createSupplier } = useSuppliers()

const schema = z.object({
    name: z.string().min(2, 'Too short'),
    emails: z.array(z.string().email('Invalid email'))
})
const open = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    name: undefined,
    emails: []
})

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
                    const index = state.emails?.indexOf(row.original.email)
                    if (index !== undefined && index > -1) {
                        state.emails?.splice(index, 1)
                    }
                }
            })
        }
    }
];

const emailField = ref('');
const addEmail = () => {
    if (emailField.value && z.string().email().safeParse(emailField.value).success) {
        state.emails ? state.emails.push(emailField.value) : state.emails = [emailField.value]
        emailField.value = ''
    } else {
        useToast().add({ title: 'Error', description: 'Invalid email address', color: 'error' })
    }
}

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    const { name, emails } = event.data
    const newSupplier = await createSupplier(
        name,
        emails
    )
    if (!newSupplier) {
        toast.add({ title: 'Error', description: 'Failed to create supplier', color: 'error' })
        return
    }
    toast.add({ title: 'Success', description: `New supplier ${newSupplier.name} added`, color: 'success' })
    open.value = false
    state.name = undefined
    state.emails = []
}
</script>

<template>
    <UModal v-model:open="open" title="Nouveau fournisseur" description="Ajouter un nouveau fournisseur">
        <UButton label="Nouveau fournisseur" icon="i-lucide-plus" />

        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Nom" placeholder="John Doe" name="name">
                    <UInput v-model="state.name" class="w-full" />
                </UFormField>
                <UTable v-if="state.emails?.length" :data="state.emails?.map(email => ({ email }))" :columns="columns"
                    class="flex-1" />
                <div class="w-full flex items-center gap-2">
                    <UInput v-model="emailField" class="flex-grow" placeholder="Ajouter un email" />
                    <UButton color="primary" variant="solid" icon="i-lucide-plus" @click="addEmail" />
                </div>
                <div class="flex justify-end gap-2">
                    <UButton label="Annuler" color="neutral" variant="subtle" @click="open = false" />
                    <UButton label="Créer" color="primary" variant="solid" type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
