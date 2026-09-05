/* =========================================================
   GROVER PROPERTIES
   ADMIN DASHBOARD + ENQUIRY MANAGEMENT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initAdmin
);


/* =========================================================
   GLOBAL DATA
========================================================= */

let allProperties = [];
let allSellEnquiries = [];
let allContactEnquiries = [];


/* =========================================================
   INITIALIZE ADMIN
========================================================= */

async function initAdmin() {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        /*
         * User must be logged in.
         */

        if (!user) {

            redirectToLogin();

            return;
        }


        /*
         * User must be an approved admin.
         */

        const {
            data: admin,
            error: adminError
        } =
            await supabaseClient
                .from("admin_users")
                .select("user_id")
                .eq("user_id", user.id)
                .maybeSingle();


        if (adminError) {

            console.error(
                "Admin verification error:",
                adminError
            );

            await supabaseClient.auth.signOut();

            alert(
                "Unable to verify admin access."
            );

            redirectToLogin();

            return;
        }


        if (!admin) {

            await supabaseClient.auth.signOut();

            alert(
                "Access denied. This account is not an administrator."
            );

            redirectToLogin();

            return;
        }


        /*
         * Everything is OK.
         */

        setupEvents();

        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Admin initialization error:",
            error
        );

        redirectToLogin();

    }

}


/* =========================================================
   EVENT SETUP
========================================================= */

function setupEvents() {


    /* Logout */

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logoutAdmin
        );

    }


    /* Refresh */

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadDashboard
        );

    }


    /* Property search */

    const propertySearch =
        document.getElementById(
            "propertySearch"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const typeFilter =
        document.getElementById(
            "typeFilter"
        );


    if (propertySearch) {

        propertySearch.addEventListener(
            "input",
            filterProperties
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterProperties
        );

    }


    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            filterProperties
        );

    }


    /* Sell enquiry filters */

    const sellSearch =
        document.getElementById(
            "sellSearch"
        );


    const sellStatusFilter =
        document.getElementById(
            "sellStatusFilter"
        );


    if (sellSearch) {

        sellSearch.addEventListener(
            "input",
            filterSellEnquiries
        );

    }


    if (sellStatusFilter) {

        sellStatusFilter.addEventListener(
            "change",
            filterSellEnquiries
        );

    }


    /* Contact enquiry filters */

    const contactSearch =
        document.getElementById(
            "contactSearch"
        );


    const contactStatusFilter =
        document.getElementById(
            "contactStatusFilter"
        );


    if (contactSearch) {

        contactSearch.addEventListener(
            "input",
            filterContactEnquiries
        );

    }


    if (contactStatusFilter) {

        contactStatusFilter.addEventListener(
            "change",
            filterContactEnquiries
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutAdmin() {

    const confirmed =
        confirm(
            "Logout from admin panel?"
        );


    if (!confirmed)
        return;


    await supabaseClient.auth.signOut();


    redirectToLogin();

}


/* =========================================================
   LOGIN REDIRECT
========================================================= */

function redirectToLogin() {

    window.location.href =
        "login.html";

}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

    showMessage(
        "Loading dashboard...",
        "info"
    );


    try {


        /* =================================================
           PROPERTIES
        ================================================= */

        const {
            data: properties,
            error: propertyError
        } =
            await supabaseClient
                .from("properties")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (propertyError)
            throw propertyError;


        allProperties =
            properties || [];


        updatePropertyStats(
            allProperties
        );


        renderPropertyTable(
            allProperties
        );



        /* =================================================
           SELL ENQUIRIES
        ================================================= */

        const {
            data: sellEnquiries,
            error: sellError
        } =
            await supabaseClient
                .from("property_enquiries")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (sellError)
            throw sellError;


        allSellEnquiries =
            sellEnquiries || [];


        document.getElementById(
            "sellEnquiries"
        ).textContent =
            allSellEnquiries.length;


        renderSellEnquiries(
            allSellEnquiries
        );



        /* =================================================
           CONTACT ENQUIRIES
        ================================================= */

        const {
            data: contactEnquiries,
            error: contactError
        } =
            await supabaseClient
                .from("contact_enquiries")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (contactError)
            throw contactError;


        allContactEnquiries =
            contactEnquiries || [];


        document.getElementById(
            "contactEnquiries"
        ).textContent =
            allContactEnquiries.length;


        renderContactEnquiries(
            allContactEnquiries
        );



        /* =================================================
           NEW LEADS
        ================================================= */

        const newSell =
            allSellEnquiries.filter(
                enquiry =>
                    enquiry.status === "New"
            ).length;


        const newContact =
            allContactEnquiries.filter(
                enquiry =>
                    enquiry.status === "New"
            ).length;


        document.getElementById(
            "newEnquiries"
        ).textContent =
            newSell + newContact;


        showMessage(
            "",
            ""
        );

    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to load dashboard.",
            "error"
        );

    }

}


/* =========================================================
   PROPERTY STATS
========================================================= */

function updatePropertyStats(
    properties
) {

    const available =
        properties.filter(
            property =>
                property.status === "Available"
        ).length;


    const soldOrRented =
        properties.filter(
            property =>
                property.status === "Sold" ||
                property.status === "Rented"
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
        soldOrRented;

}


/* =========================================================
   PROPERTY FILTER
========================================================= */

function filterProperties() {

    const search =
        (
            document.getElementById(
                "propertySearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const status =
        document.getElementById(
            "statusFilter"
        )?.value || "all";


    const type =
        document.getElementById(
            "typeFilter"
        )?.value || "all";


    const filtered =
        allProperties.filter(
            property => {


                const searchable =
                    [
                        property.title,
                        property.location,
                        property.address,
                        property.property_type
                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(
                        search
                    );


                const matchesStatus =
                    status === "all" ||
                    property.status === status;


                const matchesType =
                    type === "all" ||
                    property.property_type === type;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType
                );

            }
        );


    renderPropertyTable(
        filtered
    );

}


/* =========================================================
   PROPERTY TABLE
========================================================= */

function renderPropertyTable(
    properties
) {

    const tbody =
        document.getElementById(
            "propertyTable"
        );


    if (!tbody)
        return;


    if (!properties.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No matching properties found.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        properties.map(
            property => {


                return `

                    <tr>

                        <td>

                            <div class="property-admin-title">

                                <strong>
                                    ${escapeHtml(
                                        property.title
                                    )}
                                </strong>

                                <small>
                                    ${escapeHtml(
                                        property.address || ""
                                    )}
                                </small>

                            </div>

                        </td>


                        <td>
                            ${escapeHtml(
                                property.property_type
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                property.location
                            )}
                        </td>


                        <td>
                            <strong>
                                ${formatPrice(
                                    property.price
                                )}
                            </strong>
                        </td>


                        <td>

                            <span
                                class="status-badge ${getStatusClass(
                                    property.status
                                )}"
                            >
                                ${escapeHtml(
                                    property.status
                                )}
                            </span>

                        </td>


                        <td>

                            ${
                                property.featured

                                ? `
                                    <span class="featured-badge">
                                        ⭐ Featured
                                    </span>
                                  `

                                : `
                                    <span class="muted-text">
                                        —
                                    </span>
                                  `
                            }

                        </td>


                        <td>

                            <div class="admin-actions">

                                <button
                                    type="button"
                                    class="edit-btn"
                                    data-property-edit="${escapeHtml(
                                        property.id
                                    )}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="delete-btn"
                                    data-property-delete="${escapeHtml(
                                        property.id
                                    )}"
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    /*
     * EDIT BUTTONS
     */

    tbody
        .querySelectorAll(
            "[data-property-edit]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        editProperty(
                            button.dataset.propertyEdit
                        );

                    }
                );

            }
        );


    /*
     * DELETE BUTTONS
     */

    tbody
        .querySelectorAll(
            "[data-property-delete]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteProperty(
                            button.dataset.propertyDelete
                        );

                    }
                );

            }
        );

}


/* =========================================================
   SELL ENQUIRIES
========================================================= */

function renderSellEnquiries(
    enquiries
) {

    const tbody =
        document.getElementById(
            "enquiryTable"
        );


    if (!tbody)
        return;


    if (!enquiries.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="10">
                    No sell enquiries yet.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        enquiries.map(
            enquiry => {


                return `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    enquiry.name
                                )}
                            </strong>
                        </td>


                        <td>

                            <a
                                href="tel:${escapeHtml(
                                    enquiry.phone
                                )}"
                            >
                                ${escapeHtml(
                                    enquiry.phone
                                )}
                            </a>

                        </td>


                        <td>

                            ${
                                enquiry.email

                                ? `
                                    <a
                                        href="mailto:${escapeHtml(
                                            enquiry.email
                                        )}"
                                    >
                                        ${escapeHtml(
                                            enquiry.email
                                        )}
                                    </a>
                                  `

                                : "—"
                            }

                        </td>


                        <td>
                            ${escapeHtml(
                                enquiry.property_type || "-"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                enquiry.location || "-"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                enquiry.expected_price || "-"
                            )}
                        </td>


                        <td>

                            <div class="enquiry-message">
                                ${escapeHtml(
                                    enquiry.message || "-"
                                )}
                            </div>

                        </td>


                        <td>

                            ${statusSelect(
                                enquiry.id,
                                enquiry.status
                            )}

                        </td>


                        <td>
                            ${formatDate(
                                enquiry.created_at
                            )}
                        </td>


                        <td>

                            <div class="admin-actions">

                                ${callButton(
                                    enquiry.phone
                                )}

                                ${whatsappButton(
                                    enquiry.phone,
                                    enquiry.name
                                )}

                                ${
                                    enquiry.email
                                    ? emailButton(
                                        enquiry.email
                                    )
                                    : ""
                                }


                                <button
                                    type="button"
                                    class="delete-btn"
                                    data-sell-delete="${escapeHtml(
                                        enquiry.id
                                    )}"
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    attachSellActions();

}


/* =========================================================
   CONTACT ENQUIRIES
========================================================= */

function renderContactEnquiries(
    enquiries
) {

    const tbody =
        document.getElementById(
            "contactTable"
        );


    if (!tbody)
        return;


    if (!enquiries.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No contact enquiries yet.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        enquiries.map(
            enquiry => {


                return `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    enquiry.name
                                )}
                            </strong>
                        </td>


                        <td>

                            <a
                                href="tel:${escapeHtml(
                                    enquiry.phone
                                )}"
                            >
                                ${escapeHtml(
                                    enquiry.phone
                                )}
                            </a>

                        </td>


                        <td>

                            ${
                                enquiry.email

                                ? `
                                    <a
                                        href="mailto:${escapeHtml(
                                            enquiry.email
                                        )}"
                                    >
                                        ${escapeHtml(
                                            enquiry.email
                                        )}
                                    </a>
                                  `

                                : "—"
                            }

                        </td>


                        <td>

                            <div class="enquiry-message">

                                ${escapeHtml(
                                    enquiry.message || "-"
                                )}

                            </div>

                        </td>


                        <td>

                            ${statusSelect(
                                enquiry.id,
                                enquiry.status
                            )}

                        </td>


                        <td>
                            ${formatDate(
                                enquiry.created_at
                            )}
                        </td>


                        <td>

                            <div class="admin-actions">

                                ${callButton(
                                    enquiry.phone
                                )}

                                ${whatsappButton(
                                    enquiry.phone,
                                    enquiry.name
                                )}

                                ${
                                    enquiry.email
                                    ? emailButton(
                                        enquiry.email
                                    )
                                    : ""
                                }


                                <button
                                    type="button"
                                    class="delete-btn"
                                    data-contact-delete="${escapeHtml(
                                        enquiry.id
                                    )}"
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    attachContactActions();

}


/* =========================================================
   STATUS SELECT
========================================================= */

function statusSelect(
    id,
    status
) {

    return `

        <select
            class="enquiry-status-select ${getStatusClass(
                status
            )}"
            data-enquiry-status="${escapeHtml(
                id
            )}"
        >

            <option
                value="New"
                ${status === "New" ? "selected" : ""}
            >
                New
            </option>

            <option
                value="Contacted"
                ${status === "Contacted" ? "selected" : ""}
            >
                Contacted
            </option>

            <option
                value="Closed"
                ${status === "Closed" ? "selected" : ""}
            >
                Closed
            </option>

        </select>

    `;
}


/* =========================================================
   SELL ACTIONS
========================================================= */

function attachSellActions() {


    document
        .querySelectorAll(
            "[data-enquiry-status]"
        )
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    () => {

                        updateEnquiryStatus(
                            select.dataset.enquiryStatus,
                            select.value,
                            "property_enquiries"
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-sell-delete]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteEnquiry(
                            button.dataset.sellDelete,
                            "property_enquiries"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   CONTACT ACTIONS
========================================================= */

function attachContactActions() {


    /*
     * Contact status selects have the same
     * data attribute.
     */

    document
        .querySelectorAll(
            "[data-enquiry-status]"
        )
        .forEach(
            select => {

                /*
                 * Avoid duplicate listener.
                 */

                if (
                    select.dataset.bound === "true"
                )
                    return;


                select.dataset.bound = "true";


                select.addEventListener(
                    "change",
                    () => {

                        const table =
                            select.closest(
                                "tbody"
                            );


                        const isContact =
                            table &&
                            table.id ===
                            "contactTable";


                        updateEnquiryStatus(
                            select.dataset.enquiryStatus,
                            select.value,
                            isContact
                                ? "contact_enquiries"
                                : "property_enquiries"
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-contact-delete]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteEnquiry(
                            button.dataset.contactDelete,
                            "contact_enquiries"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   UPDATE ENQUIRY STATUS
========================================================= */

async function updateEnquiryStatus(
    id,
    status,
    table
) {

    try {

        const {
            error
        } =
            await supabaseClient
                .from(table)
                .update({
                    status: status
                })
                .eq(
                    "id",
                    id
                );


        if (error)
            throw error;


        /*
         * Update local data too.
         */

        if (
            table ===
            "property_enquiries"
        ) {

            const enquiry =
                allSellEnquiries.find(
                    item =>
                        item.id === id
                );


            if (enquiry)
                enquiry.status = status;


        } else {

            const enquiry =
                allContactEnquiries.find(
                    item =>
                        item.id === id
                );


            if (enquiry)
                enquiry.status = status;

        }


        updateNewLeadCount();


    }

    catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "Unable to update enquiry status: " +
            error.message
        );


        await loadDashboard();

    }

}


/* =========================================================
   DELETE ENQUIRY
========================================================= */

async function deleteEnquiry(
    id,
    table
) {

    const confirmed =
        confirm(
            "Delete this enquiry permanently?"
        );


    if (!confirmed)
        return;


    try {

        const {
            error
        } =
            await supabaseClient
                .from(table)
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error)
            throw error;


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Delete enquiry error:",
            error
        );


        alert(
            "Unable to delete enquiry: " +
            error.message
        );

    }

}


/* =========================================================
   SEARCH SELL ENQUIRIES
========================================================= */

function filterSellEnquiries() {

    const search =
        (
            document.getElementById(
                "sellSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const status =
        document.getElementById(
            "sellStatusFilter"
        )?.value || "all";


    const filtered =
        allSellEnquiries.filter(
            enquiry => {


                const searchable =
                    [
                        enquiry.name,
                        enquiry.phone,
                        enquiry.email,
                        enquiry.location,
                        enquiry.property_type,
                        enquiry.expected_price,
                        enquiry.message
                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return (
                    (!search ||
                        searchable.includes(
                            search
                        )
                    ) &&

                    (
                        status === "all" ||
                        enquiry.status === status
                    )
                );

            }
        );


    renderSellEnquiries(
        filtered
    );

}


/* =========================================================
   SEARCH CONTACT ENQUIRIES
========================================================= */

function filterContactEnquiries() {

    const search =
        (
            document.getElementById(
                "contactSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const status =
        document.getElementById(
            "contactStatusFilter"
        )?.value || "all";


    const filtered =
        allContactEnquiries.filter(
            enquiry => {


                const searchable =
                    [
                        enquiry.name,
                        enquiry.phone,
                        enquiry.email,
                        enquiry.message
                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return (
                    (!search ||
                        searchable.includes(
                            search
                        )
                    ) &&

                    (
                        status === "all" ||
                        enquiry.status === status
                    )
                );

            }
        );


    renderContactEnquiries(
        filtered
    );

}


/* =========================================================
   PROPERTY EDIT
========================================================= */

function editProperty(id) {

    window.location.href =
        `edit-property.html?id=${encodeURIComponent(
            id
        )}`;

}


/* =========================================================
   PROPERTY DELETE
========================================================= */

async function deleteProperty(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this property?"
        );


    if (!confirmed)
        return;


    try {

        const {
            error
        } =
            await supabaseClient
                .from("properties")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error)
            throw error;


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Property delete error:",
            error
        );


        alert(
            "Unable to delete property: " +
            error.message
        );

    }

}


/* =========================================================
   CALL BUTTON
========================================================= */

function callButton(
    phone
) {

    if (!phone)
        return "";


    return `

        <a
            class="admin-action-btn"
            href="tel:${escapeHtml(
                phone
            )}"
        >
            📞 Call
        </a>

    `;

}


/* =========================================================
   WHATSAPP BUTTON
========================================================= */

function whatsappButton(
    phone,
    name
) {

    if (!phone)
        return "";


    /*
     * Remove spaces, + and other symbols.
     */

    const cleanPhone =
        String(phone)
            .replace(
                /[^0-9]/g,
                ""
            );


    const message =
        `Hello ${name || ""}, this is Grover Properties. We received your enquiry. How can we help you?`
        .trim();


    const url =
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            message
        )}`;


    return `

        <a
            class="admin-action-btn whatsapp-action"
            href="${url}"
            target="_blank"
            rel="noopener noreferrer"
        >
            💬 WhatsApp
        </a>

    `;

}


/* =========================================================
   EMAIL BUTTON
========================================================= */

function emailButton(
    email
) {

    if (!email)
        return "";


    return `

        <a
            class="admin-action-btn"
            href="mailto:${escapeHtml(
                email
            )}"
        >
            ✉️ Email
        </a>

    `;

}


/* =========================================================
   NEW LEADS COUNT
========================================================= */

function updateNewLeadCount() {

    const newSell =
        allSellEnquiries.filter(
            enquiry =>
                enquiry.status === "New"
        ).length;


    const newContact =
        allContactEnquiries.filter(
            enquiry =>
                enquiry.status === "New"
        ).length;


    const element =
        document.getElementById(
            "newEnquiries"
        );


    if (element) {

        element.textContent =
            newSell + newContact;

    }

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    switch (status) {

        case "Available":
        case "New":
            return "status-available";


        case "Sold":
        case "Closed":
            return "status-sold";


        case "Rented":
        case "Contacted":
            return "status-rented";


        default:
            return "";

    }

}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(
    value
) {

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
    ).format(
        number
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    if (!value)
        return "-";


    const date =
        new Date(value);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   DASHBOARD MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "propertyMessage"
        );


    if (!element)
        return;


    element.textContent =
        message;


    element.className =
        `admin-message ${
            type || ""
        }`;

}
