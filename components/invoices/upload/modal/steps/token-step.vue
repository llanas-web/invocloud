<script setup lang="ts">
import * as z from 'zod'

const { tokenState } = useUploadInvoice()

const confirmFormSchema = z.object({
    confirmToken: z.string().array().length(6, 'Invalid token'),
})
</script>

<template>
    <UForm ref="stepConfirmForm" :schema="confirmFormSchema" :state="tokenState" class="space-y-4 mt-8">
        <UFormField label="Code de confirmation" name="confirmToken"
            class="w-full flex flex-col items-center justify-center">
            <UPinInput type="text" :length="6" v-model="tokenState.confirmToken" class="w-full" />
        </UFormField>
    </UForm>
</template>