const svgContainer = document.getElementById('svg-container');
const svgElement = document.getElementById('svg-element');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const resetBtn = document.getElementById('reset');

let scale = 1;
let panning = false;
let pointX = 0;
let pointY = 0;
let start = { x: 0, y: 0 };

function setTransform() {
    svgElement.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
}

function animateTransform(targetScale, targetX, targetY, duration = 300) {
    const startScale = scale;
    const startX = pointX;
    const startY = pointY;
    const startTime = Date.now();

    function animate() {
        const currentTime = Date.now();
        const progress = Math.min((currentTime - startTime) / duration, 1);

        scale = startScale + (targetScale - startScale) * progress;
        pointX = startX + (targetX - startX) * progress;
        pointY = startY + (targetY - startY) * progress;

        setTransform();

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

function limitPan() {
    const containerRect = svgContainer.getBoundingClientRect();
    const svgRect = svgElement.getBoundingClientRect();

    const maxX = Math.max(0, (svgRect.width - containerRect.width) / 2);
    const maxY = Math.max(0, (svgRect.height - containerRect.height) / 2);

    pointX = Math.min(Math.max(pointX, -maxX), maxX);
    pointY = Math.min(Math.max(pointY, -maxY), maxY);
}

zoomInBtn.addEventListener('click', () => {
    const targetScale = Math.min(scale * 1.2, 5);
    animateTransform(targetScale, pointX, pointY);
});

zoomOutBtn.addEventListener('click', () => {
    const targetScale = Math.max(scale / 1.2, 0.5);
    animateTransform(targetScale, pointX, pointY);
});

resetBtn.addEventListener('click', () => {
    animateTransform(1, 0, 0);
});

svgContainer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    panning = true;
    start = { x: e.clientX - pointX, y: e.clientY - pointY };
});

svgContainer.addEventListener('mousemove', (e) => {
    if (!panning) return;
    pointX = e.clientX - start.x;
    pointY = e.clientY - start.y;
    limitPan();
    setTransform();
});

svgContainer.addEventListener('mouseup', () => {
    panning = false;
});

svgContainer.addEventListener('mouseleave', () => {
    panning = false;
});

svgContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        panning = true;
        start = { x: e.touches[0].clientX - pointX, y: e.touches[0].clientY - pointY };
    }
});

svgContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && panning) {
        pointX = e.touches[0].clientX - start.x;
        pointY = e.touches[0].clientY - start.y;
        limitPan();
        setTransform();
    } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

        if (!this.lastDist) {
            this.lastDist = dist;
            return;
        }

        const delta = dist - this.lastDist;
        const newScale = Math.min(Math.max(scale * (1 + delta * 0.01), 0.5), 5);
        animateTransform(newScale, pointX, pointY, 100);

        this.lastDist = dist;
    }
});

svgContainer.addEventListener('touchend', () => {
    panning = false;
    this.lastDist = null;
});

svgContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(scale * (1 + delta), 0.5), 5);
    animateTransform(newScale, pointX, pointY, 100);
});
