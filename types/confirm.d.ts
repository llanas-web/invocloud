export type ConfirmPayload<T = void> = T;

export type ConfirmOptions<T = void> = {
    title: string;
    description?: string;
    validateLabel?: string;
    rejectLabel?: string;
    danger?: boolean; // bouton OK en rouge
    preventClose?: boolean; // désactive overlay/ESC
    defaultFocus?: "ok" | "cancel"; // focus initial
    modalProps?: Record<string, any>; // props passés à UModal
    render?: () => any; // slot custom (VNode factory)
    canValidate?: () => boolean;
};

export type ConfirmRequest<T = void> = {
    options: ConfirmOptions<T>;
    resolve: (value: ConfirmPayload<T>) => void;
    reject: (reason?: any) => void;
    timeoutId?: ReturnType<typeof setTimeout>;
};
