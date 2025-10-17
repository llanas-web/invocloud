<script setup lang="ts">
    import * as z from 'zod'

    const { onSubmit } = useEstablishmentCreate()

    const schema = z.object({
        name: z.string().min(2, 'Too short'),
    })
    const open = ref(false)

    type Schema = z.output<typeof schema>

    const state = reactive<Partial<Schema>>({
        name: undefined
    })

    const showModal = () => {
        open.value = true
    }

    defineExpose({
        showModal
    })
</script>

<template>
    <UModal v-model:open="open" title="Créer une structure"
        description="Créer une nouvelle structure pour gérer vos factures et fournisseurs.">

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
