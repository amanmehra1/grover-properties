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
                            ? `<img
                                    id="mainPropertyImage"
                                    src="${escapeHtml(mainImage)}"
                                    alt="${escapeHtml(p.title)}"
                                >`
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


                <!-- INTEREST MESSAGE -->

                <div
                    id="interestMessage"
                    class="interest-message"
                ></div>


                <div class="detail-actions">

                    <!-- I'M INTERESTED -->

                    <button
                        type="button"
                        id="interestBtn"
                        class="btn btn-interest"
                        data-property-id="${escapeHtml(p.id)}"
                    >
                        ❤️ I'm Interested
                    </button>


                    <!-- WHATSAPP -->

                    <a
                        class="btn btn-whatsapp"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://wa.me/${GROVER_PROPERTIES.whatsapp}?text=${whatsappMessage}"
                    >
                        💬 Enquire on WhatsApp
                    </a>


                    <!-- CALL -->

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


    /*
     * I'M INTERESTED BUTTON
     */

    const interestBtn =
        document.getElementById("interestBtn");

    if (interestBtn) {

        interestBtn.addEventListener(
            "click",
            () => handleInterest(p)
        );
    }
}


/*
 * HANDLE CUSTOMER INTEREST
 */

async function handleInterest(property) {

    const button =
        document.getElementById("interestBtn");

    const message =
        document.getElementById("interestMessage");


    if (!button || !message)
        return;


    button.disabled = true;
    button.textContent = "Checking...";


    try {

        /*
         * Check logged-in customer
         */

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        /*
         * Customer must login
         */

        if (!user) {

            message.textContent =
                "Please login to show your interest in this property.";

            message.className =
                "interest-message info";


            setTimeout(() => {

                window.location.href =
                    `customer/login.html?redirect=${encodeURIComponent(
                        window.location.href
                    )}`;

            }, 700);

            return;
        }


        /*
         * Customer information
         */

        const customerName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "";

        const customerPhone =
            user.user_metadata?.phone ||
            "";

        const customerEmail =
            user.email ||
            "";


        /*
         * Check whether interest already exists
         */

        const {
            data: existingInterest,
            error: existingError
        } =
            await supabaseClient
                .from("customer_interests")
                .select("id, status")
                .eq("customer_id", user.id)
                .eq("property_id", property.id)
                .maybeSingle();


        if (existingError) {
            throw existingError;
        }


        /*
         * Already interested
         */

        if (existingInterest) {

            message.textContent =
                `You have already shown interest in this property. Status: ${existingInterest.status}`;

            message.className =
                "interest-message success";

            button.textContent =
                "❤️ Interest Already Submitted";

            button.disabled = true;

            return;
        }


        /*
         * Save interest
         */

        button.textContent =
            "Submitting...";


        const {
            error: insertError
        } =
            await supabaseClient
                .from("customer_interests")
                .insert({

                    customer_id:
                        user.id,

                    property_id:
                        property.id,

                    customer_name:
                        customerName,

                    customer_phone:
                        customerPhone,

                    customer_email:
                        customerEmail,

                    property_title:
                        property.title,

                    property_location:
                        property.location,

                    property_price:
                        property.price,

                    status:
                        "New"
                });


        if (insertError) {
            throw insertError;
        }


        /*
         * Success
         */

        message.textContent =
            "Thank you! Your interest has been submitted successfully. Grover Properties will contact you soon.";

        message.className =
            "interest-message success";


        button.textContent =
            "❤️ Interest Submitted";

        button.disabled = true;


    } catch (error) {

        console.error(
            "Interest submission error:",
            error
        );


        message.textContent =
            error.message ||
            "Unable to submit your interest. Please try again.";

        message.className =
            "interest-message error";


        button.disabled = false;

        button.textContent =
            "❤️ I'm Interested";
    }
}


/*
 * CHANGE MAIN GALLERY IMAGE
 */

function changeMainImage(src) {

    const image =
        document.getElementById(
            "mainPropertyImage"
        );

    if (image)
        image.src = src;
}
