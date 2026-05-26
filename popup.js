const pointer = { x: null, y: null };
let divs = [];
let columns = 40;
let rows = 40;

const activate = event => {
    const target = event.target;
    if (!target || !target.dataset || target.dataset.x === undefined) return;

    const x = Number(target.dataset.x);
    const y = Number(target.dataset.y);
    target.dataset.color = 100;

    const radius = Math.max(10, Math.min(16, Math.sqrt(columns * rows) / 4));

    divs.forEach(div => {
        if (div === target) return;

        const distance = Math.hypot(
            div.dataset.x - x,
            div.dataset.y - y
        );

        if (distance >= radius) return;

        div.dataset.color = Math.max(
            (radius - distance) * (Math.random() * 0.45 + 0.55) * 4,
            div.dataset.color
        );

        if (div.dataset.color > 100) div.dataset.color = 100;
    });
};

const createGrid = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const targetCell = Math.round(Math.max(18, Math.min(26, Math.min(width, height) / 28)));
    const nextCols = Math.max(20, Math.floor(width / targetCell));
    const nextRows = Math.max(20, Math.floor(height / targetCell));

    if (nextCols === columns && nextRows === rows && divs.length) return;

    columns = nextCols;
    rows = nextRows;
    document.documentElement.style.setProperty('--cols', columns);
    document.documentElement.style.setProperty('--rows', rows);

    document.body.innerHTML = '';
    divs = [];

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const div = document.createElement('div');

            div.dataset.color = 0;
            div.dataset.x = x;
            div.dataset.y = y;

            div.addEventListener('click', activate);
            document.body.appendChild(div);
        }
    }

    divs = Array.from(document.getElementsByTagName('div'));
};

let lastTime;
const step = time => {
    lastTime ??= time;

    if (time !== lastTime) {
        divs.forEach(div => {
            if (div.dataset.color <= 0) return;

            div.dataset.color -= (time - lastTime) / 22;
            if (div.dataset.color < 0) div.dataset.color = 0;

            div.style.backgroundColor = `hsl(0, 0%, ${Math.max(4, Math.min(100, div.dataset.color))}%)`;
            div.style.borderWidth = `${0.04 + (100 - div.dataset.color) / 240}rem`;
        });
    }

    lastTime = time;
    requestAnimationFrame(step);
};

const pollCursor = () => {
    if (pointer.x === null || pointer.y === null) return;

    const element = document.elementFromPoint(pointer.x, pointer.y);
    if (element instanceof HTMLElement && element.dataset && element.dataset.x !== undefined) {
        activate({ target: element });
    }
};

window.addEventListener('pointermove', event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
});

window.addEventListener('pointerleave', () => {
    pointer.x = null;
    pointer.y = null;
});

window.addEventListener('touchmove', event => {
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) return;

    pointer.x = touch.clientX;
    pointer.y = touch.clientY;
    const element = document.elementFromPoint(pointer.x, pointer.y);
    if (element instanceof HTMLElement && element.dataset && element.dataset.x !== undefined) {
        activate({ target: element });
    }
}, { passive: false });

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(createGrid, 120);
});

createGrid();
setInterval(pollCursor, 1000 / 120);
requestAnimationFrame(step);
