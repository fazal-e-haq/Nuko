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
const splash = document.querySelector(".splash");
const splashLogo = document.querySelector(".splash .logo");
const splashBrand = document.querySelector(".splash-brand");
const navbarLogo = document.querySelector(".navbar .logo");

function randomSplashOffset() {
    const x = Math.round((Math.random() * 220) - 110);
    const y = Math.round((Math.random() * 160) - 80);

    if (splashBrand) {
        splashBrand.style.setProperty("--start-x", `${x}px`);
        splashBrand.style.setProperty("--start-y", `${y}px`);
    }
}

function animateSplashLogoToNavbar() {
    if (!splash || !splashLogo || !navbarLogo || !splashBrand) {
        return;
    }

    const splashRect = splashLogo.getBoundingClientRect();
    const navbarRect = navbarLogo.getBoundingClientRect();
    const movingLogo = document.createElement("h1");
    
    movingLogo.textContent = "Nuko";
    movingLogo.className = "splash-transition-logo";
    
    // Set initial position and size to match the splash logo EXACTLY
    movingLogo.style.left = `${splashRect.left}px`;
    movingLogo.style.top = `${splashRect.top}px`;
    movingLogo.style.width = `${splashRect.width}px`;
    movingLogo.style.height = `${splashRect.height}px`;
    movingLogo.style.fontSize = window.getComputedStyle(splashLogo).fontSize;
    movingLogo.style.lineHeight = window.getComputedStyle(splashLogo).lineHeight;
    movingLogo.style.transformOrigin = "top left";
    
    const scaleX = navbarRect.width / splashRect.width;
    const scaleY = navbarRect.height / splashRect.height;
    // Use average scale or just scaleX assuming aspect ratio is roughly maintained
    const scale = navbarRect.width / splashRect.width;

    splashBrand.style.opacity = "0";
    splashBrand.style.transition = "opacity 0.25s ease";

    document.body.appendChild(movingLogo);

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            movingLogo.style.left = `${navbarRect.left}px`;
            movingLogo.style.top = `${navbarRect.top}px`;
            movingLogo.style.transform = `scale(${scale})`;
            movingLogo.style.opacity = "0";
        });
    });

    window.setTimeout(() => {
        movingLogo.remove();
    }, 1100);
}

function startSplashSequence() {
    if (!splash) {
        return;
    }

    randomSplashOffset();
    document.body.classList.add("splash-active");

    window.setTimeout(() => {
        animateSplashLogoToNavbar();
        splash.classList.add("hide");
        document.body.classList.remove("splash-active");
        document.body.classList.add("splash-complete");
    }, 4000);
}

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

function setActiveElement(targetCard) {
    const cards = table.querySelectorAll(".element");
    const legends = table.querySelectorAll(".legend-item");

    table.classList.add("is-filtering");

    cards.forEach((card) => {
        card.classList.toggle("is-match", card === targetCard);
    });

    legends.forEach((item) => {
        item.classList.remove("is-active");
    });
}

function openElementDetail(symbol) {
    window.location.href = `element.htm?symbol=${encodeURIComponent(symbol)}`;
}

table.addEventListener("mouseover", (event) => {
    const legend = event.target.closest(".legend-item");
    const card = event.target.closest(".element");

    if (legend) {
        setActiveType(legend.dataset.filter);
    } else if (card) {
        setActiveElement(card);
    } else {
        setActiveType("");
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

const searchInput = document.getElementById("search-input");
if (searchInput) {
    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.toLowerCase().trim();
        const cards = table.querySelectorAll(".element");

        if (!query) {
            table.classList.remove("is-searching");
            cards.forEach(card => card.classList.remove("is-search-match"));
            return;
        }

        table.classList.add("is-searching");

        cards.forEach((card) => {
            const symbol = card.dataset.symbol.toLowerCase();
            const name = card.querySelector(".name").textContent.toLowerCase();
            const number = card.querySelector(".number").textContent.toLowerCase();
            
            const isMatch = name.includes(query) || symbol.includes(query) || number === query;
            card.classList.toggle("is-search-match", isMatch);
        });
    });
}

if (!sessionStorage.getItem("nukoSplashShown")) {
    startSplashSequence();
    sessionStorage.setItem("nukoSplashShown", "true");
} else {
    if (splash) splash.style.display = "none";
    document.body.classList.add("splash-complete");
}
