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

    // 3. React Bits <Galaxy /> Integration (Hero Background)
    if (document.getElementById('galaxyBg')) {
        initGalaxy('galaxyBg', {
            focal: [0.5, 0.5],
            rotation: [1.0, 0.0],
            starSpeed: 0.5,
            density: 1.5,
            hueShift: 240,
            disableAnimation: false,
            speed: 1.0,
            mouseInteraction: true,
            glowIntensity: 0.5,
            saturation: 0.8,
            mouseRepulsion: true,
            repulsionStrength: 2,
            twinkleIntensity: 0.3,
            rotationSpeed: 0.1,
            autoCenterRepulsion: 0,
            transparent: true,
            lightMode: false
        });
    }

    // 3b. React Bits <Galaxy /> Integration (Top Header Box)
    if (document.getElementById('headerGalaxyBg')) {
        initGalaxy('headerGalaxyBg', {
            focal: [0.5, 0.5],
            rotation: [1.0, 0.0],
            starSpeed: 0.5,
            density: 1.5,
            hueShift: 240,
            disableAnimation: false,
            speed: 1.0,
            mouseInteraction: true,
            glowIntensity: 0.6,
            saturation: 0.85,
            mouseRepulsion: true,
            repulsionStrength: 2,
            twinkleIntensity: 0.35,
            rotationSpeed: 0.1,
            autoCenterRepulsion: 0,
            transparent: true,
            lightMode: false
        });
    }

    // 4. React Bits <TiltedCard /> Integration
    initTiltedCards();

    // 5. React Bits <TargetCursor /> Integration
    initTargetCursor({
        targetSelector: '.cursor-target, .pill, .pill-logo, .mobile-menu-link, .mobile-menu-button, .btn, button, a.nav-link, a.pill, .tilted-card-figure',
        spinDuration: 2,
        hideDefaultCursor: true,
        hoverDuration: 0.2,
        parallaxOn: true,
        cursorColor: '#ffffff'
    });
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
// React Bits <Galaxy /> Background Implementation
function initGalaxy(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) return;

    options = options || {};
    const focal = options.focal || [0.5, 0.5];
    const rotation = options.rotation || [1.0, 0.0];
    const starSpeed = options.starSpeed !== undefined ? options.starSpeed : 0.5;
    const density = options.density !== undefined ? options.density : 1.5;
    const hueShift = options.hueShift !== undefined ? options.hueShift : 240.0;
    const disableAnimation = options.disableAnimation === true;
    const speed = options.speed !== undefined ? options.speed : 1.0;
    const mouseInteraction = options.mouseInteraction !== false;
    const glowIntensity = options.glowIntensity !== undefined ? options.glowIntensity : 0.5;
    const saturation = options.saturation !== undefined ? options.saturation : 0.8;
    const mouseRepulsion = options.mouseRepulsion !== false;
    const repulsionStrength = options.repulsionStrength !== undefined ? options.repulsionStrength : 2.0;
    const twinkleIntensity = options.twinkleIntensity !== undefined ? options.twinkleIntensity : 0.3;
    const rotationSpeed = options.rotationSpeed !== undefined ? options.rotationSpeed : 0.1;
    const autoCenterRepulsion = options.autoCenterRepulsion !== undefined ? options.autoCenterRepulsion : 0.0;
    const transparent = options.transparent !== false;
    const lightMode = options.lightMode === true;

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

    const gl = canvas.getContext('webgl', {
        alpha: transparent,
        premultipliedAlpha: false,
        antialias: false
    }) || canvas.getContext('experimental-webgl');

    if (!gl) {
        console.warn("WebGL not supported for Galaxy");
        return;
    }

    if (lightMode) {
        gl.clearColor(1, 1, 1, 1);
    } else if (transparent) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
    } else {
        gl.clearColor(0, 0, 0, 1);
    }

    const vsSource = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

    const fsSource = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
uniform float uLightMode;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);
  
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
    vec3 ink = clamp(col * 0.48, 0.0, 0.82);
    gl_FragColor = vec4(mix(vec3(1.0), ink, coverage), 1.0);
  } else if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

    function createShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Galaxy shader compile error:", gl.getShaderInfoLog(shader));
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
        console.error("Galaxy program link error:", gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
    ]);
    const uvs = new Float32Array([
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1
    ]);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    const uvLoc = gl.getAttribLocation(program, 'uv');
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    const uLoc = {
        uTime: gl.getUniformLocation(program, 'uTime'),
        uResolution: gl.getUniformLocation(program, 'uResolution'),
        uFocal: gl.getUniformLocation(program, 'uFocal'),
        uRotation: gl.getUniformLocation(program, 'uRotation'),
        uStarSpeed: gl.getUniformLocation(program, 'uStarSpeed'),
        uDensity: gl.getUniformLocation(program, 'uDensity'),
        uHueShift: gl.getUniformLocation(program, 'uHueShift'),
        uSpeed: gl.getUniformLocation(program, 'uSpeed'),
        uMouse: gl.getUniformLocation(program, 'uMouse'),
        uGlowIntensity: gl.getUniformLocation(program, 'uGlowIntensity'),
        uSaturation: gl.getUniformLocation(program, 'uSaturation'),
        uMouseRepulsion: gl.getUniformLocation(program, 'uMouseRepulsion'),
        uTwinkleIntensity: gl.getUniformLocation(program, 'uTwinkleIntensity'),
        uRotationSpeed: gl.getUniformLocation(program, 'uRotationSpeed'),
        uRepulsionStrength: gl.getUniformLocation(program, 'uRepulsionStrength'),
        uMouseActiveFactor: gl.getUniformLocation(program, 'uMouseActiveFactor'),
        uAutoCenterRepulsion: gl.getUniformLocation(program, 'uAutoCenterRepulsion'),
        uTransparent: gl.getUniformLocation(program, 'uTransparent'),
        uLightMode: gl.getUniformLocation(program, 'uLightMode')
    };

    gl.uniform2f(uLoc.uFocal, focal[0], focal[1]);
    gl.uniform2f(uLoc.uRotation, rotation[0], rotation[1]);
    gl.uniform1f(uLoc.uDensity, density);
    gl.uniform1f(uLoc.uHueShift, hueShift);
    gl.uniform1f(uLoc.uSpeed, speed);
    gl.uniform1f(uLoc.uGlowIntensity, glowIntensity);
    gl.uniform1f(uLoc.uSaturation, saturation);
    gl.uniform1i(uLoc.uMouseRepulsion, mouseRepulsion ? 1 : 0);
    gl.uniform1f(uLoc.uTwinkleIntensity, twinkleIntensity);
    gl.uniform1f(uLoc.uRotationSpeed, rotationSpeed);
    gl.uniform1f(uLoc.uRepulsionStrength, repulsionStrength);
    gl.uniform1f(uLoc.uAutoCenterRepulsion, autoCenterRepulsion);
    gl.uniform1i(uLoc.uTransparent, transparent ? 1 : 0);
    gl.uniform1f(uLoc.uLightMode, lightMode ? 1.0 : 0.0);

    const targetMousePos = { x: 0.5, y: 0.5 };
    const smoothMousePos = { x: 0.5, y: 0.5 };
    let targetMouseActive = 0.0;
    let smoothMouseActive = 0.0;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = container.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width || window.innerWidth));
        const h = Math.max(1, Math.floor(rect.height || 450));
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform3f(uLoc.uResolution, canvas.width, canvas.height, canvas.width / canvas.height);
    }

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(container);
    window.addEventListener('resize', resize);
    resize();

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        targetMousePos.x = (e.clientX - rect.left) / rect.width;
        targetMousePos.y = 1.0 - (e.clientY - rect.top) / rect.height;
        targetMouseActive = 1.0;
    }

    function handleMouseLeave() {
        targetMouseActive = 0.0;
    }

    if (mouseInteraction) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    let isVisible = true;
    let isPageVisible = !document.hidden;
    let raf = 0;
    const t0 = performance.now();

    function loop(now) {
        const t = now - t0;
        if (!disableAnimation) {
            gl.uniform1f(uLoc.uTime, t * 0.001);
            gl.uniform1f(uLoc.uStarSpeed, (t * 0.001 * starSpeed) / 10.0);
        }

        const lerpFactor = 0.05;
        smoothMousePos.x += (targetMousePos.x - smoothMousePos.x) * lerpFactor;
        smoothMousePos.y += (targetMousePos.y - smoothMousePos.y) * lerpFactor;
        smoothMouseActive += (targetMouseActive - smoothMouseActive) * lerpFactor;

        gl.uniform2f(uLoc.uMouse, smoothMousePos.x, smoothMousePos.y);
        gl.uniform1f(uLoc.uMouseActiveFactor, smoothMouseActive);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
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

// React Bits <TargetCursor /> Implementation
function initTargetCursor(options) {
    if (typeof window === 'undefined') return;
    const isMobile = (() => {
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        return (hasTouchScreen && isSmallScreen) || mobileRegex.test(userAgent.toLowerCase());
    })();

    if (isMobile) return;

    options = options || {};
    const targetSelector = options.targetSelector || '.cursor-target, .pill, .pill-logo, .mobile-menu-link, .mobile-menu-button, .btn, button, a.nav-link, a.pill, .tilted-card-figure';
    const spinDuration = options.spinDuration !== undefined ? options.spinDuration : 2;
    const hideDefaultCursor = options.hideDefaultCursor !== false;
    const hoverDuration = options.hoverDuration !== undefined ? options.hoverDuration : 0.2;
    const parallaxOn = options.parallaxOn !== false;
    const cursorColor = options.cursorColor || '#ffffff';
    const cursorColorOnTarget = options.cursorColorOnTarget;

    const constants = {
        borderWidth: 3,
        cornerSize: 12
    };

    function runWithGsap() {
        if (!window.gsap) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
            script.onload = () => setupCursor();
            document.head.appendChild(script);
        } else {
            setupCursor();
        }
    }

    function getContainingBlock(element) {
        let node = element?.parentElement;
        while (node && node !== document.documentElement) {
            const style = getComputedStyle(node);
            if (
                style.transform !== 'none' ||
                style.perspective !== 'none' ||
                style.filter !== 'none' ||
                style.willChange.includes('transform') ||
                style.willChange.includes('perspective') ||
                style.willChange.includes('filter') ||
                /paint|layout|strict|content/.test(style.contain)
            ) {
                return node;
            }
            node = node.parentElement;
        }
        return null;
    }

    function getContainingBlockOffset(block) {
        if (!block) return { x: 0, y: 0 };
        const rect = block.getBoundingClientRect();
        return { x: rect.left + block.clientLeft, y: rect.top + block.clientTop };
    }

    function setupCursor() {
        let cursor = document.querySelector('.target-cursor-wrapper');
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.className = 'target-cursor-wrapper';
            cursor.innerHTML = `
                <div class="target-cursor-dot" style="background-color: ${cursorColor};"></div>
                <div class="target-cursor-corner corner-tl" style="border-color: ${cursorColor};"></div>
                <div class="target-cursor-corner corner-tr" style="border-color: ${cursorColor};"></div>
                <div class="target-cursor-corner corner-br" style="border-color: ${cursorColor};"></div>
                <div class="target-cursor-corner corner-bl" style="border-color: ${cursorColor};"></div>
            `;
            document.body.appendChild(cursor);
        }

        const dot = cursor.querySelector('.target-cursor-dot');
        const corners = cursor.querySelectorAll('.target-cursor-corner');

        if (hideDefaultCursor) {
            document.body.classList.add('target-cursor-active');
            document.body.style.cursor = 'none';
        }

        const containingBlock = getContainingBlock(cursor);
        const getOffset = () => getContainingBlockOffset(containingBlock);

        let activeTarget = null;
        let currentLeaveHandler = null;
        let resumeTimeout = null;
        let targetCornerPositions = null;
        let activeStrength = { current: 0 };

        const initialOffset = getOffset();
        gsap.set(cursor, {
            xPercent: -50,
            yPercent: -50,
            x: window.innerWidth / 2 - initialOffset.x,
            y: window.innerHeight / 2 - initialOffset.y
        });

        let spinTl = gsap
            .timeline({ repeat: -1 })
            .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });

        const moveCursor = (x, y) => {
            const { x: offsetX, y: offsetY } = getOffset();
            gsap.to(cursor, {
                x: x - offsetX,
                y: y - offsetY,
                duration: 0.1,
                ease: 'power3.out'
            });
        };

        const tickerFn = () => {
            if (!targetCornerPositions || !cursor || !corners) return;
            const strength = activeStrength.current;
            if (strength === 0) return;

            const cursorX = gsap.getProperty(cursor, 'x');
            const cursorY = gsap.getProperty(cursor, 'y');

            corners.forEach((corner, i) => {
                const currentX = gsap.getProperty(corner, 'x');
                const currentY = gsap.getProperty(corner, 'y');

                const targetX = targetCornerPositions[i].x - cursorX;
                const targetY = targetCornerPositions[i].y - cursorY;

                const finalX = currentX + (targetX - currentX) * strength;
                const finalY = currentY + (targetY - currentY) * strength;

                const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

                gsap.to(corner, {
                    x: finalX,
                    y: finalY,
                    duration: duration,
                    ease: duration === 0 ? 'none' : 'power1.out',
                    overwrite: 'auto'
                });
            });
        };

        const moveHandler = e => moveCursor(e.clientX, e.clientY);
        window.addEventListener('mousemove', moveHandler);

        const scrollHandler = () => {
            if (!activeTarget || !cursor) return;
            const { x: offsetX, y: offsetY } = getOffset();
            const mouseX = gsap.getProperty(cursor, 'x') + offsetX;
            const mouseY = gsap.getProperty(cursor, 'y') + offsetY;
            const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
            const isStillOverTarget =
                elementUnderMouse &&
                (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget);
            if (!isStillOverTarget && currentLeaveHandler) {
                currentLeaveHandler();
            }
        };
        window.addEventListener('scroll', scrollHandler, { passive: true });

        const mouseDownHandler = () => {
            if (!dot) return;
            gsap.to(dot, { scale: 0.7, duration: 0.3 });
            gsap.to(cursor, { scale: 0.9, duration: 0.2 });
        };

        const mouseUpHandler = () => {
            if (!dot) return;
            gsap.to(dot, { scale: 1, duration: 0.3 });
            gsap.to(cursor, { scale: 1, duration: 0.2 });
        };

        window.addEventListener('mousedown', mouseDownHandler);
        window.addEventListener('mouseup', mouseUpHandler);

        const cleanupTarget = target => {
            if (currentLeaveHandler) {
                target.removeEventListener('mouseleave', currentLeaveHandler);
            }
            currentLeaveHandler = null;
        };

        const enterHandler = e => {
            const directTarget = e.target;
            const allTargets = [];
            let current = directTarget;
            while (current && current !== document.body) {
                if (current.matches && current.matches(targetSelector)) {
                    allTargets.push(current);
                }
                current = current.parentElement;
            }
            const target = allTargets[0] || null;
            if (!target || !cursor || !corners) return;
            if (activeTarget === target) return;
            if (activeTarget) cleanupTarget(activeTarget);
            if (resumeTimeout) {
                clearTimeout(resumeTimeout);
                resumeTimeout = null;
            }

            activeTarget = target;
            corners.forEach(corner => gsap.killTweensOf(corner, 'x,y'));

            gsap.killTweensOf(cursor, 'rotation');
            spinTl?.pause();
            gsap.set(cursor, { rotation: 0 });

            if (cursorColorOnTarget) {
                gsap.to(corners, {
                    borderColor: cursorColorOnTarget,
                    duration: 0.15,
                    ease: 'power2.out'
                });
                if (dot) {
                    gsap.to(dot, {
                        backgroundColor: cursorColorOnTarget,
                        duration: 0.15,
                        ease: 'power2.out'
                    });
                }
            }

            const rect = target.getBoundingClientRect();
            const { borderWidth, cornerSize } = constants;
            const { x: offsetX, y: offsetY } = getOffset();
            const cursorX = gsap.getProperty(cursor, 'x');
            const cursorY = gsap.getProperty(cursor, 'y');

            targetCornerPositions = [
                { x: rect.left - borderWidth - offsetX, y: rect.top - borderWidth - offsetY },
                { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.top - borderWidth - offsetY },
                { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY },
                { x: rect.left - borderWidth - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY }
            ];

            gsap.ticker.add(tickerFn);

            gsap.to(activeStrength, {
                current: 1,
                duration: hoverDuration,
                ease: 'power2.out'
            });

            corners.forEach((corner, i) => {
                gsap.to(corner, {
                    x: targetCornerPositions[i].x - cursorX,
                    y: targetCornerPositions[i].y - cursorY,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            });

            const leaveHandler = () => {
                gsap.ticker.remove(tickerFn);

                targetCornerPositions = null;
                gsap.set(activeStrength, { current: 0, overwrite: true });
                activeTarget = null;

                if (cursorColorOnTarget && corners) {
                    gsap.to(Array.from(corners), {
                        borderColor: cursorColor,
                        duration: 0.15,
                        ease: 'power2.out'
                    });
                    if (dot) {
                        gsap.to(dot, {
                            backgroundColor: cursorColor,
                            duration: 0.15,
                            ease: 'power2.out'
                        });
                    }
                }

                if (corners) {
                    corners.forEach(corner => gsap.killTweensOf(corner, 'x,y'));
                    const { cornerSize } = constants;
                    const positions = [
                        { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
                        { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
                        { x: cornerSize * 0.5, y: cornerSize * 0.5 },
                        { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
                    ];
                    const tl = gsap.timeline();
                    corners.forEach((corner, index) => {
                        tl.to(
                            corner,
                            {
                                x: positions[index].x,
                                y: positions[index].y,
                                duration: 0.3,
                                ease: 'power3.out'
                            },
                            0
                        );
                    });
                }

                resumeTimeout = setTimeout(() => {
                    if (!activeTarget && cursor && spinTl) {
                        const currentRotation = gsap.getProperty(cursor, 'rotation');
                        const normalizedRotation = currentRotation % 360;
                        spinTl.kill();
                        spinTl = gsap
                            .timeline({ repeat: -1 })
                            .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
                        gsap.to(cursor, {
                            rotation: normalizedRotation + 360,
                            duration: spinDuration * (1 - normalizedRotation / 360),
                            ease: 'none',
                            onComplete: () => {
                                spinTl?.restart();
                            }
                        });
                    }
                    resumeTimeout = null;
                }, 50);

                cleanupTarget(target);
            };

            currentLeaveHandler = leaveHandler;
            target.addEventListener('mouseleave', leaveHandler);
        };

        window.addEventListener('mouseover', enterHandler, { passive: true });
    }

    runWithGsap();
}
