// composables/useWorker.ts
import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "./core/useAsyncAction";

export type InvoiceWorkerMessageDTO = {
  id: string;
  filePath: string;
  number: string | null;
};

type DownloadMsg = {
  type: "download";
  invoices: InvoiceWorkerMessageDTO[];
  supabaseUrl: string;
  supabaseAnonKey: string;
  access_token: string | undefined;
  refresh_token: string | undefined;
};

const _useWorker = () => {
  const { public: pub } = useRuntimeConfig();
  const { establishment } = useEstablishmentDetails();
  const session = useSupabaseSession();
  const worker = shallowRef<Worker | null>(null);
  const ready = computed(() => !!worker.value);
  const queue: any[] = [];

  // optional: expose progress state
  const progress = ref<{ done: number; total: number } | null>(null);
  const running = ref(false);

  const init = () => {
    if (worker.value) return;
    // client-only
    if (import.meta.client) {
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
          a.download = `${establishment.value?.name.replace(/\s+/g, "_")}.zip`;
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

  const launchDownloadWorkerAction = useAsyncAction(
    async (
      invoices: InvoiceWorkerMessageDTO[],
    ) => {
      if (!invoices?.length) throw new Error("Aucune facture à télécharger");
      running.value = true;
      const msg: DownloadMsg = {
        type: "download",
        invoices,
        supabaseUrl: pub.supabaseUrl,
        supabaseAnonKey: pub.supabaseAnonKey,
        access_token: session.value?.access_token,
        refresh_token: session.value?.refresh_token,
      };
      post(JSON.stringify(msg));
      // On peut attendre la fin via progress/running si besoin
      return true;
    },
    {
      showToast: false,
      errorTitle: "Erreur lors du lancement du téléchargement des factures.",
    },
  );

  return {
    ready,
    running,
    progress,
    launchDownloadWorker: launchDownloadWorkerAction,
    // expose for rare low-level needs:
    _worker: worker,
  };
};

export const useWorker = createSharedComposable(_useWorker);
