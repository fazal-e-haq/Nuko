const DETAIL_ROOT = document.getElementById("element-detail");
const DATASET_URL = "https://raw.githubusercontent.com/Bluegrams/periodic-table-data/master/Periodica.Data/Data/ElementData.csv";

const CATEGORY_LABELS = {
    0: "Nonmetal",
    1: "Alkali Metal",
    2: "Alkaline Earth Metal",
    3: "Transition Metal",
    4: "Post-Transition Metal",
    5: "Metalloid",
    6: "Halogen",
    7: "Noble Gas",
    8: "Lanthanide",
    9: "Actinide"
};

const STATE_LABELS = {
    0: "Gas",
    1: "Liquid",
    2: "Solid"
};

function getSelectedElement() {
    const params = new URLSearchParams(window.location.search);
    const symbol = params.get("symbol");
    const number = Number(params.get("number"));

    if (symbol) {
        return elements.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase()) || null;
    }

    if (!Number.isNaN(number)) {
        return elements.find((item) => item.number === number) || null;
    }

    return elements[0] || null;
}

function parseCsvRow(row) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < row.length; index += 1) {
        const char = row[index];
        const next = row[index + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === "," && !inQuotes) {
            values.push(current);
            current = "";
            continue;
        }

        current += char;
    }

    values.push(current);
    return values;
}

function parseCsv(text) {
    const rows = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const next = text[index + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {
            if (current.trim()) {
                rows.push(parseCsvRow(current));
            }

            current = "";

            if (char === "\r" && next === "\n") {
                index += 1;
            }

            continue;
        }

        current += char;
    }

    if (current.trim()) {
        rows.push(parseCsvRow(current));
    }

    const [header, ...dataRows] = rows;
    return dataRows.map((row) => Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])));
}

function formatValue(value, suffix = "") {
    if (value === undefined || value === null || value === "" || value === "unknown") {
        return "Not recorded yet";
    }

    return `${value}${suffix}`;
}

function shellLevels(configuration) {
    if (!configuration) {
        return [];
    }

    return configuration
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item && item !== "0")
        .map((item) => Number(item))
        .filter((item) => !Number.isNaN(item));
}

function generateShellSvg(levels) {
    const rings = levels.length ? levels : [2];
    const center = 110;
    const baseRadius = 22;
    const radiusStep = 18;
    const electronRadius = 3.2;

    const circles = rings.map((count, index) => {
        const radius = baseRadius + index * radiusStep;
        const electrons = Array.from({ length: Math.min(count, 18) }, (_, electronIndex) => {
            const angle = (Math.PI * 2 * electronIndex) / Math.max(count, 1);
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${electronRadius}" fill="#1e708f" />`;
        }).join("");

        return `
            <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="rgba(31, 111, 152, 0.2)" stroke-width="1.8" />
            ${electrons}
        `;
    }).join("");

    return `
        <svg class="atom-svg" viewBox="0 0 220 220" role="img" aria-label="Electron shell diagram">
            <defs>
                <radialGradient id="nucleus-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#ffd8a8" />
                    <stop offset="100%" stop-color="#ff9f5a" />
                </radialGradient>
            </defs>
            <rect x="0" y="0" width="220" height="220" rx="28" fill="rgba(245, 250, 252, 0.85)" />
            ${circles}
            <circle cx="${center}" cy="${center}" r="15" fill="url(#nucleus-glow)" />
        </svg>
    `;
}

function createPropertyItem(label, value) {
    return `
        <div class="property-item">
            <span>${label}</span>
            <strong>${value}</strong>
        </div>
    `;
}

function createEmptyState(title, text) {
    return `
        <div class="empty-state">
            <div class="empty-state-copy">
                <strong>${title}</strong>
                <p>${text}</p>
            </div>
        </div>
    `;
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}

async function fetchText(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.text();
}

async function fetchWikiSummary(name) {
    try {
        return await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    } catch (error) {
        return null;
    }
}

async function fetchWikiImages(name) {
    try {
        const data = await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(name)}`);
        if (!data || !data.items) return [];

        const images = data.items
            .filter(item => item.type === "image")
            .filter(item => {
                const title = item.title.toLowerCase();
                return !title.includes(".svg") && 
                       !title.includes("logo") && 
                       !title.includes("icon") &&
                       !title.includes("electron") &&
                       !title.includes("atom");
            })
            .map(item => {
                // Get the highest resolution available in srcset, or fallback to original
                const sources = item.srcset || [];
                let src = "";
                if (sources.length > 0) {
                    src = sources[sources.length - 1].src;
                } else if (item.original && item.original.source) {
                    src = item.original.source;
                }
                
                if (src && src.startsWith("//")) {
                    src = "https:" + src;
                }
                return src;
            })
            .filter(Boolean);

        return [...new Set(images)].slice(0, 4);
    } catch (error) {
        return [];
    }
}

async function fetchWikiSectionText(name, matchers) {
    try {
        const sectionsData = await fetchJson(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(name)}&prop=sections&format=json&origin=*`);
        const sections = sectionsData.parse?.sections || [];
        const match = sections.find((section) => matchers.some((pattern) => pattern.test(section.line)));

        if (!match) {
            return "";
        }

        const sectionData = await fetchJson(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(name)}&prop=text&section=${match.index}&format=json&origin=*`);
        const html = sectionData.parse?.text?.["*"] || "";
        const temp = document.createElement("div");
        temp.innerHTML = html;

        const paragraphs = Array.from(temp.querySelectorAll("p"))
            .map((node) => node.textContent.replace(/\[\d+]/g, "").trim())
            .filter(Boolean);

        return paragraphs.slice(0, 2).join(" ");
    } catch (error) {
        return "";
    }
}

function buildFallbackUses(elementInfo, summaryText) {
    if (summaryText) {
        return summaryText;
    }

    const category = elementInfo.categoryLabel.toLowerCase();

    if (category.includes("alkali")) {
        return `${elementInfo.name} is commonly associated with reactive chemical processes, energy-storage materials, and laboratory or industrial compounds.`;
    }

    if (category.includes("transition")) {
        return `${elementInfo.name} is valued in alloys, advanced manufacturing, catalysts, and high-performance industrial systems.`;
    }

    if (category.includes("noble gas")) {
        return `${elementInfo.name} is often used where inert atmospheres, lighting, imaging, or cryogenic performance are important.`;
    }

    if (category.includes("halogen")) {
        return `${elementInfo.name} is widely used in chemistry, sanitation, specialty materials, and compound production.`;
    }

    return `${elementInfo.name} plays an important role in science, industry, and material applications connected to its chemical behavior.`;
}

function buildFallbackOccurrence(elementInfo) {
    const crust = formatValue(elementInfo.dataset.AbundanceCrust, " mg/kg");
    const universe = formatValue(elementInfo.dataset.AbundanceUniverse, " %");
    const state = elementInfo.stateLabel;

    return `${elementInfo.name} is encountered in nature according to its chemistry and reactivity. In standard conditions it is typically classified as ${state.toLowerCase()}. Reported abundance is ${crust} in Earth's crust and ${universe} in the universe.`;
}

function buildFallbackDiscovery(elementInfo) {
    const year = formatValue(elementInfo.dataset.Discovery);
    const discoveredBy = formatValue(elementInfo.dataset.DiscoveredBy);

    return `${elementInfo.name} is credited to ${discoveredBy} in ${year}. This gives the main discovery reference even when a longer historical note is not available.`;
}

function renderElementDetail(elementInfo, wiki) {
    const shells = shellLevels(elementInfo.dataset.ShellConfiguration);
    const shellText = shells.length ? shells.join(" / ") : "Not recorded yet";
    const summaryText = wiki.summary?.extract || `${elementInfo.name} is a chemical element in the periodic table.`;
    const imageUrl = wiki.summary?.originalimage?.source || wiki.summary?.thumbnail?.source || "";
    const usesText = wiki.uses || buildFallbackUses(elementInfo, summaryText);
    const occurrenceText = wiki.occurrence || buildFallbackOccurrence(elementInfo);
    const discoveryText = wiki.history || buildFallbackDiscovery(elementInfo);

    const allImages = [...new Set([imageUrl, ...(wiki.images || [])])].filter(Boolean).slice(0, 4);
    const imagesHtml = allImages.length > 0
        ? `<div class="photo-gallery">
            ${allImages.map(src => `<div class="gallery-item"><img src="${src}" alt="Picture of ${elementInfo.name}" loading="lazy" /></div>`).join("")}
           </div>`
        : createEmptyState("Image coming soon", `${elementInfo.name} does not have featured images available right now.`);

    DETAIL_ROOT.innerHTML = `
        <aside class="detail-visuals">
            <article class="visual-card hero-visual">
                <div class="hero-content">
                    <div class="hero-topline">
                        <span>No. ${elementInfo.number}</span>
                        <span>${elementInfo.categoryLabel}</span>
                    </div>
                    <div>
                        <div class="hero-symbol">${elementInfo.symbol}</div>
                        <div class="hero-name">${elementInfo.name}</div>
                    </div>
                </div>
                <div class="visual-footer">
                    <div class="hero-metrics">
                        <span class="hero-chip">${elementInfo.stateLabel}</span>
                        <span class="hero-chip">Group ${formatValue(elementInfo.dataset.Group)}</span>
                        <span class="hero-chip">Period ${formatValue(elementInfo.dataset.Period)}</span>
                    </div>
                </div>
            </article>

            <article class="visual-card photo-card">
                ${imagesHtml}
            </article>

            <article class="visual-card atom-card">
                <span class="visual-label">Energy Levels</span>
                ${generateShellSvg(shells)}
                <div class="visual-label">Shell distribution: ${shellText}</div>
            </article>
        </aside>

        <section class="detail-panel">
            <div class="detail-scroll">
                <div class="detail-header">
                    <div class="detail-title">
                        <h2>${elementInfo.name}</h2>
                        <p>${summaryText}</p>
                    </div>
                    <div class="detail-badge">${elementInfo.symbol}</div>
                </div>

                <div class="facts-grid">
                    <div class="fact-card"><span>Atomic Number</span><strong>${elementInfo.number}</strong></div>
                    <div class="fact-card"><span>Atomic Mass</span><strong>${formatValue(elementInfo.dataset.AtomicMass || elementInfo.mass)}</strong></div>
                    <div class="fact-card"><span>Atomic Weight</span><strong>${formatValue(elementInfo.mass)}</strong></div>
                    <div class="fact-card"><span>Energy Levels</span><strong>${shellText}</strong></div>
                </div>

                <div class="detail-sections">
                    <article class="detail-block">
                        <h3>Quick Profile</h3>
                        <div class="property-grid">
                            ${createPropertyItem("Symbol", elementInfo.symbol)}
                            ${createPropertyItem("Category", elementInfo.categoryLabel)}
                            ${createPropertyItem("Standard State", elementInfo.stateLabel)}
                            ${createPropertyItem("Electron Configuration", formatValue(elementInfo.dataset.Configuration))}
                            ${createPropertyItem("Group", formatValue(elementInfo.dataset.Group))}
                            ${createPropertyItem("Period", formatValue(elementInfo.dataset.Period))}
                            ${createPropertyItem("Block", formatValue(elementInfo.dataset.Block))}
                            ${createPropertyItem("Oxidation States", formatValue(elementInfo.dataset.OxidationStates))}
                        </div>
                    </article>

                    <article class="detail-block">
                        <h3>Physical Properties</h3>
                        <div class="property-grid">
                            ${createPropertyItem("Density", formatValue(elementInfo.dataset.Density, " g/cm3"))}
                            ${createPropertyItem("Melting Point", formatValue(elementInfo.dataset.MeltingPoint, " K"))}
                            ${createPropertyItem("Boiling Point", formatValue(elementInfo.dataset.BoilingPoint, " K"))}
                            ${createPropertyItem("Atomic Radius", formatValue(elementInfo.dataset.AtomicRadius, " pm"))}
                            ${createPropertyItem("Covalent Radius", formatValue(elementInfo.dataset.CovalentRadius, " pm"))}
                            ${createPropertyItem("Van der Waals Radius", formatValue(elementInfo.dataset.VanDerWaalsRadius, " pm"))}
                            ${createPropertyItem("Electronegativity", formatValue(elementInfo.dataset.Electronegativity))}
                            ${createPropertyItem("Ionization Energy", formatValue(elementInfo.dataset.IonizationEnergy, " kJ/mol"))}
                        </div>
                    </article>

                    <article class="detail-block">
                        <h3>Discovery</h3>
                        <p>${discoveryText}</p>
                    </article>

                    <article class="detail-block">
                        <h3>Where It Is Found</h3>
                        <p>${occurrenceText}</p>
                    </article>

                    <article class="detail-block">
                        <h3>Uses and Importance</h3>
                        <p>${usesText}</p>
                    </article>

                    <article class="detail-block">
                        <h3>More Details</h3>
                        <div class="property-grid">
                            ${createPropertyItem("Electron Affinity", formatValue(elementInfo.dataset.ElectronAffinity, " kJ/mol"))}
                            ${createPropertyItem("Thermal Conductivity", formatValue(elementInfo.dataset.ThermalConductivity, " W/(m·K)"))}
                            ${createPropertyItem("Heat Capacity", formatValue(elementInfo.dataset.HeatCapacity, " J/(g·K)"))}
                            ${createPropertyItem("Heat of Fusion", formatValue(elementInfo.dataset.HeatOfFusion, " kJ/mol"))}
                            ${createPropertyItem("Heat of Vaporization", formatValue(elementInfo.dataset.HeatOfVaporization, " kJ/mol"))}
                            ${createPropertyItem("Abundance in Crust", formatValue(elementInfo.dataset.AbundanceCrust, " mg/kg"))}
                            ${createPropertyItem("Abundance in Universe", formatValue(elementInfo.dataset.AbundanceUniverse, " %"))}
                            ${createPropertyItem("Radioactive", elementInfo.dataset.Radioactive === "1" ? "Yes" : "No")}
                        </div>
                    </article>
                </div>
            </div>
        </section>
    `;
}

function normalizeDatasetRow(row) {
    return {
        ...row,
        CategoryLabel: CATEGORY_LABELS[row.Category] || row.Category || "Unknown",
        StateLabel: STATE_LABELS[row.StandardState] || row.StandardState || "Unknown"
    };
}

async function loadElementDataset(symbol) {
    try {
        const csv = await fetchText(DATASET_URL);
        const parsed = parseCsv(csv).map(normalizeDatasetRow);
        return parsed.find((item) => item.Symbol.toLowerCase() === symbol.toLowerCase()) || null;
    } catch (error) {
        return null;
    }
}

async function initElementDetail() {
    const selected = getSelectedElement();

    if (!selected) {
        DETAIL_ROOT.innerHTML = `
            <div class="detail-error">
                <div class="detail-error-panel">
                    <h2>Element not found</h2>
                    <p>The detail page could not match that element yet. Head back to the periodic table and choose another element.</p>
                    <a href="index.htm">Back to Periodic Table</a>
                </div>
            </div>
        `;
        return;
    }

    const datasetRow = await loadElementDataset(selected.symbol);

    const dataset = datasetRow || {
        AtomicMass: selected.mass,
        Configuration: "",
        ShellConfiguration: "",
        CategoryLabel: selected.type,
        StateLabel: "Unknown",
        Group: "",
        Period: "",
        Block: "",
        Density: "",
        MeltingPoint: "",
        BoilingPoint: "",
        AtomicRadius: "",
        CovalentRadius: "",
        VanDerWaalsRadius: "",
        Electronegativity: "",
        OxidationStates: "",
        IonizationEnergy: "",
        ElectronAffinity: "",
        ThermalConductivity: "",
        HeatCapacity: "",
        HeatOfFusion: "",
        HeatOfVaporization: "",
        AbundanceCrust: "",
        AbundanceUniverse: "",
        Discovery: "",
        DiscoveredBy: "",
        Radioactive: "0"
    };

    const categoryLabel = dataset.CategoryLabel || selected.type.replace(/\b\w/g, (letter) => letter.toUpperCase());
    const stateLabel = dataset.StateLabel || "Unknown";

    const [summary, history, occurrence, uses, images] = await Promise.all([
        fetchWikiSummary(selected.name),
        fetchWikiSectionText(selected.name, [/^history/i, /^discovery/i, /^history and naming/i]),
        fetchWikiSectionText(selected.name, [/^occurrence/i, /^natural occurrence/i, /^occurrence and production/i]),
        fetchWikiSectionText(selected.name, [/^uses/i, /^applications/i, /^production/i, /^characteristics/i]),
        fetchWikiImages(selected.name)
    ]);

    renderElementDetail(
        {
            ...selected,
            dataset,
            categoryLabel,
            stateLabel
        },
        {
            summary,
            history,
            occurrence,
            uses,
            images
        }
    );
}

initElementDetail();
