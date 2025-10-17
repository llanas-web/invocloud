import { ref } from "vue";
import { AppError } from "~/core/errors/app.error";

function useAsyncAction<TArgs extends any[], TResult>(
    action: (...args: TArgs) => Promise<TResult>,
) {
    const pending = ref(false);
    const error = ref<AppError | null>(null);
    const data = ref<TResult | null>(null);

    async function execute(...args: TArgs) {
        pending.value = true;
        error.value = null;
        try {
            const result = await action(...args);
            data.value = result;
            return result;
        } catch (err) {
            if (err instanceof Error) {
                error.value = new AppError(err.message);
            } else if (typeof err === "string") {
                error.value = new AppError(err);
            } else {
                error.value = new AppError("Oups... Une erreur est survenue.");
            }
            data.value = null;
            throw err;
        } finally {
            pending.value = false;
        }
    }

    return { pending, error, data, execute };
}

export default useAsyncAction;
