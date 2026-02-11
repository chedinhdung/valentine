class Particle {
  constructor(radius) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const r = radius * Math.cbrt(Math.random());

    this.ox = r * Math.sin(phi) * Math.cos(theta);
    this.oy = r * Math.sin(phi) * Math.sin(theta);
    this.oz = r * Math.cos(phi);

    this.x = this.ox;
    this.y = this.oy;
    this.z = this.oz;

    this.vx = 0;
    this.vy = 0;
    this.vz = 0;

    this.angle = Math.random() * Math.PI * 2;
    this.speed = 0.002 + Math.random() * 0.004;
    this.spin = Math.random() * Math.PI * 2;

    this.baseSize = 0.6 + Math.random() * 0.6;

    this.color = {
      r: 255,
      g: 40 + Math.random() * 30,
      b: 160 + Math.random() * 40
    };
  }

  explode() {
    const power = 6 + Math.random() * 6;
    const len = Math.sqrt(
      this.x*this.x +
      this.y*this.y +
      this.z*this.z
    ) || 1;

    this.vx = (this.x / len) * power;
    this.vy = (this.y / len) * power;
    this.vz = (this.z / len) * power;
  }

  update(state) {
    if (state === "idle") {
      this.angle += this.speed;
      this.x += Math.sin(this.angle) * 0.08;
      this.y += Math.cos(this.angle) * 0.08;
    }

    if (state === "explode") {
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;

      this.vx *= 0.985;
      this.vy *= 0.985;
      this.vz *= 0.985;

      this.spin += 0.02;

      const drift = 0.12;
      const swirl = Math.sin(this.spin + this.z * 0.01) * 0.08;
      this.x += drift + swirl;
    }

    if (state === "rewind") {
      this.x += (this.ox - this.x) * 0.08;
      this.y += (this.oy - this.y) * 0.08;
      this.z += (this.oz - this.z) * 0.08;
    }
  }

  draw(ctx, cx, cy) {
    const depth = 900;
    const scale = depth / (depth + this.z);
    if (scale <= 0) return;

    const x2d = cx + this.x * scale;
    const y2d = cy + this.y * scale;

    const size = Math.max(0.1, this.baseSize * scale * 1.4);
    const alpha = Math.min(1, Math.max(0.25, scale));

    ctx.beginPath();
    ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${alpha})`;
    ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class NanoEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    
    const isMobile = window.innerWidth < 768;

    this.radius = isMobile ? 140 : 220;     
    this.count = isMobile ? 3500 : 7000;    

    this.particles = [];
    this.state = "idle";

    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.toggle();
    }, { passive: false });

    this.canvas.addEventListener("click", () => this.toggle());

    for (let i = 0; i < this.count; i++) {
      this.particles.push(new Particle(this.radius));
    }
  }


  resize() {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
  }

  toggle() {
    if (this.state === "idle") {
      this.state = "explode";
      for (let p of this.particles) p.explode();
    } else if (this.state === "explode") {
      this.state = "rewind";
    } else {
      this.state = "idle";
    }
  }

  update() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    for (let p of this.particles) {
      p.update(this.state);
      p.draw(this.ctx, cx, cy);
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.update();
    requestAnimationFrame(() => this.animate());
  }
}
