function createElement(el) {
    return `
        <div class="element ${el.type}" style="grid-column:${el.col}; grid-row:${el.row};">
            <span class="number">${el.number}</span>
            <p class="mass">${el.mass}</p>
            <h2 class="symbol">${el.symbol}</h2>
            <p class="name">${el.name}</p>
        </div>
    `;
}

const table = document.getElementById("table");

elements.forEach(el => {
    table.innerHTML += createElement(el);
});