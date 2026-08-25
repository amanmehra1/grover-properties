document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("sellPropertyForm");

    if (!form)
        return;

    form.addEventListener("submit", async e => {

        e.preventDefault();

        const button =
            form.querySelector("button[type='submit']");

        button.disabled = true;
        button.textContent = "Submitting...";

        const formData =
            new FormData(form);

        const data = {
            name: formData.get("name"),
            phone: formData.get("phone"),
            email: formData.get("email") || "",
            property_type:
                formData.get("property_type") || "",
            location:
                formData.get("location") || "",
            expected_price:
                formData.get("expected_price") || "",
            message:
                formData.get("message") || ""
        };

        const { error } =
            await supabaseClient
                .from("property_enquiries")
                .insert(data);

        button.disabled = false;
        button.textContent = "Submit Property";

        if (error) {

            console.error(error);

            showToast(
                "Unable to submit. Please try again."
            );

            return;
        }

        form.reset();

        showToast(
            "Thank you! Grover Properties will contact you soon."
        );
    });
});