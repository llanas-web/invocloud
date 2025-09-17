// composables/useWorker.ts
import { createSharedComposable } from "@vueuse/core";
import { useInvoicesTableList } from "./invoices/table-list";
import { format } from "date-fns";
import type { Invoice } from "~~/types";

type DownloadMsg = {
  type: "download";
  invoices: Partial<Invoice>[];
  supabaseUrl: string;
  supabaseAnonKey: string;
};

const _useWorker = () => {
  const { public: pub } = useRuntimeConfig();
  const { selectedEstablishment } = useEstablishments();
  const { rangeFilter } = useInvoicesTableList();
  const worker = shallowRef<Worker | null>(null);
  const ready = computed(() => !!worker.value);
  const queue: any[] = [];

  // optional: expose progress state
  const progress = ref<{ done: number; total: number } | null>(null);
  const running = ref(false);

  const init = () => {
    if (worker.value) return;
    // client-only
    if (process.client) {
      const w = new Worker(
        new URL("~/workers/invoices-downloader.worker.ts", import.meta.url),
        { type: "module" },
      );
      w.onmessage = (ev: MessageEvent) => {
        const msg = ev.data;
        if (msg?.type === "progress") {
          progress.value = { done: msg.done, total: msg.total };
        } else if (msg?.type === "done") {
          running.value = false;
          // trigger browser download
          const url = URL.createObjectURL(msg.blob as Blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${
            selectedEstablishment.value?.name.replace(/\s+/g, "_")
          }-${format(rangeFilter.value.start, "dd/MM/yyyy")}-${
            format(rangeFilter.value.end, "dd/MM/yyyy")
          }.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      };
      w.onerror = () => {
        running.value = false;
      };
      worker.value = w;
      // flush queued posts
      while (queue.length) w.postMessage(queue.shift());
    }
  };

  const destroy = () => {
    worker.value?.terminate();
    worker.value = null;
  };

  onMounted(init);
  onBeforeUnmount(destroy);

  // if used across pages and you want persistence, keep using createSharedComposable (below)

  function post(message: any) {
    if (worker.value) worker.value.postMessage(message);
    else queue.push(message);
  }

  async function launchDownloadWorker(invoices: Invoice[]) {
    if (!invoices?.length) return;
    running.value = true;
    // only pass PUBLIC values to the worker
    const msg: DownloadMsg = {
      type: "download",
      invoices,
      supabaseUrl: pub.supabaseUrl, // from NUXT_PUBLIC_*
      supabaseAnonKey: pub.supabaseAnonKey, // from NUXT_PUBLIC_*
    };
    post(JSON.stringify(msg));
  }

  return {
    ready,
    running,
    progress,
    launchDownloadWorker,
    // expose for rare low-level needs:
    _worker: worker,
  };
};

export const useWorker = createSharedComposable(_useWorker);
