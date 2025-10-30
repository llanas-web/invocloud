import { BaseError } from "~~/shared/errors/base.error";
import { FetchError } from "ofetch";

export const handleError = (error: unknown) => {
    const { add } = useToast();

    if (error instanceof BaseError) {
        error.createFrontError();
        return;
    } else if (error instanceof FetchError) {
        console.error("Handled FetchError:", error);
        add({
            title: "Une erreur de réseau est survenue.",
            description: error.statusMessage || "Erreur réseau inconnue.",
            color: "error",
        });
        return;
    } else if (error instanceof Error) {
        console.error("Unhandled error:", error);
        console.error("Unhandled error message: ", error.message);
        add({
            title: "Une erreur inattendue est survenue.",
            description: error.message,
            color: "error",
        });
        return;
    } else {
        console.error("Unknown error:", error);
        add({
            title: "Une erreur inconnue est survenue.",
            description: "Une erreur inconnue est survenue.",
            color: "error",
        });
        return;
    }
};
