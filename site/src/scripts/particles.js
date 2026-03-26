/**
 * WebGL2 Particle Field — Dieter Rams + Teenage Engineering
 *
 * Monochrome particle field with cursor-reactive physics.
 * Runs entirely on GPU via vertex/fragment shaders.
 * Progressive enhancement: page works perfectly without this.
 *
 * Performance budget: <2ms per frame on mobile, zero impact on LCP.
 */

const VERTEX_SHADER = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uDpr;

out float vAlpha;
out float vSize;

// Hash function for pseudo-random positioning
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

vec2 hash2(float n) {
  return vec2(hash(n), hash(n + 1.0));
}

void main() {
  float id = float(gl_VertexID);
  vec2 seed = hash2(id * 7.31);

  // Base position: distributed across screen
  vec2 pos = seed * 2.0 - 1.0;

  // Gentle organic motion
  float t = uTime * 0.15;
  pos.x += sin(t + id * 0.017) * 0.02;
  pos.y += cos(t * 0.7 + id * 0.023) * 0.02;

  // Cursor interaction: particles gently repel from mouse
  if (uMouseActive > 0.5) {
    vec2 mouseNDC = (uMouse / uResolution) * 2.0 - 1.0;
    mouseNDC.y = -mouseNDC.y;
    vec2 diff = pos - mouseNDC;
    float dist = length(diff);
    float influence = smoothstep(0.3, 0.0, dist);
    pos += normalize(diff + 0.001) * influence * 0.08;
  }

  gl_Position = vec4(pos, 0.0, 1.0);

  // Size varies by particle, adjusted for DPR
  vSize = (1.0 + hash(id * 3.77) * 1.5) * uDpr;
  gl_PointSize = vSize;

  // Alpha: slight variation per particle, fades at edges
  float edgeFade = smoothstep(1.0, 0.85, max(abs(pos.x), abs(pos.y)));
  vAlpha = (0.12 + hash(id * 5.13) * 0.18) * edgeFade;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in float vAlpha;
in float vSize;
out vec4 fragColor;

void main() {
  // Soft circular point
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;

  // Monochrome: between #e4e4e0 and #9c9c96
  vec3 color = mix(
    vec3(0.612, 0.612, 0.588),  // #9c9c96
    vec3(0.894, 0.894, 0.878),  // #e4e4e0
    vAlpha / 0.3
  );

  fragColor = vec4(color, alpha);
}
`;

const PARTICLE_COUNT = 30000; // 30K particles — safe for mobile

export function init(canvas) {
  if (!canvas) return;

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
  });

  if (!gl) return; // WebGL2 not supported — graceful degradation

  // Match canvas size to container
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width, height;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Compile shaders
  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  // Uniforms
  const uTime = gl.getUniformLocation(program, 'uTime');
  const uResolution = gl.getUniformLocation(program, 'uResolution');
  const uMouse = gl.getUniformLocation(program, 'uMouse');
  const uMouseActive = gl.getUniformLocation(program, 'uMouseActive');
  const uDpr = gl.getUniformLocation(program, 'uDpr');

  // Mouse tracking
  let mouseX = 0, mouseY = 0, mouseActive = 0;

  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.parentElement.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = 1;
  }, { passive: true });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouseActive = 0;
  }, { passive: true });

  // Blending for soft particles
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Empty VAO (vertex positions computed in shader)
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Animation loop
  let animId;
  const startTime = performance.now();

  function render() {
    const time = (performance.now() - startTime) / 1000;

    gl.clearColor(0, 0, 0, 0); // transparent
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uTime, time);
    gl.uniform2f(uResolution, width * dpr, height * dpr);
    gl.uniform2f(uMouse, mouseX * dpr, mouseY * dpr);
    gl.uniform1f(uMouseActive, mouseActive);
    gl.uniform1f(uDpr, dpr);

    gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

    animId = requestAnimationFrame(render);
  }

  render();

  // Cleanup on page navigation (Astro view transitions)
  return () => {
    cancelAnimationFrame(animId);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteVertexArray(vao);
  };
}
