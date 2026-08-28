// ----------------------------------------------------------------------

export const BlackHoleShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uResolution: { value: [1920.0, 1080.0] },
    uCameraPosition: { value: [0.0, 2.5, 13.0] },
    uCameraTarget: { value: [0.0, 0.0, 0.0] },
    uMass: { value: 1.0 },
    uSpin: { value: 0.0 },
    uShowAccretionDisk: { value: true },
    uDiskTemperature: { value: 6500.0 },
    uDiskDensity: { value: 1.5 },
    uDiskInnerRadius: { value: 2.0 },
    uDiskOuterRadius: { value: 12.0 },
    uEnableDopplerBeaming: { value: true },
    uShowPhotonSphere: { value: true },
    uBackgroundMode: { value: 0 }, // 0: milkyway, 1: grid, 2: deepspace
    uRedshiftFactor: { value: 0.0 }, // 0.0 (normal) to 1.0+ (infall redshift)
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    precision highp float;

    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uCameraPosition;
    uniform vec3 uCameraTarget;
    uniform float uMass;
    uniform float uSpin;
    uniform bool uShowAccretionDisk;
    uniform float uDiskTemperature;
    uniform float uDiskDensity;
    uniform float uDiskInnerRadius;
    uniform float uDiskOuterRadius;
    uniform bool uEnableDopplerBeaming;
    uniform bool uShowPhotonSphere;
    uniform int uBackgroundMode;
    uniform float uRedshiftFactor;

    #define PI 3.14159265359
    #define MAX_STEPS 150
    #define ESCAPE_DIST 32.0

    // Simplex Noise for procedural galaxy & disk texture
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // Blackbody temperature color mapping
    vec3 tempToColor(float tempK) {
      float t = clamp(tempK / 15000.0, 0.0, 1.0);
      vec3 cool = vec3(1.0, 0.35, 0.08); // Orange/red (low temp)
      vec3 mid  = vec3(1.0, 0.85, 0.60); // Warm white
      vec3 hot  = vec3(0.40, 0.80, 1.00); // Cyan/blue (high temp)
      if (t < 0.5) {
        return mix(cool, mid, t * 2.0);
      } else {
        return mix(mid, hot, (t - 0.5) * 2.0);
      }
    }

    // Background sampling (Milky Way HD stars or Spacetime Grid)
    vec3 sampleBackground(vec3 dir) {
      if (uBackgroundMode == 1) { // Spacetime Grid Pattern
        vec2 gridUv = dir.xz / (abs(dir.y) + 0.08);
        if (dir.y < 0.0) gridUv.y = -gridUv.y;
        vec2 grid = abs(fract(gridUv * 2.5 - 0.5) - 0.5);
        float line = min(grid.x, grid.y);
        float c = 1.0 - smoothstep(0.0, 0.06, line);
        vec3 gridColor = vec3(0.18, 0.58, 1.0) * c;
        float distFade = exp(-length(dir.xz) * 0.15);
        return gridColor * distFade + vec3(0.015, 0.035, 0.09);
      } else if (uBackgroundMode == 2) { // Deep Space
        float n = snoise(dir.xy * 8.0);
        float stars = pow(clamp(n * 0.5 + 0.5, 0.0, 1.0), 10.0) * 3.5;
        return vec3(stars) + vec3(0.01, 0.01, 0.02);
      } else { // Milky Way Galaxy Skybox
        float n1 = snoise(dir.xy * 2.5 + vec2(0.5, 0.3));
        float n2 = snoise(dir.yz * 4.0 - vec2(1.2, 0.8));
        float galaxyBand = exp(-abs(dir.y) * 3.5);
        vec3 dust = vec3(0.12, 0.25, 0.55) * clamp(n1 * 0.5 + 0.5, 0.0, 1.0);
        vec3 brightBand = vec3(0.9, 0.95, 1.0) * pow(clamp(n2 * 0.5 + 0.5, 0.0, 1.0), 2.0);
        float stars = pow(clamp(snoise(dir.xz * 12.0) * 0.5 + 0.5, 0.0, 1.0), 8.0) * 3.0;
        return (dust + brightBand * 1.8 + vec3(stars)) * (galaxyBand * 0.85 + 0.15) + vec3(0.015, 0.02, 0.05);
      }
    }

    void main() {
      vec2 res = max(uResolution, vec2(10.0));
      vec2 uv = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);

      // Camera setup
      vec3 ro = uCameraPosition;
      vec3 target = uCameraTarget;
      vec3 forward = normalize(target - ro);
      vec3 upVec = abs(forward.y) > 0.99 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
      vec3 right = normalize(cross(forward, upVec));
      vec3 up = cross(right, forward);

      float fovScale = 0.57735; // tan(60 deg / 2)
      vec3 rd = normalize(forward + (uv.x * right + uv.y * up) * fovScale);

      // Physics parameters
      float Rs = max(0.1, 2.0 * uMass);
      float Rph = 1.5 * Rs;
      float spinA = clamp(uSpin, -0.99, 0.99);

      // Raymarching Variables
      vec3 pos = ro;
      vec3 dir = rd;
      vec3 accumulatedColor = vec3(0.0);
      float accumulatedOpacity = 0.0;
      float minDistanceToOrigin = 1e5;

      float ds = 0.08;
      bool hitEventHorizon = false;

      for (int i = 0; i < MAX_STEPS; i++) {
        float r = length(pos);
        minDistanceToOrigin = min(minDistanceToOrigin, r);

        // Check Event Horizon hit
        if (r <= Rs * 1.01) {
          hitEventHorizon = true;
          break;
        }

        // Check Ray escape to infinity
        if (r >= ESCAPE_DIST) {
          break;
        }

        // Accretion Disk intersection (plane y = 0)
        if (uShowAccretionDisk && abs(pos.y) < 0.20 && accumulatedOpacity < 0.98) {
          float diskRadius = length(pos.xz);
          float innerR = max(Rs * 1.05, uDiskInnerRadius);
          float outerR = uDiskOuterRadius;

          if (diskRadius >= innerR && diskRadius <= outerR) {
            float distNorm = (diskRadius - innerR) / max(0.1, outerR - innerR);

            // Disk density profile & noise pattern
            float noiseVal = snoise(pos.xz * 1.8 - vec2(uTime * 0.8, uTime * 0.4));
            float noiseVal2 = snoise(pos.xz * 4.5 + vec2(uTime * 1.2, -uTime * 0.6));
            float density = sin(distNorm * PI) * (0.6 + 0.4 * noiseVal) * (0.8 + 0.3 * noiseVal2);
            density *= uDiskDensity * (1.0 - smoothstep(outerR * 0.8, outerR, diskRadius));

            // Relativistic Keplerian Orbital Velocity v = sqrt(M / r)
            vec3 orbitDir = normalize(vec3(-pos.z, 0.0, pos.x));
            float orbitalVel = clamp(sqrt(uMass / max(0.5, diskRadius)), 0.0, 0.75);

            // Doppler factor delta = 1 / (gamma * (1 - v/c * cosTheta))
            float cosTheta = dot(orbitDir, -dir);
            float gamma = 1.0 / sqrt(1.0 - orbitalVel * orbitalVel);
            float dopplerFactor = 1.0;

            if (uEnableDopplerBeaming) {
              dopplerFactor = 1.0 / (gamma * (1.0 - orbitalVel * cosTheta * 0.95));
              // Frame dragging boost along spin axis
              dopplerFactor *= (1.0 + spinA * pos.x / max(1.0, diskRadius) * 0.3);
            }

            vec3 baseColor = tempToColor(uDiskTemperature);
            vec3 dopplerColor = baseColor * pow(dopplerFactor, 3.5);

            // Blue shift on approaching side, red shift on receding side
            if (uEnableDopplerBeaming) {
              if (dopplerFactor > 1.1) {
                dopplerColor = mix(dopplerColor, vec3(0.4, 0.8, 1.5) * dopplerColor, clamp((dopplerFactor - 1.1) * 2.0, 0.0, 0.8));
              } else if (dopplerFactor < 0.9) {
                dopplerColor = mix(dopplerColor, vec3(1.5, 0.2, 0.1) * dopplerColor, clamp((0.9 - dopplerFactor) * 2.0, 0.0, 0.8));
              }
            }

            float alpha = clamp(density * ds * 2.5, 0.0, 0.85);
            accumulatedColor += dopplerColor * alpha * (1.0 - accumulatedOpacity);
            accumulatedOpacity += alpha;
          }
        }

        // Relativistic Deflection (General Relativity Bending)
        vec3 nPos = normalize(pos);
        float bendingForce = (1.5 * Rs) / (r * r);

        // Kerr Metric Frame-dragging modification around y-axis spin
        if (abs(spinA) > 0.01) {
          vec3 spinAxis = vec3(0.0, 1.0, 0.0);
          vec3 dragForce = cross(spinAxis, pos) * (spinA * Rs / (r * r * r));
          dir = normalize(dir + dragForce * ds);
        }

        dir = normalize(dir - nPos * bendingForce * ds);
        pos += dir * ds * max(0.25, r * 0.18);
      }

      // Final Background Compositing
      vec3 finalColor = vec3(0.0);

      if (hitEventHorizon) {
        // Event Horizon (Black hole shadow)
        vec3 horizonGlow = vec3(0.8, 0.2, 0.05) * exp(-(minDistanceToOrigin - Rs) * 10.0);
        finalColor = accumulatedColor + horizonGlow;
      } else {
        vec3 bgColor = sampleBackground(dir);

        // Photon Sphere Highlight Ring
        if (uShowPhotonSphere) {
          float photonDist = abs(minDistanceToOrigin - Rph);
          float ringGlow = exp(-photonDist * photonDist * 18.0) * 0.45;
          bgColor += vec3(0.3, 0.85, 1.0) * ringGlow;
        }

        finalColor = accumulatedColor + bgColor * (1.0 - accumulatedOpacity);
      }

      // Gravitational Redshift effect (In-fall camera mode)
      if (uRedshiftFactor > 0.01) {
        vec3 redShifted = vec3(finalColor.r * (1.0 + uRedshiftFactor), finalColor.g * (1.0 - uRedshiftFactor * 0.5), finalColor.b * (1.0 - uRedshiftFactor * 0.8));
        finalColor = mix(finalColor, redShifted, clamp(uRedshiftFactor, 0.0, 1.0));
      }

      // Tone mapping & Gamma Correction
      finalColor = finalColor / (finalColor + vec3(1.0));
      finalColor = pow(finalColor, vec3(1.0 / 2.2));

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};
