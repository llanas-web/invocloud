<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { createEstablishment } = useEstablishments()

const schema = z.object({
    name: z.string().min(2, 'Too short'),
})
const open = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    name: undefined
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    const { name } = event.data
    const newEstablishment = await createEstablishment(name)
    if (!newEstablishment) {
        toast.add({ title: 'Error', description: 'Failed to create establishment', color: 'error' })
        return
    }
    toast.add({ title: 'Success', description: `New establishment ${newEstablishment.name} added`, color: 'success' })
    open.value = false
    state.name = undefined
}
</script>

<template>
    <UModal v-model:open="open" title="Créer une structure"
        description="Créer une nouvelle structure pour gérer vos factures et fournisseurs.">
        <UButton label="Nouvelle structure" icon="i-lucide-plus" />

        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Nom" placeholder="John Doe" name="name">
                    <UInput v-model="state.name" class="w-full" />
                </UFormField>
                <div class="flex justify-end gap-2">
                    <UButton label="Annuler" color="neutral" variant="subtle" @click="open = false" />
                    <UButton label="Créer" color="primary" variant="solid" type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
