document.addEventListener("DOMContentLoaded", () => {

    const business = window.GROVER_PROPERTIES;

    document.querySelectorAll("[data-business-name]")
        .forEach(el => el.textContent = business.businessName);

    document.querySelectorAll("[data-dealer-name]")
        .forEach(el => el.textContent = business.dealerName);

    document.querySelectorAll("[data-phone]")
        .forEach(el => {
            el.textContent = business.phone;
            el.href = `tel:${business.phone}`;
        });

    document.querySelectorAll("[data-whatsapp]")
        .forEach(el => {
            el.href =
                `https://wa.me/${business.whatsapp}`;
        });

    document.querySelectorAll("[data-email]")
        .forEach(el => {
            el.textContent = business.email;
            el.href = `mailto:${business.email}`;
        });

    document.querySelectorAll("[data-address]")
        .forEach(el => el.textContent = business.address);

    const menuButton =
        document.querySelector(".mobile-menu");

    const nav =
        document.querySelector(".nav-links");

    if (menuButton && nav) {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");

        menuButton.addEventListener("click", () => {
            const open = nav.classList.toggle("mobile-open");
            menuButton.setAttribute("aria-expanded", String(open));
            menuButton.setAttribute(
                "aria-label",
                open ? "Close navigation menu" : "Open navigation menu"
            );
            menuButton.textContent = open ? "✕" : "☰";
        });

        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("mobile-open");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open navigation menu");
                menuButton.textContent = "☰";
            });
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) {
                nav.classList.remove("mobile-open");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.textContent = "☰";
            }
        });
    }

    const searchForm =
        document.getElementById("heroSearch");

    if (searchForm) {

        searchForm.addEventListener("submit", e => {

            e.preventDefault();

            const location =
                document.getElementById("heroLocation").value.trim();

            const type =
                document.getElementById("heroType").value;

            const params =
                new URLSearchParams();

            if (location)
                params.set("location", location);

            if (type)
                params.set("type", type);

            window.location.href =
                `properties.html?${params.toString()}`;
        });
    }
});

function showToast(message) {

    let toast =
        document.querySelector(".toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.className = "toast";

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function formatPrice(value) {

    const number = Number(value);

    if (!number)
        return "Price on request";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(number);
}

function propertyCard(property) {

    const image =
        property.images &&
        property.images.length
            ? property.images[0]
            : "";

    const meta = [];

    if (property.area)
        meta.push(`${property.area} ${property.area_unit}`);

    if (property.bedrooms)
        meta.push(`${property.bedrooms} Beds`);

    if (property.bathrooms)
        meta.push(`${property.bathrooms} Baths`);

    return `
        <article class="property-card">

            <a href="property.html?id=${property.id}">

                <div class="property-image">

                    ${
                        image
                            ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(property.title)}">`
                            : `<div class="no-image">No Image Available</div>`
                    }

                    <span class="badge">
                        FOR ${escapeHtml(property.listing_type.toUpperCase())}
                    </span>

                </div>

                <div class="property-body">

                    <div class="property-type">
                        ${escapeHtml(property.property_type)}
                    </div>

                    <h3 class="property-title">
                        ${escapeHtml(property.title)}
                    </h3>

                    <div class="property-location">
                        📍 ${escapeHtml(property.location)}
                    </div>

                    <div class="property-meta">
                        ${meta.map(x => `<span>${escapeHtml(x)}</span>`).join("")}
                    </div>

                    <div class="property-footer">

                        <strong class="property-price">
                            ${formatPrice(property.price)}
                        </strong>

                        <span>View →</span>

                    </div>

                </div>

            </a>

        </article>
    `;
}

function escapeHtml(value) {

    if (value === null || value === undefined)
        return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
/* =========================================================
   CUSTOMER PROFILE NAVIGATION
========================================================= */

async function updateCustomerProfileLink() {

    const profileLink =
        document.getElementById(
            "customerProfileLink"
        );


    if (!profileLink)
        return;


    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (user) {

            profileLink.textContent =
                "👤 My Account";

            profileLink.href =
                "customer/account.html";

        } else {

            profileLink.textContent =
                "👤 Login / Create Account";

            profileLink.href =
                "customer/login.html";

        }

    }

    catch (error) {

        console.error(
            "Customer profile check:",
            error
        );

    }

}


updateCustomerProfileLink();
