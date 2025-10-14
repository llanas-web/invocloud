import { ref } from "vue";

function useAsyncAction<TArgs extends any[], TResult>(
    action: (...args: TArgs) => Promise<TResult>,
) {
    const pending = ref(false);
    const error = ref<unknown>(null);
    const data = ref<TResult | null>(null);

    async function execute(...args: TArgs) {
        pending.value = true;
        error.value = null;
        try {
            const result = await action(...args);
            data.value = result;
            return result;
        } catch (err) {
            error.value = err;
            data.value = null;
            throw err;
        } finally {
            pending.value = false;
        }
    }

    return { pending, error, data, execute };
}

export default useAsyncAction;
