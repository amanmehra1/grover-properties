document.addEventListener("DOMContentLoaded", loadProperties);

async function loadProperties() {

    const grid =
        document.getElementById("propertyGrid");

    if (!grid)
        return;

    grid.innerHTML =
        `<div class="loading">Loading properties...</div>`;

    const params =
        new URLSearchParams(window.location.search);

    const location =
        params.get("location") || "";

    const type =
        params.get("type") || "";

    const listing =
        params.get("listing") || "";

    const minPrice =
        params.get("minPrice") || "";

    const maxPrice =
        params.get("maxPrice") || "";

    const { data, error } =
        await supabaseClient
            .from("properties")
            .select("*")
            .eq("status", "Available")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(error);

        grid.innerHTML =
            `<div class="empty">
                Unable to load properties.
            </div>`;

        return;
    }

    let properties = data || [];

    if (location) {

        properties =
            properties.filter(p =>
                p.location
                    .toLowerCase()
                    .includes(location.toLowerCase())
            );
    }

    if (type) {

        properties =
            properties.filter(p =>
                p.property_type === type
            );
    }

    if (listing) {

        properties =
            properties.filter(p =>
                p.listing_type === listing
            );
    }

    if (minPrice) {

        properties =
            properties.filter(p =>
                Number(p.price) >= Number(minPrice)
            );
    }

    if (maxPrice) {

        properties =
            properties.filter(p =>
                Number(p.price) <= Number(maxPrice)
            );
    }

    document.getElementById("resultsCount")
        .textContent =
        `${properties.length} properties found`;

    if (!properties.length) {

        grid.innerHTML =
            `<div class="empty">
                <h3>No properties found</h3>
                <p>Try changing your search filters.</p>
            </div>`;

        return;
    }

    grid.innerHTML =
        properties.map(propertyCard).join("");
}

function applyFilters() {

    const location =
        document.getElementById("filterLocation").value.trim();

    const type =
        document.getElementById("filterType").value;

    const listing =
        document.getElementById("filterListing").value;

    const minPrice =
        document.getElementById("filterMinPrice").value;

    const maxPrice =
        document.getElementById("filterMaxPrice").value;

    const params =
        new URLSearchParams();

    if (location)
        params.set("location", location);

    if (type)
        params.set("type", type);

    if (listing)
        params.set("listing", listing);

    if (minPrice)
        params.set("minPrice", minPrice);

    if (maxPrice)
        params.set("maxPrice", maxPrice);

    window.location.href =
        `properties.html?${params.toString()}`;
}