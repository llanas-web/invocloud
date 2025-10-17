import { LazyCommonConfirmModal } from "#components";
import { createSharedComposable } from "@vueuse/core";
import type { ConfirmOptions } from "~/types/confirm";

const _useUseConfirmModal = () => {
  const overlay = useOverlay();
  const modal = overlay.create(LazyCommonConfirmModal);

  async function confirm(opts: ConfirmOptions): Promise<boolean> {
    const opened = modal.open(opts);
    const result = await opened.result;
    return !!result;
  }

  return { confirm };
};

export const useConfirmModal = createSharedComposable(_useUseConfirmModal);
