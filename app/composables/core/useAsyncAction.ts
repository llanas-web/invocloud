import { ref } from "vue";
import { AppError } from "~/core/errors/app.error";
import { FetchError } from "ofetch";
import { BaseError } from "~~/shared/errors/base.error";

interface AsyncActionsOptions {
    successTitle?: string;
    errorTitle?: string;
    successMessage?: string;
    errorMessage?: string;
    showToast?: boolean;
    successAction?: {
        label: string;
        onClick: () => void;
    };
    errorAction?: {
        label: string;
        onClick: () => void;
    };
}

function useAsyncAction<TArgs extends any[], TResult>(
    action: (...args: TArgs) => Promise<TResult>,
    options: AsyncActionsOptions = {},
) {
    const pending = ref(false);
    const { add } = useToast();
    const error = ref<AppError | null>(null);
    const data = ref<TResult | null>(null);
    const {
        successTitle = "Succès",
        errorTitle = "Erreur",
        successMessage = "Action réalisée avec succès.",
        errorMessage = "Une erreur est survenue lors de l'opération.",
        showToast = true,
        successAction,
        errorAction,
    } = options;

    async function execute(...args: TArgs) {
        pending.value = true;
        error.value = null;
        try {
            const result = await action(...args);
            data.value = result;
            if (showToast) {
                add({
                    title: successTitle,
                    description: successMessage,
                    color: "success",
                    icon: "i-lucide:check-circle",
                    actions: successAction
                        ? [{
                            label: successAction.label,
                            onClick: successAction.onClick,
                        }]
                        : [],
                });
            }
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
                title: errorTitle ?? error.value.title,
                description: errorMessage ?? error.value.message,
                color: error.value.isError ? "error" : "warning",
                icon: "i-lucide:alert-circle",
                actions: errorAction
                    ? [{
                        label: errorAction.label,
                        onClick: errorAction.onClick,
                    }]
                    : [],
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
