const columns = 40;
const rows = 40;
const pointer = { x: null, y: null };

const activate = event => {
    const target = event.target;
    if (!target || !target.dataset || target.dataset.x === undefined) return;

    const x = Number(target.dataset.x);
    const y = Number(target.dataset.y);
    target.dataset.color = 100;

    divs.filter(div => div !== target).forEach(div => {
        const distance = Math.hypot(div.dataset.x - x, div.dataset.y - y);
        if (distance >= 12) return;

        div.dataset.color = Math.max(
            (12 - distance) * (Math.random() * 0.4 + 0.6) * 4,
            div.dataset.color
        );

        if (div.dataset.color > 100) div.dataset.color = 100;
    });
};

let lastTime;
const step = time => {
    lastTime ??= time;

    if (time !== lastTime) {
        divs.filter(div => div.dataset.color > 0).forEach(div => {
            div.dataset.color -= (time - lastTime) / 20;
            if (div.dataset.color < 0) div.dataset.color = 0;

            div.style.backgroundColor = `hsl(0, 0%, ${div.dataset.color}%)`;
            div.style.borderWidth = `${-(div.dataset.color - 100) / 200}rem`;
        });
    }

    lastTime = time;
    requestAnimationFrame(step);
};

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

const divs = Array.from(document.getElementsByTagName('div'));

addEventListener('pointermove', event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
});

addEventListener('pointerleave', () => {
    pointer.x = null;
    pointer.y = null;
});

const pollCursor = () => {
    if (pointer.x === null || pointer.y === null) return;
    const element = document.elementFromPoint(pointer.x, pointer.y);
    if (element instanceof HTMLElement && element.dataset?.x !== undefined) {
        activate({ target: element });
    }
};

setInterval(pollCursor, 1000 / 120);

addEventListener('touchmove', event => {
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) return;
    pointer.x = touch.clientX;
    pointer.y = touch.clientY;
    const element = document.elementFromPoint(pointer.x, pointer.y);
    if (element instanceof HTMLElement) element.click();
}, { passive: false });

requestAnimationFrame(step);
