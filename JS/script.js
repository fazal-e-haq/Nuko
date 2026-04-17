const legendItems = [
    { label: "Alkali", type: "alkali-metal" },
    { label: "Alkaline Earth", type: "alkaline-earth-metal" },
    { label: "Transition", type: "transition-metal" },
    { label: "Post-Transition", type: "post-transition-metal" },
    { label: "Metalloid", type: "metalloid" },
    { label: "Nonmetal", type: "nonmetal" },
    { label: "Halogen", type: "halogen" },
    { label: "Noble Gas", type: "noble-gas" },
    { label: "Lanthanide", type: "lanthanide" },
    { label: "Actinide", type: "actinide" }
];

function typeToSlug(type) {
    return type.toLowerCase().replace(/\s+/g, "-");
}

function createLegend() {
    return `
        <div class="legend-panel" aria-label="Element category guide">
            ${legendItems.map((item) => `
                <button class="legend-item" type="button" data-filter="${item.type}" aria-label="Highlight ${item.label}">
                    <span class="legend-swatch"></span>
                    <span class="legend-label">${item.label}</span>
                </button>
            `).join("")}
        </div>
    `;
}

function createElement(el) {
    const rowShift = el.row >= 8 ? "10px" : "0px";
    const typeSlug = typeToSlug(el.type);

    return `
        <div class="element ${typeSlug}" style="grid-column:${el.col}; grid-row:${el.row}; --row-shift:${rowShift};" data-symbol="${el.symbol}" data-type="${typeSlug}" role="link" tabindex="0" aria-label="Open details for ${el.name}">
            <span class="number">${el.number}</span>
            <p class="mass">${el.mass}</p>
            <h2 class="symbol">${el.symbol}</h2>
            <p class="name">${el.name}</p>
        </div>
    `;
}

const table = document.getElementById("table");
table.innerHTML = createLegend() + elements.map(createElement).join("");

function setActiveType(type) {
    const cards = table.querySelectorAll(".element");
    const legends = table.querySelectorAll(".legend-item");

    if (!type) {
        table.classList.remove("is-filtering");
        cards.forEach((card) => card.classList.remove("is-match"));
        legends.forEach((item) => item.classList.remove("is-active"));
        return;
    }

    table.classList.add("is-filtering");

    cards.forEach((card) => {
        card.classList.toggle("is-match", card.dataset.type === type);
    });

    legends.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.filter === type);
    });
}

function openElementDetail(symbol) {
    window.location.href = `element.htm?symbol=${encodeURIComponent(symbol)}`;
}

table.addEventListener("mouseover", (event) => {
    const card = event.target.closest(".element");
    const legend = event.target.closest(".legend-item");

    if (legend) {
        setActiveType(legend.dataset.filter);
    }
});

table.addEventListener("mouseout", (event) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget && table.contains(nextTarget)) {
        return;
    }

    setActiveType("");
});

table.addEventListener("click", (event) => {
    const card = event.target.closest(".element");

    if (!card) {
        return;
    }

    openElementDetail(card.dataset.symbol);
});

table.addEventListener("keydown", (event) => {
    const legend = event.target.closest(".legend-item");
    const card = event.target.closest(".element");

    if (legend) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const isActive = legend.classList.contains("is-active");
            setActiveType(isActive ? "" : legend.dataset.filter);
        }

        return;
    }

    if (!card) {
        return;
    }

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openElementDetail(card.dataset.symbol);
    }
});
