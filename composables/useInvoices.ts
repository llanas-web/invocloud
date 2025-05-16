const _useInvoices = () => {
    const supabaseClient = useSupabaseClient()
    const invoices = ref<Invoice[]>([])
    const invoicesLoading = ref(false)

    const getInvoices = async () => {
        invoicesLoading.value = true
        const { data, error } = await supabaseClient
            .from("invoices")
            .select("*")

        if (error) {
            console.error("Error fetching invoices:", error)
            return null
        }
        invoices.value = data as Invoice[]
        invoicesLoading.value = false
    }

    