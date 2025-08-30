export default defineAppConfig({
    ui: {
        button: {
            slots: {
                base: "font-bold text-primary",
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
                    color: "primary",
                    variant: "subtle",
                    class: "text-primary ring-0",
                },
            ],
        },
    },
});
