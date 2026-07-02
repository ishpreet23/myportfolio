(function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  function syncSize() {
    const w = canvas.clientWidth  || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  } else {
    window.addEventListener('resize', syncSize);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  
  const vs = `
    attribute vec2 position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;
  
  const fs = `
    precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
        vec2 uv = v_texCoord;
        vec2 m = u_mouse / u_resolution;
        
        // Distorted grid
        vec2 grid_uv = uv * 20.0;
        float n = noise(grid_uv + u_time * 0.1);
        float line = step(0.98, fract(grid_uv.x + n * 0.1)) + step(0.98, fract(grid_uv.y + n * 0.1));
        
        // Glowing particles
        float particles = 0.0;
        for(int i = 0; i < 5; i++) {
            vec2 pos = vec2(hash(vec2(float(i), 1.0)), hash(vec2(float(i), 2.0)));
            pos.x += sin(u_time * 0.5 + float(i)) * 0.2;
            pos.y += cos(u_time * 0.3 + float(i)) * 0.2;
            float d = distance(uv, pos);
            particles += 0.001 / (d * d);
        }
        
        // Colors
        vec3 base_color = vec3(0.05, 0.05, 0.07);
        vec3 grid_color = vec3(0.2, 0.9, 0.0) * line * 0.2; // Cyber lime
        vec3 particle_color = vec3(0.5, 0.0, 1.0) * particles * 0.5; // Electric violet
        
        // Mouse glow
        float mouse_dist = distance(uv, m);
        vec3 mouse_glow = vec3(0.0, 0.8, 1.0) * (0.01 / (mouse_dist + 0.1));
        
        vec3 final_color = base_color + grid_color + particle_color + mouse_glow;
        gl_FragColor = vec4(final_color, 1.0);
    }
  `;

  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(t) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
