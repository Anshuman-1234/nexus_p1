import React, { useEffect, useRef } from 'react';

const FlowBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let flowField = [];
        const cellSize = 20;
        let rows, cols;

        // Configuration
        const particleCount = 1200; // Dense but performant
        const textParticlesCount = 15;
        const words = ["Knowledge", "Wisdom", "Search", "Discover", "Read", "Learn", "Create", "Imagine", "SOA", "Library", "Research", "Dream"];

        // Simplex noise shim (simple pseudo-random noise for flow)
        const noise = (x, y) => {
            return Math.sin(x * 0.01) + Math.cos(y * 0.01) * Math.sin(x * 0.01);
        };

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            cols = Math.floor(width / cellSize);
            rows = Math.floor(height / cellSize);
        };

        class Particle {
            constructor(isText = false) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.history = [{ x: this.x, y: this.y }];
                this.maxLength = Math.random() * 20 + 10;
                this.timer = this.maxLength * 2;
                this.speed = Math.random() * 1 + 0.5;
                this.angle = 0;
                this.isText = isText;
                this.word = isText ? words[Math.floor(Math.random() * words.length)] : null;
                this.fontSize = Math.random() * 10 + 12;
                this.color = `hsla(35, 90%, ${Math.random() * 40 + 40}%, ${isText ? 0.8 : 0.5})`; // Gold/Amber
            }

            update(mouseX, mouseY) {
                this.timer--;
                if (this.timer < 1) {
                    this.reset();
                }

                // Calculate grid position
                let x = Math.floor(this.x / cellSize);
                let y = Math.floor(this.y / cellSize);
                let index = x + y * cols;

                // Flow field angle
                if (flowField[index]) {
                    this.angle = flowField[index];
                } else {
                    this.angle = noise(this.x, this.y); // Fallback
                }

                // Mouse interaction (Repel)
                if (mouseX && mouseY) {
                    const dx = this.x - mouseX;
                    const dy = this.y - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 200) {
                        const force = (200 - dist) / 200;
                        this.angle += force * 2; // Curve away
                    }
                }

                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;

                // Wrap around
                if (this.x > width) this.x = 0;
                if (this.x < 0) this.x = width;
                if (this.y > height) this.y = 0;
                if (this.y < 0) this.y = height;

                // Trail history
                if (!this.isText) {
                    this.history.push({ x: this.x, y: this.y });
                    if (this.history.length > this.maxLength) {
                        this.history.shift();
                    }
                }
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.history = [{ x: this.x, y: this.y }];
                this.timer = this.maxLength * 2;
            }

            draw() {
                if (this.isText) {
                    ctx.font = `italic ${this.fontSize}px 'Playfair Display', serif`;
                    ctx.fillStyle = this.color;
                    ctx.fillText(this.word, this.x, this.y);
                } else {
                    ctx.beginPath();
                    if (this.history.length > 1) {
                        ctx.moveTo(this.history[0].x, this.history[0].y);
                        for (let i = 1; i < this.history.length; i++) {
                            ctx.lineTo(this.history[i].x, this.history[i].y);
                        }
                    } else {
                        ctx.rect(this.x, this.y, 1, 1);
                    }
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        const init = () => {
            resize();
            particles = [];
            // Regular ink particles
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(false));
            }
            // Text particles
            for (let i = 0; i < textParticlesCount; i++) {
                particles.push(new Particle(true));
            }
        };

        const animate = () => {
            // Fade out effect for trails
            ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'; // Dark Navy fade
            ctx.fillRect(0, 0, width, height);

            // Update Flow Field (Dynamic noise)
            const time = Date.now() * 0.0002;
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const angle = (Math.cos(x * 0.05 + time) + Math.sin(y * 0.05 + time)) * Math.PI;
                    const index = x + y * cols;
                    flowField[index] = angle;
                }
            }

            particles.forEach(p => {
                p.update(window.mouseX, window.mouseY); // Assume global mouse for now or attach listener
                p.draw();
            });

            requestAnimationFrame(animate);
        };

        // Mouse tracking
        window.mouseX = 0;
        window.mouseY = 0;
        const handleMouseMove = (e) => {
            window.mouseX = e.clientX;
            window.mouseY = e.clientY;
        };

        init();
        animate();

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: 'transparent' }}
        />
    );
};

export default FlowBackground;
