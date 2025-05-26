<script setup lang="ts">
    import * as z from 'zod'
    import type { FormSubmitEvent } from '@nuxt/ui'

    const { createSupplier } = useSuppliers()

    const schema = z.object({
        name: z.string().min(2, 'Too short'),
        email: z.string().email('Invalid email')
    })
    const open = ref(false)

    type Schema = z.output<typeof schema>

    const state = reactive<Partial<Schema>>({
        name: undefined,
        email: undefined
    })

    const toast = useToast()
    async function onSubmit(event: FormSubmitEvent<Schema>) {
        const { name, email } = event.data
        const newSupplier = await createSupplier({
            name,
            email
        })
        toast.add({ title: 'Success', description: `New supplier ${event.data.name} added`, color: 'success' })
        open.value = false
        state.name = undefined
        state.email = undefined
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
                <UFormField label="Email" placeholder="john.doe@example.com" name="email">
                    <UInput v-model="state.email" class="w-full" />
                </UFormField>
                <div class="flex justify-end gap-2">
                    <UButton label="Annuler" color="neutral" variant="subtle" @click="open = false" />
                    <UButton label="Créer" color="primary" variant="solid" type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
