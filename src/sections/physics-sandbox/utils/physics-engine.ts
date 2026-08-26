import type { PhysicsBody, CelestialBody, DoublePendulumState } from '../types';

// ----------------------------------------------------------------------

export function updatePhysicsBodies(
  bodies: PhysicsBody[],
  gravity: number = 0.5,
  width: number = 700,
  height: number = 460
): PhysicsBody[] {
  return bodies.map((body) => {
    if (body.isStatic) return body;

    let x = body.x + body.vx;
    let y = body.y + body.vy;
    let vx = body.vx * 0.995; // Air drag
    let vy = (body.vy + gravity) * 0.995;

    const r = body.radius || (body.width ? body.width / 2 : 20);

    // Floor collision
    if (y + r > height) {
      y = height - r;
      vy = -vy * body.restitution;
    }
    // Ceiling collision
    if (y - r < 0) {
      y = r;
      vy = -vy * body.restitution;
    }
    // Left/Right Wall collision
    if (x - r < 0) {
      x = r;
      vx = -vx * body.restitution;
    }
    if (x + r > width) {
      x = width - r;
      vx = -vx * body.restitution;
    }

    return { ...body, x, y, vx, vy };
  });
}

/**
 * Step Double Pendulum Physics (Lagrangian Equations)
 */
export function stepDoublePendulum(
  state: DoublePendulumState,
  g: number = 9.81,
  dt: number = 0.05
): DoublePendulumState {
  const { l1, l2, m1, m2, theta1, theta2, omega1, omega2, trace } = state;

  const delta = theta1 - theta2;

  const num1 =
    -g * (2 * m1 + m2) * Math.sin(theta1) -
    m2 * g * Math.sin(theta1 - 2 * theta2) -
    2 * Math.sin(delta) * m2 * (omega2 * omega2 * l2 + omega1 * omega1 * l1 * Math.cos(delta));
  const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
  const alpha1 = num1 / den1;

  const num2 =
    2 *
    Math.sin(delta) *
    (omega1 * omega1 * l1 * (m1 + m2) +
      g * (m1 + m2) * Math.cos(theta1) +
      omega2 * omega2 * l2 * m2 * Math.cos(delta));
  const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
  const alpha2 = num2 / den2;

  const nextOmega1 = (omega1 + alpha1 * dt) * 0.999;
  const nextOmega2 = (omega2 + alpha2 * dt) * 0.999;
  const nextTheta1 = theta1 + nextOmega1 * dt;
  const nextTheta2 = theta2 + nextOmega2 * dt;

  // Calculate tip coordinates
  const x1 = l1 * Math.sin(nextTheta1);
  const y1 = l1 * Math.cos(nextTheta1);
  const x2 = x1 + l2 * Math.sin(nextTheta2);
  const y2 = y1 + l2 * Math.cos(nextTheta2);

  const nextTrace = [...trace, { x: x2, y: y2 }];
  if (nextTrace.length > 250) {
    nextTrace.shift();
  }

  return {
    ...state,
    theta1: nextTheta1,
    theta2: nextTheta2,
    omega1: nextOmega1,
    omega2: nextOmega2,
    trace: nextTrace,
  };
}

/**
 * Step N-Body Celestial Gravitational Simulation (Velocity Verlet / RK4)
 */
export function stepCelestialBodies(
  bodies: CelestialBody[],
  G: number = 1.2,
  softening: number = 15,
  dt: number = 0.5
): CelestialBody[] {
  const n = bodies.length;
  const nextBodies = bodies.map((b) => ({
    ...b,
    trail: [...b.trail],
  }));

  // Calculate gravitational accelerations
  const ax = new Float64Array(n);
  const ay = new Float64Array(n);

  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const dx = bodies[j].x - bodies[i].x;
      const dy = bodies[j].y - bodies[i].y;
      const distSq = dx * dx + dy * dy + softening * softening;
      const dist = Math.sqrt(distSq);
      const force = (G * bodies[i].mass * bodies[j].mass) / distSq;

      const fx = (force * dx) / dist;
      const fy = (force * dy) / dist;

      ax[i] += fx / bodies[i].mass;
      ay[i] += fy / bodies[i].mass;

      ax[j] -= fx / bodies[j].mass;
      ay[j] -= fy / bodies[j].mass;
    }
  }

  // Update positions and velocities
  for (let i = 0; i < n; i += 1) {
    const b = nextBodies[i];
    b.vx += ax[i] * dt;
    b.vy += ay[i] * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 180) {
      b.trail.shift();
    }
  }

  return nextBodies;
}
