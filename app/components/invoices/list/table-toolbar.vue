<script setup lang="ts">
    import type { InvoiceStatus } from '~~/shared/domain/invoice/invoice.model';

    const { refresh } = useInvoices();

    const props = defineProps<{
        selectedCount: number;
        isDownloading: boolean;
        downloadProgress?: { done: number; total: number } | null;
        statusFilter: InvoiceStatus | 'overdue' | undefined;
    }>();

    const emit = defineEmits<{
        send: [];
        download: [];
        delete: [];
        'update:statusFilter': [value: InvoiceStatus | 'overdue' | undefined];
    }>();

    const statusItems = [
        { label: 'Tout', value: undefined },
        { label: 'En cours', value: 'validated' },
        { label: 'Payé', value: 'paid' },
        { label: 'En retard', value: 'overdue' }
    ];

    const downloadLabel = computed(() => {
        if (props.isDownloading && props.downloadProgress) {
            return `Téléchargement ${props.downloadProgress.done} / ${props.downloadProgress.total}`;
        }
        return 'Télécharger';
    });
</script>

<template>
    <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex flex-wrap items-center gap-1.5">
            <UButton @click="() => refresh()" color="primary" variant="outline" icon="i-lucide-refresh-cw" />
            <UButton :disabled="!selectedCount" label="Envoyer" color="primary" variant="subtle" icon="i-lucide-send"
                @click="emit('send')" :ui="{ label: 'hidden md:block' }">
                <template #trailing>
                    <UKbd>{{ selectedCount }}</UKbd>
                </template>
            </UButton>

            <UButton :disabled="!selectedCount || isDownloading" :loading="isDownloading" :label="downloadLabel"
                color="primary" variant="subtle" icon="i-lucide-download" @click="emit('download')"
                :ui="{ label: 'hidden md:block' }">
                <template #trailing>
                    <UKbd>{{ selectedCount }}</UKbd>
                </template>
            </UButton>

            <UButton :disabled="!selectedCount" label="Supprimer" color="error" variant="subtle" icon="i-lucide-trash"
                @click="emit('delete')" :ui="{ label: 'hidden md:block' }">
                <template #trailing>
                    <UKbd>{{ selectedCount }}</UKbd>
                </template>
            </UButton>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
            <USelect :model-value="statusFilter" :items="statusItems" :ui="{
                trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }" placeholder="Filter status" class="min-w-28" />
        </div>
    </div>
</template>