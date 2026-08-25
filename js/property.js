document.addEventListener("DOMContentLoaded", loadProperty);

async function loadProperty() {

    const params =
        new URLSearchParams(window.location.search);

    const id = params.get("id");

    const container =
        document.getElementById("propertyDetail");

    if (!id) {

        container.innerHTML =
            `<div class="empty">
                Property not found.
            </div>`;

        return;
    }

    const { data, error } =
        await supabaseClient
            .from("properties")
            .select("*")
            .eq("id", id)
            .single();

    if (error || !data) {

        container.innerHTML =
            `<div class="empty">
                Property not found.
            </div>`;

        return;
    }

    const p = data;

    const images =
        p.images && p.images.length
            ? p.images
            : [];

    const mainImage =
        images[0] || "";

    const whatsappMessage =
        encodeURIComponent(
            `Hello Grover Properties, I am interested in this property: ${p.title} (${p.location}).`
        );

    container.innerHTML = `

        <div class="detail-grid">

            <div>

                <div class="gallery-main">

                    ${
                        mainImage
                            ? `<img id="mainPropertyImage"
                                    src="${escapeHtml(mainImage)}"
                                    alt="${escapeHtml(p.title)}">`
                            : `<div class="no-image">
                                    No Image Available
                               </div>`
                    }

                </div>

                ${
                    images.length > 1
                        ? `
                            <div class="gallery-thumbs">

                                ${images.map(image => `
                                    <img
                                        src="${escapeHtml(image)}"
                                        onclick="changeMainImage('${escapeHtml(image)}')"
                                        alt="Property image"
                                    >
                                `).join("")}

                            </div>
                          `
                        : ""
                }

                <div class="property-description">

                    <h2>Description</h2>

                    <p>
                        ${escapeHtml(p.description)}
                    </p>

                    ${
                        p.features && p.features.length
                            ? `
                                <h2 style="margin-top:35px">
                                    Features
                                </h2>

                                <div class="feature-list">

                                    ${p.features.map(feature => `
                                        <div class="feature-item">
                                            ✓ ${escapeHtml(feature)}
                                        </div>
                                    `).join("")}

                                </div>
                              `
                            : ""
                    }

                </div>

            </div>


            <aside class="detail-panel">

                <div class="property-type">
                    ${escapeHtml(p.property_type)}
                </div>

                <h1>
                    ${escapeHtml(p.title)}
                </h1>

                <div class="property-location">
                    📍 ${escapeHtml(p.location)}
                </div>

                <div class="detail-price">
                    ${formatPrice(p.price)}
                </div>

                <div class="detail-info">

                    <div class="info-box">
                        <span>Status</span>
                        <strong>${escapeHtml(p.status)}</strong>
                    </div>

                    <div class="info-box">
                        <span>Listing</span>
                        <strong>For ${escapeHtml(p.listing_type)}</strong>
                    </div>

                    ${
                        p.area
                            ? `
                                <div class="info-box">
                                    <span>Area</span>
                                    <strong>
                                        ${escapeHtml(p.area)}
                                        ${escapeHtml(p.area_unit)}
                                    </strong>
                                </div>
                              `
                            : ""
                    }

                    ${
                        p.bedrooms
                            ? `
                                <div class="info-box">
                                    <span>Bedrooms</span>
                                    <strong>${p.bedrooms}</strong>
                                </div>
                              `
                            : ""
                    }

                    ${
                        p.bathrooms
                            ? `
                                <div class="info-box">
                                    <span>Bathrooms</span>
                                    <strong>${p.bathrooms}</strong>
                                </div>
                              `
                            : ""
                    }

                    ${
                        p.parking
                            ? `
                                <div class="info-box">
                                    <span>Parking</span>
                                    <strong>${escapeHtml(p.parking)}</strong>
                                </div>
                              `
                            : ""
                    }

                </div>

                <div class="detail-actions">

                    <a
                        class="btn btn-whatsapp"
                        target="_blank"
                        href="https://wa.me/${GROVER_PROPERTIES.whatsapp}?text=${whatsappMessage}"
                    >
                        💬 Enquire on WhatsApp
                    </a>

                    <a
                        class="btn btn-primary"
                        href="tel:${GROVER_PROPERTIES.phone}"
                    >
                        📞 Call Grover Properties
                    </a>

                </div>

            </aside>

        </div>
    `;
}

function changeMainImage(src) {

    const image =
        document.getElementById("mainPropertyImage");

    if (image)
        image.src = src;
}