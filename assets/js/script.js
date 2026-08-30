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

    // 2. PillNav Mobile Menu Toggle
    var mobileBtn = document.getElementById('mobileMenuBtn');
    var mobilePopover = document.getElementById('mobileMenuPopover');
    if (mobileBtn && mobilePopover) {
        function toggleMobileMenu(e) {
            if (e) {
                e.stopPropagation();
            }
            var isOpen = mobilePopover.classList.toggle('is-open');
            mobileBtn.classList.toggle('is-open', isOpen);
            mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            mobilePopover.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        }

        mobileBtn.addEventListener('click', toggleMobileMenu);

        // Close on clicking any link inside popover
        var mobileLinks = mobilePopover.querySelectorAll('.mobile-menu-link');
        mobileLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                mobileBtn.classList.remove('is-open');
                mobilePopover.classList.remove('is-open');
                mobileBtn.setAttribute('aria-expanded', 'false');
                mobilePopover.setAttribute('aria-hidden', 'true');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', function (e) {
            if (mobilePopover.classList.contains('is-open')) {
                if (!mobilePopover.contains(e.target) && !mobileBtn.contains(e.target)) {
                    mobileBtn.classList.remove('is-open');
                    mobilePopover.classList.remove('is-open');
                    mobileBtn.setAttribute('aria-expanded', 'false');
                    mobilePopover.setAttribute('aria-hidden', 'true');
                }
            }
        });
    }

    // 3. React Bits <GhostFibers /> Integration (Hero Green Background)
    if (document.getElementById('ghostFibersBg')) {
        initGhostFibers('ghostFibersBg', {
            lineColor: '#140E35',
            glowColor: '#38ef7d',
            speed: 0.25,
            scale: 2.0,
            rotation: 0,
            rotationSpeed: 0.25,
            layers: 5,
            waveAmplitude: 0.018,
            waveFrequency: 3,
            waveSpeed: 0.15,
            layerSpeed: 0.08,
            twist: 0.12,
            twistFrequency: 5,
            twistSpeed: 1.2,
            lineFrequency: 5,
            lineSpacing: 2,
            lineSharpness: 14,
            glowFalloff: 8,
            glowIntensity: 2.2,
            brightness: 2.2,
            blueBoost: 1.25,
            vignette: 0.75,
            grain: 0.05,
            lightMode: false
        });
    } else if (document.getElementById('auroraBg')) {
        initSoftAurora('auroraBg');
    }

    // 4. React Bits <TextCursor /> Integration (Broom 🧹 Trail)
    initBroomCursor();

    // 5. React Bits <ClickSpark /> Integration (Cursor Click Sparks)
    initClickSpark({
        sparkColor: '#e6a417',
        sparkSize: 12,
        sparkRadius: 22,
        sparkCount: 8,
        duration: 450,
        extraScale: 1.1
    });

    // 6. React Bits <TiltedCard /> Integration
    initTiltedCards();
});

function initTiltedCards() {
    const cards = document.querySelectorAll('.tilted-card-figure');
    if (!cards || cards.length === 0) return;

    cards.forEach(card => {
        const inner = card.querySelector('.tilted-card-inner');
        const caption = card.querySelector('.tilted-card-caption');
        const rotateAmplitude = 14;
        const scaleOnHover = 1.05;

        let currentRotX = 0, currentRotY = 0, currentScale = 1;
        let targetRotX = 0, targetRotY = 0, targetScale = 1;
        let lastY = 0, velocityY = 0;
        let mouseX = 0, mouseY = 0;

        card.addEventListener('mouseenter', () => {
            targetScale = scaleOnHover;
            if (caption) caption.style.opacity = '1';
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const offsetX = e.clientX - rect.left - rect.width / 2;
            const offsetY = e.clientY - rect.top - rect.height / 2;

            targetRotX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
            targetRotY = (offsetX / (rect.width / 2)) * rotateAmplitude;

            velocityY = offsetY - lastY;
            lastY = offsetY;

            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            if (caption) {
                caption.style.transform = `translate(${mouseX + 10}px, ${mouseY + 10}px) rotate(${-velocityY * 0.4}deg)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            targetRotX = 0;
            targetRotY = 0;
            targetScale = 1;
            if (caption) caption.style.opacity = '0';
        });

        function updateSpring() {
            currentRotX += 0.08 * (targetRotX - currentRotX);
            currentRotY += 0.08 * (targetRotY - currentRotY);
            currentScale += 0.08 * (targetScale - currentScale);

            if (inner) {
                inner.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`;
            }

            requestAnimationFrame(updateSpring);
        }
        requestAnimationFrame(updateSpring);
    });
}

function initGhostFibers(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) return;

    options = options || {};
    const lineColor = options.lineColor || '#140E35';
    const glowColor = options.glowColor || '#38ef7d';
    const speed = options.speed !== undefined ? options.speed : 0.25;
    const scale = options.scale !== undefined ? options.scale : 2.0;
    const rotation = options.rotation !== undefined ? options.rotation : 0;
    const rotationSpeed = options.rotationSpeed !== undefined ? options.rotationSpeed : 0.25;
    const layers = options.layers !== undefined ? Math.min(Math.max(Math.round(options.layers), 1), 10) : 5;
    const waveAmplitude = options.waveAmplitude !== undefined ? options.waveAmplitude : 0.018;
    const waveFrequency = options.waveFrequency !== undefined ? options.waveFrequency : 3.0;
    const waveSpeed = options.waveSpeed !== undefined ? options.waveSpeed : 0.15;
    const layerSpeed = options.layerSpeed !== undefined ? options.layerSpeed : 0.08;
    const twist = options.twist !== undefined ? options.twist : 0.12;
    const twistFrequency = options.twistFrequency !== undefined ? options.twistFrequency : 5.0;
    const twistSpeed = options.twistSpeed !== undefined ? options.twistSpeed : 1.2;
    const lineFrequency = options.lineFrequency !== undefined ? options.lineFrequency : 5.0;
    const lineSpacing = options.lineSpacing !== undefined ? options.lineSpacing : 2.0;
    const lineSharpness = options.lineSharpness !== undefined ? options.lineSharpness : 14.0;
    const glowFalloff = options.glowFalloff !== undefined ? options.glowFalloff : 8.0;
    const glowIntensity = options.glowIntensity !== undefined ? options.glowIntensity : 2.2;
    const brightness = options.brightness !== undefined ? options.brightness : 2.2;
    const blueBoost = options.blueBoost !== undefined ? options.blueBoost : 1.25;
    const vignette = options.vignette !== undefined ? options.vignette : 0.75;
    const grain = options.grain !== undefined ? options.grain : 0.05;
    const lightMode = options.lightMode ? 1.0 : 0.0;
    const dpr = Math.min(Math.max(options.dpr || (window.devicePixelRatio || 1), 0.5), 2);
    const targetFps = options.fps || 60;

    let canvas = container.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.setAttribute('aria-hidden', 'true');
        container.appendChild(canvas);
    }

    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false }) ||
               canvas.getContext('webgl', { alpha: false, antialias: false }) ||
               canvas.getContext('experimental-webgl');
    if (!gl) {
        console.warn("WebGL not supported for GhostFibers");
        return;
    }

    const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

    function hexToRgb(hex) {
        const value = hex.trim().replace(/^#/, '');
        const normalized = value.length === 3 ? value.replace(/./g, c => c + c) : value;
        const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
        if (!match) return [0.08, 0.05, 0.2];
        return [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255];
    }

    const vsSource = isWebGL2 ? `#version 300 es
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
` : `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

    const fsSource = (isWebGL2 ? `#version 300 es\nprecision highp float;\n` : `precision highp float;\n#define fragColor gl_FragColor\n`) + `
uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uLayers;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uWaveSpeed;
uniform float uLayerSpeed;
uniform float uTwist;
uniform float uTwistFrequency;
uniform float uTwistSpeed;
uniform float uLineFrequency;
uniform float uLineSpacing;
uniform float uLineSharpness;
uniform float uGlowFalloff;
uniform float uGlowIntensity;
uniform float uBrightness;
uniform float uBlueBoost;
uniform float uVignette;
uniform float uGrain;
uniform float uRotationSpeed;
uniform float uLightMode;
uniform vec3 uLineColor;
uniform vec3 uGlowColor;

` + (isWebGL2 ? `out vec4 fragColor;\n` : ``) + `
#define MAX_LAYERS 10

mat2 rotate2d(float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);
  return mat2(cosine, -sine, sine, cosine);
}

float grainHash(vec2 point) {
  point = floor(point);
  float hash = 52.9829189 * fract(dot(point, vec2(0.065, 0.005)));
  return fract(hash);
}

float layeredGrain(vec2 fragmentPixel) {
  vec2 point = mod(fragmentPixel + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 rotated = mat2(0.8, -0.5, 0.5, 0.8) * point;
  float grain = 0.0;
  grain += 0.40 * grainHash(rotated);
  grain += 0.25 * grainHash(rotated * 2.0 + 17.0);
  grain += 0.20 * grainHash(rotated * 4.0 + 47.0);
  grain += 0.10 * grainHash(rotated * 8.0 + 113.0);
  grain += 0.05 * grainHash(rotated * 16.0 + 191.0);
  return grain;
}

void main() {
  vec2 resolution = max(uResolution, vec2(1.0));
  vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
  float time = uTime * uSpeed;
  vec3 backdrop = mix(vec3(0.047, 0.21, 0.145), vec3(1.0), step(0.5, uLightMode));
  vec3 centerTone = max(uLineColor * 0.85567 - uGlowColor * 0.06186, vec3(0.0));
  vec3 cloudTone = uLineColor * 0.19588 + uGlowColor * 0.2268;
  vec2 p = uv;
  p /= max(uScale, 0.05);
  p = rotate2d(radians(uRotation) + time * uRotationSpeed) * p;
  vec3 color = vec3(0.0);
  float fiberField = 0.0;

  for (int index = 0; index < MAX_LAYERS; index++) {
    float fi = float(index) + 1.0;
    if (fi > uLayers) break;

    p += uWaveAmplitude * sin(p.yx * fi * uWaveFrequency + time * (uWaveSpeed + fi * uLayerSpeed));

    float radius = length(p);
    float polarAngle = atan(p.y, p.x);
    polarAngle += sin(radius * uTwistFrequency - time * uTwistSpeed + fi) * uTwist;
    p = vec2(cos(polarAngle), sin(polarAngle)) * radius;

    float lines = abs(sin(p.x * (uLineFrequency + fi * uLineSpacing) + sin(p.y * 3.0 + time)));
    lines = pow(max(0.0, 1.0 - lines), uLineSharpness);
    fiberField += lines / fi;
    color += uLineColor * lines / fi;

    float glow = exp(-uGlowFalloff * abs(sin(p.x * 3.0 + time + fi)));
    color += uGlowColor * glow * uGlowIntensity / (fi * 2.0);
  }

  float center = exp(-2.2 * dot(uv, uv));
  color += centerTone * center;

  float cloud = exp(-1.5 * length(uv + vec2(sin(time * 0.3) * 0.25, cos(time * 0.25) * 0.18)));
  color += cloudTone * cloud;

  float vignette = 1.0 - smoothstep(0.35, 1.45, length(uv));
  color *= mix(1.0 - uVignette, 1.0, vignette);
  color = 1.0 - exp(-color * uBrightness);
  color.b *= uBlueBoost;

  vec3 outputColor;
  if (uLightMode > 0.5) {
    float edgeFade = mix(1.0 - uVignette, 1.0, vignette);
    float fibers = pow(smoothstep(0.12, 1.05, fiberField) * edgeFade, 1.5);
    float atmosphere = (center * 0.025 + cloud * 0.015) * edgeFade;
    vec3 fiberInk = mix(backdrop, uLineColor, 0.52);
    vec3 airColor = mix(backdrop, uGlowColor, 0.16);

    outputColor = mix(backdrop, airColor, atmosphere);
    outputColor = mix(outputColor, fiberInk, fibers * 0.3);
  } else {
    outputColor = backdrop + color;
  }

  float noise = (layeredGrain(gl_FragCoord.xy) - 0.5) * uGrain;
  outputColor = clamp(outputColor + noise, 0.0, 1.0);
  fragColor = vec4(outputColor, 1.0);
}
`;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('GhostFibers Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('GhostFibers Program link error:', gl.getProgramInfoLog(program));
        return;
    }
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

    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uSpeed = gl.getUniformLocation(program, 'uSpeed');
    const uScale = gl.getUniformLocation(program, 'uScale');
    const uRotation = gl.getUniformLocation(program, 'uRotation');
    const uRotationSpeed = gl.getUniformLocation(program, 'uRotationSpeed');
    const uLayers = gl.getUniformLocation(program, 'uLayers');
    const uWaveAmplitude = gl.getUniformLocation(program, 'uWaveAmplitude');
    const uWaveFrequency = gl.getUniformLocation(program, 'uWaveFrequency');
    const uWaveSpeed = gl.getUniformLocation(program, 'uWaveSpeed');
    const uLayerSpeed = gl.getUniformLocation(program, 'uLayerSpeed');
    const uTwist = gl.getUniformLocation(program, 'uTwist');
    const uTwistFrequency = gl.getUniformLocation(program, 'uTwistFrequency');
    const uTwistSpeed = gl.getUniformLocation(program, 'uTwistSpeed');
    const uLineFrequency = gl.getUniformLocation(program, 'uLineFrequency');
    const uLineSpacing = gl.getUniformLocation(program, 'uLineSpacing');
    const uLineSharpness = gl.getUniformLocation(program, 'uLineSharpness');
    const uGlowFalloff = gl.getUniformLocation(program, 'uGlowFalloff');
    const uGlowIntensity = gl.getUniformLocation(program, 'uGlowIntensity');
    const uBrightness = gl.getUniformLocation(program, 'uBrightness');
    const uBlueBoost = gl.getUniformLocation(program, 'uBlueBoost');
    const uVignette = gl.getUniformLocation(program, 'uVignette');
    const uGrain = gl.getUniformLocation(program, 'uGrain');
    const uLightModeLoc = gl.getUniformLocation(program, 'uLightMode');
    const uLineColorLoc = gl.getUniformLocation(program, 'uLineColor');
    const uGlowColorLoc = gl.getUniformLocation(program, 'uGlowColor');

    gl.uniform1f(uSpeed, speed);
    gl.uniform1f(uScale, scale);
    gl.uniform1f(uRotation, rotation);
    gl.uniform1f(uRotationSpeed, rotationSpeed);
    gl.uniform1f(uLayers, layers);
    gl.uniform1f(uWaveAmplitude, waveAmplitude);
    gl.uniform1f(uWaveFrequency, waveFrequency);
    gl.uniform1f(uWaveSpeed, waveSpeed);
    gl.uniform1f(uLayerSpeed, layerSpeed);
    gl.uniform1f(uTwist, twist);
    gl.uniform1f(uTwistFrequency, twistFrequency);
    gl.uniform1f(uTwistSpeed, twistSpeed);
    gl.uniform1f(uLineFrequency, lineFrequency);
    gl.uniform1f(uLineSpacing, lineSpacing);
    gl.uniform1f(uLineSharpness, lineSharpness);
    gl.uniform1f(uGlowFalloff, glowFalloff);
    gl.uniform1f(uGlowIntensity, glowIntensity);
    gl.uniform1f(uBrightness, brightness);
    gl.uniform1f(uBlueBoost, blueBoost);
    gl.uniform1f(uVignette, vignette);
    gl.uniform1f(uGrain, grain);
    gl.uniform1f(uLightModeLoc, lightMode);
    gl.uniform3fv(uLineColorLoc, new Float32Array(hexToRgb(lineColor)));
    gl.uniform3fv(uGlowColorLoc, new Float32Array(hexToRgb(glowColor)));

    let frameId = 0;
    let elapsed = 0;
    let previousTime = performance.now();
    let lastRenderTime = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function setSize() {
        const parent = container.parentElement || container;
        const rect = container.getBoundingClientRect();
        const w = Math.max(1, Math.floor((rect.width || container.clientWidth || parent.clientWidth || window.innerWidth) * dpr));
        const h = Math.max(1, Math.floor((rect.height || container.clientHeight || parent.clientHeight || 450) * dpr));
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
            gl.uniform2f(uResolution, w, h);
        }
    }

    function renderFrame() {
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function canAnimate() {
        return isVisible && isPageVisible && !reducedMotion.matches;
    }

    function loop(now) {
        frameId = 0;
        if (!canAnimate()) return;

        setSize();

        const delta = Math.min((now - previousTime) / 1000, 0.1);
        previousTime = now;
        elapsed += delta;

        if (now - lastRenderTime >= 1000 / targetFps - 0.5) {
            gl.useProgram(program);
            gl.uniform1f(uTime, elapsed);
            renderFrame();
            lastRenderTime = now;
        }

        frameId = requestAnimationFrame(loop);
    }

    function start() {
        if (!canAnimate() || frameId !== 0) return;
        previousTime = performance.now();
        frameId = requestAnimationFrame(loop);
    }

    function stop() {
        if (frameId !== 0) cancelAnimationFrame(frameId);
        frameId = 0;
    }

    if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(setSize);
        resizeObserver.observe(container);
        if (container.parentElement) resizeObserver.observe(container.parentElement);
    }
    window.addEventListener('resize', setSize);

    if (typeof IntersectionObserver !== 'undefined') {
        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting;
                if (canAnimate()) start();
                else stop();
            },
            { threshold: 0 }
        );
        intersectionObserver.observe(container);
    }

    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (canAnimate()) start();
        else stop();
    });

    reducedMotion.addEventListener('change', () => {
        if (canAnimate()) start();
        else {
            stop();
            renderFrame();
        }
    });

    setSize();
    start();
}

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

// React Bits <ClickSpark /> Cursor Click Integration
function initClickSpark(options) {
    options = options || {};
    const sparkColor = options.sparkColor || '#e6a417';
    const sparkColors = options.sparkColors || ['#e6a417', '#2ba86f', '#38ef7d', '#fadb5f'];
    const sparkSize = options.sparkSize !== undefined ? options.sparkSize : 12;
    const sparkRadius = options.sparkRadius !== undefined ? options.sparkRadius : 22;
    const sparkCount = options.sparkCount !== undefined ? options.sparkCount : 8;
    const duration = options.duration !== undefined ? options.duration : 450;
    const extraScale = options.extraScale !== undefined ? options.extraScale : 1.1;
    const easing = options.easing || 'ease-out';

    let canvas = document.querySelector('.click-spark-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'click-spark-canvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let sparks = [];
    let animationId = null;

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function easeFunc(t) {
        switch (easing) {
            case 'linear':
                return t;
            case 'ease-in':
                return t * t;
            case 'ease-in-out':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default:
                return t * (2 - t);
        }
    }

    function draw(timestamp) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        sparks = sparks.filter(spark => {
            const elapsed = timestamp - spark.startTime;
            if (elapsed >= duration) {
                return false;
            }

            const progress = elapsed / duration;
            const eased = easeFunc(progress);

            const distance = eased * sparkRadius * extraScale;
            const lineLength = sparkSize * (1 - eased);

            const x1 = spark.x + distance * Math.cos(spark.angle);
            const y1 = spark.y + distance * Math.sin(spark.angle);
            const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
            const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

            ctx.strokeStyle = spark.color;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 4;
            ctx.shadowColor = spark.color;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            return true;
        });

        if (sparks.length > 0) {
            animationId = requestAnimationFrame(draw);
        } else {
            animationId = null;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }

    window.addEventListener('pointerdown', function (e) {
        const x = e.clientX;
        const y = e.clientY;
        const now = performance.now();

        for (let i = 0; i < sparkCount; i++) {
            const color = sparkColors ? sparkColors[i % sparkColors.length] : sparkColor;
            sparks.push({
                x: x,
                y: y,
                angle: (2 * Math.PI * i) / sparkCount,
                startTime: now,
                color: color
            });
        }

        if (!animationId) {
            animationId = requestAnimationFrame(draw);
        }
    }, { passive: true });
}
