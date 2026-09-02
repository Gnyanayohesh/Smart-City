// Smart City Cleanliness Reporting System - Client-side Scripts

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

    // 3. React Bits <GradientWaves /> Integration (Hero Background)
    if (document.getElementById('gradientWavesBg')) {
        initGradientWaves('gradientWavesBg', {
            horizonColor: '#5227FF',
            waveColor: '#FF9FFC',
            crestColor: '#FFFFFF',
            speed: 0.4,
            amplitude: 2.5,
            waveScale: 0.6,
            waveRatio: 0.9,
            swell: 35,
            turbulence: 20,
            tilt: 1.11,
            zoom: 1.0,
            height: 5.5,
            fogDepth: 15,
            detail: 'medium',
            brightness: 1.0,
            opacity: 1.0,
            mouseInteraction: true,
            parallaxStrength: 0.5,
            grain: true,
            grainIntensity: 0.05
        });
    }

    // 4. React Bits <TiltedCard /> Integration
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
// React Bits <GradientWaves /> Background Implementation
function initGradientWaves(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) return;

    options = options || {};
    const horizonColor = options.horizonColor || '#5227FF';
    const waveColor = options.waveColor || '#FF9FFC';
    const crestColor = options.crestColor || '#FFFFFF';
    const speed = options.speed !== undefined ? options.speed : 0.4;
    const amplitude = options.amplitude !== undefined ? options.amplitude : 2.5;
    const waveScale = options.waveScale !== undefined ? options.waveScale : 0.6;
    const waveRatio = options.waveRatio !== undefined ? options.waveRatio : 0.9;
    const swell = options.swell !== undefined ? options.swell : 35.0;
    const turbulence = options.turbulence !== undefined ? options.turbulence : 20.0;
    const tilt = options.tilt !== undefined ? options.tilt : 1.11;
    const zoom = options.zoom !== undefined ? options.zoom : 1.0;
    const height = options.height !== undefined ? options.height : 5.5;
    const fogDepth = options.fogDepth !== undefined ? options.fogDepth : 15.0;
    const detail = options.detail || 'medium';
    const brightness = options.brightness !== undefined ? options.brightness : 1.0;
    const opacity = options.opacity !== undefined ? options.opacity : 1.0;
    const grain = options.grain !== false;
    const grainIntensity = options.grainIntensity !== undefined ? options.grainIntensity : 0.05;
    const mouseInteraction = options.mouseInteraction !== false;
    const parallaxStrength = options.parallaxStrength !== undefined ? options.parallaxStrength : 0.5;

    function detailToSteps(d) {
        if (d === 'low') return 40.0;
        if (d === 'high') return 110.0;
        return 70.0;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return [1, 1, 1];
        return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
    }

    let canvas = container.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.setAttribute('aria-hidden', 'true');
        container.appendChild(canvas);
    }

    const gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false
    }) || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        console.warn("WebGL not supported for GradientWaves");
        return;
    }

    const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

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
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
${isWebGL2 ? 'out vec4 fragColor;' : ''}

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

    function createShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader compile error:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         3, -1,
        -1,  3
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uLoc = {
        iTime: gl.getUniformLocation(program, 'iTime'),
        iResolution: gl.getUniformLocation(program, 'iResolution'),
        uSpeed: gl.getUniformLocation(program, 'uSpeed'),
        uAmplitude: gl.getUniformLocation(program, 'uAmplitude'),
        uWaveScale: gl.getUniformLocation(program, 'uWaveScale'),
        uWaveRatio: gl.getUniformLocation(program, 'uWaveRatio'),
        uSwell: gl.getUniformLocation(program, 'uSwell'),
        uTurbulence: gl.getUniformLocation(program, 'uTurbulence'),
        uTilt: gl.getUniformLocation(program, 'uTilt'),
        uZoom: gl.getUniformLocation(program, 'uZoom'),
        uHeight: gl.getUniformLocation(program, 'uHeight'),
        uFogDepth: gl.getUniformLocation(program, 'uFogDepth'),
        uSteps: gl.getUniformLocation(program, 'uSteps'),
        uBrightness: gl.getUniformLocation(program, 'uBrightness'),
        uOpacity: gl.getUniformLocation(program, 'uOpacity'),
        uGrain: gl.getUniformLocation(program, 'uGrain'),
        uGrainIntensity: gl.getUniformLocation(program, 'uGrainIntensity'),
        uMouse: gl.getUniformLocation(program, 'uMouse'),
        uParallax: gl.getUniformLocation(program, 'uParallax'),
        uEnableMouse: gl.getUniformLocation(program, 'uEnableMouse'),
        uHorizonColor: gl.getUniformLocation(program, 'uHorizonColor'),
        uWaveColor: gl.getUniformLocation(program, 'uWaveColor'),
        uCrestColor: gl.getUniformLocation(program, 'uCrestColor')
    };

    gl.uniform1f(uLoc.uSpeed, speed);
    gl.uniform1f(uLoc.uAmplitude, amplitude);
    gl.uniform1f(uLoc.uWaveScale, waveScale);
    gl.uniform1f(uLoc.uWaveRatio, waveRatio);
    gl.uniform1f(uLoc.uSwell, swell);
    gl.uniform1f(uLoc.uTurbulence, turbulence);
    gl.uniform1f(uLoc.uTilt, tilt);
    gl.uniform1f(uLoc.uZoom, zoom);
    gl.uniform1f(uLoc.uHeight, height);
    gl.uniform1f(uLoc.uFogDepth, fogDepth);
    gl.uniform1f(uLoc.uSteps, detailToSteps(detail));
    gl.uniform1f(uLoc.uBrightness, brightness);
    gl.uniform1f(uLoc.uOpacity, opacity);
    gl.uniform1f(uLoc.uGrain, grain ? 1.0 : 0.0);
    gl.uniform1f(uLoc.uGrainIntensity, grainIntensity);
    gl.uniform1f(uLoc.uParallax, parallaxStrength);
    gl.uniform1i(uLoc.uEnableMouse, mouseInteraction ? 1 : 0);
    gl.uniform3fv(uLoc.uHorizonColor, hexToRgb(horizonColor));
    gl.uniform3fv(uLoc.uWaveColor, hexToRgb(waveColor));
    gl.uniform3fv(uLoc.uCrestColor, hexToRgb(crestColor));

    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = container.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width || window.innerWidth));
        const h = Math.max(1, Math.floor(rect.height || 450));
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uLoc.iResolution, canvas.width, canvas.height);
    }

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(container);
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('pointermove', function (e) {
        const rect = canvas.getBoundingClientRect();
        targetMouse[0] = (e.clientX - rect.left) / rect.width;
        targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    }, { passive: true });

    window.addEventListener('pointerleave', function () {
        targetMouse[0] = 0.5;
        targetMouse[1] = 0.5;
    }, { passive: true });

    let isVisible = true;
    let isPageVisible = !document.hidden;
    let raf = 0;
    const t0 = performance.now();

    function loop(t) {
        gl.uniform1f(uLoc.iTime, (t - t0) * 0.001);
        const tx = mouseInteraction ? targetMouse[0] : 0.5;
        const ty = mouseInteraction ? targetMouse[1] : 0.5;
        currentMouse[0] += 0.05 * (tx - currentMouse[0]);
        currentMouse[1] += 0.05 * (ty - currentMouse[1]);
        gl.uniform2f(uLoc.uMouse, currentMouse[0], currentMouse[1]);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(loop);
    }

    function tryStart() {
        if (isVisible && isPageVisible && raf === 0) {
            raf = requestAnimationFrame(loop);
        }
    }

    function tryStop() {
        if (raf !== 0) {
            cancelAnimationFrame(raf);
            raf = 0;
        }
    }

    if (typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            isVisible ? tryStart() : tryStop();
        }, { threshold: 0 });
        io.observe(container);
    }

    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        isPageVisible ? tryStart() : tryStop();
    });

    tryStart();
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
