<script lang="ts" setup>
    import { ref, watch, computed } from 'vue'
    import { useDebounceFn } from '@vueuse/core'
    import type { ZodAny } from 'zod';

    const props = withDefaults(defineProps<{
        modelValue: string
        name: string
        label?: string
        description?: string
        /**
         * Zod schema for sync validation (format/min length/regex, etc.)
         */
        schema?: ZodAny

        /**
         * Async validation action (e.g., uniqueness check).
         */
        action: ReturnType<typeof useAsyncAction<string[], boolean>>

        /**
         * Debounce in ms for async validate
         */
        debounceMs?: number
        /**
         * If provided, a small, disabled input is rendered on the right side.
         * e.g. "@in.invocloud.fr"
         */
        suffix?: string
        placeholder?: string
        disabled?: boolean
        required?: boolean
        /**
         * Transform the input before validating/sending upward (e.g., lowercasing).
         */
        normalize?: (value: string) => string
        /**
         * Trim value before validating.
         */
        trim?: boolean
        /**
         * Show badges indicating checking/available/taken
         */
        showBadges?: boolean
        /**
         * Custom messages
         */
        msgChecking?: string
        msgAvailable?: string
        msgTaken?: string
    }>(), {
        debounceMs: 350,
        disabled: false,
        required: false,
        trim: true,
        showBadges: true,
        msgChecking: 'vérification…',
        msgAvailable: 'disponible',
        msgTaken: 'déjà pris',
    })

    const emit = defineEmits<{
        (e: 'update:modelValue', value: string): void
        (e: 'validity-change', valid: boolean): void
        (e: 'errors-change', errors: string[]): void
        (e: 'checking-change', checking: boolean): void
    }>()

    const inner = ref(props.modelValue ?? '')
    const errors = ref<string[]>([])
    type Status = 'idle' | 'checking' | 'valid' | 'invalid'
    const status = ref<Status>('idle')
    const isChecking = computed(() => status.value === 'checking')
    const isValid = computed(() => status.value === 'valid')
    const isInvalid = computed(() => status.value === 'invalid')

    /**
     * Run sync (Zod) validation. Returns true if ok.
     */
    function runSyncValidation(value: string): boolean {
        errors.value = []
        try {
            if (props.trim) value = value.trim()
            if (props.normalize) value = props.normalize(value)

            // If there is a schema, use it; otherwise accept any non-empty if required
            if (props.schema) {
                const res = props.schema.safeParse(value)
                if (!res.success) {
                    errors.value = res.error.issues.map(i => i.message)
                    return false
                }
            } else if (props.required && !value) {
                errors.value = ['Ce champ est requis']
                return false
            }
            return true
        } catch (e) {
            errors.value = ['Valeur invalide']
            return false
        }
    }

    /**
     * Debounced async validator (uniqueness, etc.)
     */
    const debouncedAsyncValidate = useDebounceFn(async (value: string) => {
        emit('checking-change', true)
        if (!props.action.execute) {
            status.value = errors.value.length ? 'invalid' : 'valid'
            emit('validity-change', status.value === 'valid')
            emit('errors-change', errors.value)
            return
        }
        status.value = 'checking'
        const { execute, data, error, pending } = props.action;
        const isCheckOk = await execute(value)
        if (isCheckOk) {
            status.value = 'valid'
        } else {
            status.value = 'invalid'
            if (error.value) {
                // prepend async error message, keep existing sync errors if any
                errors.value = [error.value.message, ...errors.value]
            } else if (errors.value.length === 0) {
                errors.value = ['Valeur non valide']
            }
        }

        emit('checking-change', false)
        emit('validity-change', status.value === 'valid')
        emit('errors-change', errors.value)
    }, props.debounceMs)

    /**
     * When inner value changes:
     * - Normalize/trim
     * - Run sync validation
     * - If passes, run async validation (debounced)
     */
    watch(inner, async (val) => {
        emit('checking-change', true)
        let next = val
        if (props.trim) next = next.trim()
        if (props.normalize) next = props.normalize(next)

        emit('update:modelValue', next)

        const syncOk = runSyncValidation(next)
        if (!syncOk) {
            status.value = 'invalid'
            emit('validity-change', false)
            emit('errors-change', errors.value)
            return
        }
        // No sync errors → try async (if provided)
        await debouncedAsyncValidate(next)
    }, { immediate: true })

    /**
     * Also react if parent updates modelValue externally.
     */
    watch(() => props.modelValue, (val) => {
        if (val !== inner.value) inner.value = val ?? ''
    })
</script>

<template>
    <!--
    This component is UI-library-agnostic at heart,
    but here we render using Nuxt UI primitives for convenience.
  -->
    <UFormField :name="name" :label="label" :required="required" class="w-full">
        <UFieldGroup class="w-full flex mt-2 items-center">
            <UInput class="w-full" v-model="inner" :placeholder="placeholder" autocomplete="off" :disabled="disabled"
                :loading="isChecking" :color="isValid ? 'success' : isInvalid ? 'error' : 'primary'">
                <template #leading v-if="showBadges && (isChecking || isValid || isInvalid)">
                    <UIcon v-if="isValid" name="i-lucide-check" color="success" />
                    <UIcon v-else-if="isInvalid || errors.length > 0" name="i-lucide-ban" color="error" />
                </template>
            </UInput>
            <UInput v-if="suffix" :default-value="suffix" disabled />
        </UFieldGroup>

        <template #description>
            <div v-if="description" class="text-sm text-muted mt-1">{{ description }}</div>
        </template>

        <template #error>
            <ul v-if="errors.length" class="mt-2 space-y-1">
                <li v-for="(e, i) in errors" :key="i" class="text-error">{{ e }}</li>
            </ul>
        </template>
    </UFormField>
</template>
