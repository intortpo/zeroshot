import React, { useEffect, useRef } from 'react';
import { NodeExecutionStatus } from '../types';

interface SilkShaderProps {
  workflowStatus: NodeExecutionStatus | 'delivered';
  activeNodeId?: string;
}

export const SilkShaderBackground: React.FC<SilkShaderProps> = ({
  workflowStatus,
  activeNodeId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!gl) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      gl.viewport(0, 0, width, height);
    };

    window.addEventListener('resize', handleResize);

    // Vertex Shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader - Ethereal, organic flowing silk ribbons with delicate caustics
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_color_primary;
      uniform vec3 u_color_secondary;
      uniform float u_activity;
      uniform vec2 u_mouse;

      // Smooth fractal noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        // Fluid time progression
        float t = u_time * (0.07 + u_activity * 0.05);

        // Simulating the folding and drape of dark iridescent silk
        vec2 q = vec2(fbm(p + vec2(0.0, t * 0.2)), fbm(p + vec2(t * 0.15, 0.0)));
        vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + 0.15 * t),
                      fbm(p + 3.0 * q + vec2(8.3, 2.8) + 0.126 * t));

        float f = fbm(p + 4.0 * r);

        // Soft undulating silk ribbons with smooth depth
        float silk1 = sin(p.y * 2.5 + f * 3.5 + t * 1.1) * 0.5 + 0.5;
        silk1 = pow(silk1, 2.2);
        float silk2 = cos(p.x * 2.0 - f * 2.8 + t * 0.8) * 0.5 + 0.5;
        silk2 = pow(silk2, 2.0);
        float silk = mix(silk1, silk2, 0.5);

        // Base pure warm white / alabaster
        vec3 lightBg = vec3(0.988, 0.988, 0.990);

        // Subtle pearlescent white silk ribbons
        vec3 silkColor = mix(u_color_primary, u_color_secondary, f * 0.7 + silk * 0.3);
        
        // Subtle, elegant flowing silk opacity
        float alpha = clamp(silk * 0.28 + f * 0.16, 0.0, 0.45);

        vec3 finalColor = mix(lightBg, silkColor, alpha);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Compile Shader helper
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad geometry covering the viewport
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uColorPrimary = gl.getUniformLocation(program, 'u_color_primary');
    const uColorSecondary = gl.getUniformLocation(program, 'u_color_secondary');
    const uActivity = gl.getUniformLocation(program, 'u_activity');

    let startTime = performance.now();

    // Render loop
    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000.0;

      gl.viewport(0, 0, width, height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uResolution, width, height);

      // Subtle monochromatic white & silver silk palette (no green)
      let primary = [0.91, 0.92, 0.94]; // Pearl silver white
      let secondary = [0.96, 0.96, 0.98]; // Luminous ivory white
      let activity = 0.12;

      switch (workflowStatus) {
        case 'running':
          primary = [0.89, 0.91, 0.93]; // Deep pearl fold
          secondary = [0.95, 0.96, 0.97];
          activity = 0.22;
          break;
        case 'gated':
          primary = [0.93, 0.92, 0.90]; // Warm parchment pearl
          secondary = [0.97, 0.96, 0.95];
          activity = 0.15;
          break;
        case 'passed':
        case 'delivered':
          primary = [0.92, 0.93, 0.94];
          secondary = [0.97, 0.98, 0.99];
          activity = 0.14;
          break;
        case 'failed':
          primary = [0.94, 0.91, 0.91]; // Faint rose pearl
          secondary = [0.97, 0.95, 0.95];
          activity = 0.18;
          break;
      }

      gl.uniform3fv(uColorPrimary, primary);
      gl.uniform3fv(uColorSecondary, secondary);
      gl.uniform1f(uActivity, activity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [workflowStatus, activeNodeId]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-100 transition-opacity duration-1000"
    />
  );
};
