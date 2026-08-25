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

    // 2. React Bits <SoftAurora /> Integration
    initSoftAurora('auroraBg');

    // 3. React Bits <TextCursor /> Integration (Broom 🧹 Trail)
    initBroomCursor();
});

function initSoftAurora(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vsSource = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
            vUv = (position + 1.0) * 0.5;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fsSource = `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uSpeed;
        uniform float uScale;
        uniform float uBrightness;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uNoiseFreq;
        uniform float uNoiseAmp;
        uniform float uBandHeight;
        uniform float uBandSpread;
        uniform float uOctaveDecay;
        uniform float uLayerOffset;
        uniform float uColorSpeed;
        uniform vec2 uMouse;
        uniform float uMouseInfluence;

        #define TAU 6.28318530718

        vec3 gradientHash(vec3 p) {
            p = vec3(
                dot(p, vec3(127.1, 311.7, 234.6)),
                dot(p, vec3(269.5, 183.3, 198.3)),
                dot(p, vec3(169.5, 283.3, 156.9))
            );
            vec3 h = fract(sin(p) * 43758.5453123);
            float phi = acos(2.0 * h.x - 1.0);
            float theta = TAU * h.y;
            return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
        }

        float quinticSmooth(float t) {
            float t2 = t * t;
            float t3 = t * t2;
            return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
        }

        vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
            return a + b * cos(TAU * (c * t + d));
        }

        float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
            float x = px * frequency;
            float y = py * frequency;

            float fx = floor(x); float fy = floor(y); float fz = floor(pz);
            float cx = ceil(x);  float cy = ceil(y);  float cz = ceil(pz);

            vec3 g000 = gradientHash(vec3(fx, fy, fz));
            vec3 g100 = gradientHash(vec3(cx, fy, fz));
            vec3 g010 = gradientHash(vec3(fx, cy, fz));
            vec3 g110 = gradientHash(vec3(cx, cy, fz));
            vec3 g001 = gradientHash(vec3(fx, fy, cz));
            vec3 g101 = gradientHash(vec3(cx, fy, cz));
            vec3 g011 = gradientHash(vec3(fx, cy, cz));
            vec3 g111 = gradientHash(vec3(cx, cy, cz));

            float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
            float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
            float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
            float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
            float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
            float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
            float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
            float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

            float sx = quinticSmooth(x - fx);
            float sy = quinticSmooth(y - fy);
            float sz = quinticSmooth(pz - fz);

            float lx00 = mix(d000, d100, sx);
            float lx10 = mix(d010, d110, sx);
            float lx01 = mix(d001, d101, sx);
            float lx11 = mix(d011, d111, sx);

            float ly0 = mix(lx00, lx10, sy);
            float ly1 = mix(lx01, lx11, sy);

            return amplitude * mix(ly0, ly1, sz);
        }

        float auroraGlow(float t, vec2 shift) {
            vec2 uv = gl_FragCoord.xy / uResolution.y;
            uv += shift;

            float noiseVal = 0.0;
            float freq = uNoiseFreq;
            float amp = uNoiseAmp;
            vec2 samplePos = uv * uScale;

            for (float i = 0.0; i < 3.0; i += 1.0) {
                noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
                amp *= uOctaveDecay;
                freq *= 2.0;
            }

            float yBand = uv.y * 10.0 - uBandHeight * 10.0;
            return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * abs(noiseVal + yBand))), 0.0);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            float t = uSpeed * 0.4 * uTime;

            vec2 shift = (uMouse - 0.5) * uMouseInfluence;

            vec3 col = vec3(0.0);
            col += 0.99 * auroraGlow(t, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.2 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)) * uColor1;
            col += 0.99 * auroraGlow(t + uLayerOffset, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.1 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)) * uColor2;

            col *= uBrightness;
            float alpha = clamp(length(col), 0.0, 0.85);
            gl_FragColor = vec4(col, alpha);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uSpeed = gl.getUniformLocation(program, 'uSpeed');
    const uScale = gl.getUniformLocation(program, 'uScale');
    const uBrightness = gl.getUniformLocation(program, 'uBrightness');
    const uColor1 = gl.getUniformLocation(program, 'uColor1');
    const uColor2 = gl.getUniformLocation(program, 'uColor2');
    const uNoiseFreq = gl.getUniformLocation(program, 'uNoiseFreq');
    const uNoiseAmp = gl.getUniformLocation(program, 'uNoiseAmp');
    const uBandHeight = gl.getUniformLocation(program, 'uBandHeight');
    const uBandSpread = gl.getUniformLocation(program, 'uBandSpread');
    const uOctaveDecay = gl.getUniformLocation(program, 'uOctaveDecay');
    const uLayerOffset = gl.getUniformLocation(program, 'uLayerOffset');
    const uColorSpeed = gl.getUniformLocation(program, 'uColorSpeed');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uMouseInfluence = gl.getUniformLocation(program, 'uMouseInfluence');

    function hexToRgb(hex) {
        const h = hex.replace('#', '');
        return [
            parseInt(h.slice(0, 2), 16) / 255,
            parseInt(h.slice(2, 4), 16) / 255,
            parseInt(h.slice(4, 6), 16) / 255
        ];
    }

    gl.uniform1f(uSpeed, 0.6);
    gl.uniform1f(uScale, 1.5);
    gl.uniform1f(uBrightness, 1.25);
    gl.uniform3fv(uColor1, hexToRgb('#2ba86f')); // Emerald Clean Green
    gl.uniform3fv(uColor2, hexToRgb('#e6a417')); // Smart City Amber/Gold
    gl.uniform1f(uNoiseFreq, 2.5);
    gl.uniform1f(uNoiseAmp, 1.0);
    gl.uniform1f(uBandHeight, 0.5);
    gl.uniform1f(uBandSpread, 1.2);
    gl.uniform1f(uOctaveDecay, 0.1);
    gl.uniform1f(uLayerOffset, 0.0);
    gl.uniform1f(uColorSpeed, 1.0);
    gl.uniform1f(uMouseInfluence, 0.25);

    let mouseX = 0.5, mouseY = 0.5;
    let targetMouseX = 0.5, targetMouseY = 0.5;

    window.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        targetMouseX = (e.clientX - rect.left) / rect.width;
        targetMouseY = 1.0 - (e.clientY - rect.top) / rect.height;
    });

    function resize() {
        const w = container.offsetWidth || window.innerWidth;
        const h = container.offsetHeight || 400;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uResolution, w, h);
    }
    window.addEventListener('resize', resize);
    resize();

    function render(now) {
        requestAnimationFrame(render);
        gl.uniform1f(uTime, now * 0.001);
        mouseX += 0.05 * (targetMouseX - mouseX);
        mouseY += 0.05 * (targetMouseY - mouseY);
        gl.uniform2f(uMouse, mouseX, mouseY);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(render);
}

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
