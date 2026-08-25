document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {

    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }

    const logout =
        document.getElementById("logoutBtn");

    if (logout) {

        logout.addEventListener("click", async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

        });
    }

    await loadDashboard();
}


async function loadDashboard() {

    const {
        data: properties,
        error
    } =
        await supabaseClient
            .from("properties")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(error);

        return;
    }

    const available =
        properties.filter(
            p => p.status === "Available"
        ).length;

    const sold =
        properties.filter(
            p =>
                p.status === "Sold" ||
                p.status === "Rented"
        ).length;


    document.getElementById(
        "totalProperties"
    ).textContent =
        properties.length;


    document.getElementById(
        "availableProperties"
    ).textContent =
        available;


    document.getElementById(
        "soldProperties"
    ).textContent =
        sold;


    renderPropertyTable(properties);


    const {
        data: enquiries,
        error: enquiryError
    } =
        await supabaseClient
            .from("property_enquiries")
            .select("*")
            .order("created_at", {
                ascending: false
            })
            .limit(10);

    if (!enquiryError) {

        document.getElementById(
            "sellEnquiries"
        ).textContent =
            enquiries.length;

        renderEnquiries(enquiries);
    }
}


function renderPropertyTable(properties) {

    const tbody =
        document.getElementById("propertyTable");

    if (!properties.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    No properties added yet.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        properties.map(p => `

            <tr>

                <td>
                    <strong>
                        ${escapeHtml(p.title)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(p.property_type)}
                </td>

                <td>
                    ${escapeHtml(p.location)}
                </td>

                <td>
                    ${formatPrice(p.price)}
                </td>

                <td>
                    ${escapeHtml(p.status)}
                </td>

                <td>

                    <div class="admin-actions">

                        <button
                            class="edit-btn"
                            onclick="editProperty('${p.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteProperty('${p.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            </tr>

        `).join("");
}


function renderEnquiries(enquiries) {

    const tbody =
        document.getElementById("enquiryTable");

    if (!enquiries.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    No enquiries yet.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        enquiries.map(e => `

            <tr>

                <td>
                    ${escapeHtml(e.name)}
                </td>

                <td>
                    <a href="tel:${escapeHtml(e.phone)}">
                        ${escapeHtml(e.phone)}
                    </a>
                </td>

                <td>
                    ${escapeHtml(e.location || "-")}
                </td>

                <td>
                    ${escapeHtml(e.expected_price || "-")}
                </td>

                <td>
                    ${new Date(e.created_at)
                        .toLocaleDateString("en-IN")}
                </td>

            </tr>

        `).join("");
}


function editProperty(id) {

    window.location.href =
        `edit-property.html?id=${id}`;
}


async function deleteProperty(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this property?"
        );

    if (!confirmed)
        return;


    const { error } =
        await supabaseClient
            .from("properties")
            .delete()
            .eq("id", id);


    if (error) {

        alert(
            "Unable to delete property: " +
            error.message
        );

        return;
    }


    await loadDashboard();
}


function formatPrice(value) {

    const number =
        Number(value);

    if (!number)
        return "Price on request";

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(number);
}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}