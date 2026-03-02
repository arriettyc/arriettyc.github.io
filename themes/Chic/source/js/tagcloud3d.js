/**
 * 3D Tag Cloud
 * A modern, interactive 3D tag cloud visualization
 * Features: Mouse tracking, smooth rotation, responsive sizing
 */

class TagCloud3D {
  constructor(container, tags, options = {}) {
    this.container = container;
    this.tags = tags;

    // Configuration
    this.config = {
      radius: options.radius || 200,
      maxSpeed: options.maxSpeed || 'normal',
      initSpeed: options.initSpeed || 'normal',
      direction: options.direction || 135,
      keep: options.keep !== undefined ? options.keep : true,
      useContainerInlineStyles: options.useContainerInlineStyles !== undefined ? options.useContainerInlineStyles : true,
      ...options
    };

    // Speed presets
    this.speedPresets = {
      slow: 0.3,
      normal: 1,
      fast: 2
    };

    // State
    this.items = [];
    this.active = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.radiusX = this.config.radius;
    this.radiusY = this.config.radius;
    this.radiusZ = this.config.radius;

    // Animation
    this.frameId = null;

    // Initialize
    this.init();
  }

  init() {
    this.createTagElements();
    this.initPosition();
    this.bindEvents();
    this.animate();
  }

  createTagElements() {
    const fragment = document.createDocumentFragment();

    this.tags.forEach((tag, index) => {
      const el = document.createElement('a');
      el.href = tag.href;
      el.className = 'tag-cloud-item';
      el.textContent = tag.name;
      el.style.color = this.getRandomColor();

      // Store 3D coordinates
      el._3d = {
        x: 0,
        y: 0,
        z: 0
      };

      this.items.push(el);
      fragment.appendChild(el);
    });

    this.container.appendChild(fragment);
  }

  initPosition() {
    const len = this.items.length;

    // Distribute items on a sphere using Fibonacci sphere algorithm
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

    this.items.forEach((item, i) => {
      const y = 1 - (i / (len - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      item._3d.x = x * this.radiusX;
      item._3d.y = y * this.radiusY;
      item._3d.z = z * this.radiusZ;
    });
  }

  bindEvents() {
    // Mouse move tracking
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      this.mouseY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      this.active = true;
    });

    // Mouse enter
    this.container.addEventListener('mouseenter', () => {
      this.active = true;
    });

    // Mouse leave
    this.container.addEventListener('mouseleave', () => {
      this.active = false;
      this.mouseX = 0;
      this.mouseY = 0;
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.updateRadius();
    });

    // Initial radius update
    this.updateRadius();
  }

  updateRadius() {
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;

    // Responsive radius based on container size
    const baseRadius = Math.min(containerWidth, containerHeight) * 0.35;
    this.radiusX = this.radiusY = this.radiusZ = baseRadius;
  }

  animate() {
    this.rotateItems();
    this.updateItemsPosition();
    this.frameId = requestAnimationFrame(() => this.animate());
  }

  rotateItems() {
    // Calculate rotation speed
    const speed = this.getSpeed();
    const angleX = this.active ? this.mouseY * speed * 0.01 : speed * 0.001;
    const angleY = this.active ? this.mouseX * speed * 0.01 : speed * 0.001;

    const cos_x = Math.cos(angleX);
    const sin_x = Math.sin(angleX);
    const cos_y = Math.cos(angleY);
    const sin_y = Math.sin(angleY);

    this.items.forEach(item => {
      const pos = item._3d;

      // Rotate around X axis
      let y1 = pos.y * cos_x - pos.z * sin_x;
      let z1 = pos.z * cos_x + pos.y * sin_x;

      // Rotate around Y axis
      let x1 = pos.x * cos_y - z1 * sin_y;
      let z2 = z1 * cos_y + pos.x * sin_y;

      pos.x = x1;
      pos.y = y1;
      pos.z = z2;
    });
  }

  updateItemsPosition() {
    // Sort items by z-index (depth)
    const sortedItems = [...this.items].sort((a, b) => b._3d.z - a._3d.z);

    this.items.forEach(item => {
      const pos = item._3d;

      // Perspective projection
      const scale = (this.radiusZ + this.radiusZ + pos.z) / (2 * this.radiusZ);

      // Calculate position
      const x = pos.x + this.container.offsetWidth / 2;
      const y = pos.y + this.container.offsetHeight / 2;

      // Apply transformations
      const alpha = (pos.z + this.radiusZ) / (2 * this.radiusZ);
      const fontSize = 0.6 + 0.4 * alpha; // Scale between 0.6 and 1.0

      item.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${fontSize})`;
      item.style.opacity = 0.3 + alpha * 0.7; // Opacity between 0.3 and 1.0
      item.style.zIndex = Math.floor(alpha * 1000);
      item.style.filter = `blur(${Math.max(0, 3 - alpha * 3)}px)`;
    });
  }

  getSpeed() {
    const speedKey = typeof this.config.maxSpeed === 'string'
      ? this.config.maxSpeed
      : 'normal';
    return this.speedPresets[speedKey] || 1;
  }

  getRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
      '#FF7F50', '#6A5ACD', '#FF69B4', '#20B2AA', '#FFD700',
      '#9B59B6', '#3498DB', '#E74C3C', '#1ABC9C', '#F39C12'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  destroy() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.container.innerHTML = '';
  }
}

// Initialize tag cloud on page load
if (typeof window !== 'undefined') {
  window.TagCloud3D = TagCloud3D;

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tag-cloud-3d');
    if (container && window.tagCloudData) {
      new TagCloud3D(container, window.tagCloudData, {
        radius: 250,
        maxSpeed: 'normal',
        initSpeed: 'normal',
        keep: true
      });
    }
  });
}
