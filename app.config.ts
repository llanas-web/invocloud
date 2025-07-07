export default defineAppConfig({
    ui: {
        button: {
            slots: {
                base: "font-bold",
            },
            variants: {
                size: {
                    xl: {
                        base: "py-3 px-4",
                    },
                },
            },
            compoundVariants: [
                {
                    color: "neutral",
                    variant: "subtle",
                    class: "text-primary ring-0",
                },
            ],
        },
    },
});
