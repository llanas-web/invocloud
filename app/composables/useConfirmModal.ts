import { LazyCommonConfirmModal } from "#components";
import { createSharedComposable } from "@vueuse/core";

const _useUseConfirmModal = () => {
  const overlay = useOverlay();
  const modal = overlay.create(LazyCommonConfirmModal);

  async function confirm(opts: {
    title: string;
    description?: string;
    validateLabel?: string;
    rejectLabel?: string;
    danger?: boolean;
    preventClose?: boolean;
    defaultFocus?: "ok" | "cancel";
    canValidate?: () => boolean;
  }): Promise<boolean> {
    // ⬇️ open returns an OpenedOverlay object with a `.result` Promise
    const opened = modal.open(opts);
    const result = await opened.result; // ✅ this is the important bit
    return !!result;
  }

  return { confirm };
};

export const useConfirmModal = createSharedComposable(_useUseConfirmModal);
