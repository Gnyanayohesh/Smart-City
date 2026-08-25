// Smart City Cleanliness Reporting System - Client-side Scripts & Cursor Effects

document.addEventListener('DOMContentLoaded', function () {
    // 1. Geolocation Helper
    var btn = document.getElementById('geoBtn') || document.getElementById('useLocationBtn');
    if (btn) {
        btn.addEventListener('click', function () {
            var status = document.getElementById('geoStatus') || document.getElementById('locStatus');
            if (!navigator.geolocation) {
                if (status) status.textContent = 'Geolocation is not supported by your browser.';
                return;
            }
            if (status) status.textContent = 'Fetching location...';
            navigator.geolocation.getCurrentPosition(function (pos) {
                var latInput = document.getElementById('latitude');
                var lngInput = document.getElementById('longitude');
                if (latInput) latInput.value = pos.coords.latitude;
                if (lngInput) lngInput.value = pos.coords.longitude;
                if (status) status.textContent = '✅ Location captured (' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4) + ')';
            }, function (err) {
                if (status) status.textContent = 'Could not fetch location: ' + err.message;
            });
        });
    }

    // 2. React Bits <TextCursor /> Integration (Broom 🧹 Trail)
    initBroomCursor();
});

function initBroomCursor() {
    const text = '🧹';
    const spacing = 45;
    const maxPoints = 8;
    const exitDuration = 350; // ms
    const removalInterval = 30; // ms
    const followMouseDirection = true;
    const randomFloat = true;

    let trail = [];
    let lastMoveTime = Date.now();
    let idCounter = 0;

    const container = document.createElement('div');
    container.className = 'text-cursor-container';
    container.innerHTML = '<div class="text-cursor-inner"></div>';
    document.body.appendChild(container);
    const inner = container.querySelector('.text-cursor-inner');

    function createRandomData() {
        if (!randomFloat) return { rx: 0, ry: 0, rr: 0 };
        return {
            rx: Math.random() * 8 - 4,
            ry: Math.random() * 8 - 4,
            rr: Math.random() * 12 - 6
        };
    }

    function addPoint(x, y, angle) {
        const rand = createRandomData();
        const id = 'tc_' + (idCounter++);
        const el = document.createElement('div');
        el.id = id;
        el.className = 'text-cursor-item';
        el.textContent = text;
        el.style.left = (x + rand.rx) + 'px';
        el.style.top = (y + rand.ry) + 'px';
        el.style.transform = `translate(-50%, -50%) rotate(${angle + rand.rr}deg) scale(1)`;
        el.style.opacity = '1';
        el.style.transition = `opacity ${exitDuration}ms ease-out, transform ${exitDuration}ms ease-out`;
        inner.appendChild(el);

        trail.push({ id, el, x, y, angle, time: Date.now() });

        if (trail.length > maxPoints) {
            removePoint(trail.shift());
        }
    }

    function removePoint(item) {
        if (!item || !item.el) return;
        item.el.style.opacity = '0';
        item.el.style.transform += ' scale(0.2)';
        setTimeout(() => {
            if (item.el && item.el.parentNode) {
                item.el.parentNode.removeChild(item.el);
            }
        }, exitDuration);
    }

    window.addEventListener('mousemove', function (e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        if (trail.length === 0) {
            addPoint(mouseX, mouseY, 0);
        } else {
            const last = trail[trail.length - 1];
            const dx = mouseX - last.x;
            const dy = mouseY - last.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance >= spacing) {
                const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
                const angle = followMouseDirection ? rawAngle : 0;
                const steps = Math.floor(distance / spacing);

                for (let i = 1; i <= steps; i++) {
                    const t = (spacing * i) / distance;
                    addPoint(last.x + dx * t, last.y + dy * t, angle);
                }
            }
        }
        lastMoveTime = Date.now();
    });

    setInterval(function () {
        if (Date.now() - lastMoveTime > 75 && trail.length > 0) {
            removePoint(trail.shift());
        }
    }, removalInterval);
}
