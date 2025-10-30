import { ref } from "vue";
import { AppError } from "~/core/errors/app.error";
import { FetchError } from "ofetch";
import { BaseError } from "~~/shared/errors/base.error";

function useAsyncAction<TArgs extends any[], TResult>(
    action: (...args: TArgs) => Promise<TResult>,
) {
    const pending = ref(false);
    const { add } = useToast();
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
            switch (true) {
                case err instanceof FetchError:
                    error.value = AppError.fromFetchError(err);
                    break;
                case err instanceof BaseError:
                    error.value = AppError.fromBaseError(err);
                    break;
                case (err instanceof Error):
                    error.value = new AppError(err.message, err.name, true);
                    break;
                case (typeof err === "string"):
                    error.value = new AppError(err, "Erreur inconnue", true);
                    break;
                default:
                    error.value = new AppError(
                        "Oups... Une erreur est survenue.",
                        "Erreur inconnue",
                        true,
                    );
            }
            add({
                title: error.value.title,
                description: error.value.message,
                color: error.value.isError ? "error" : "warning",
            });
            data.value = null;
            throw err;
        } finally {
            pending.value = false;
        }
    }

    return { pending, error, data, execute };
}

export default useAsyncAction;
