import React, { useEffect, useRef, useState } from 'react';
import libraryBg from '../assets/library_bg_v2.png';

const SpotlightBackground = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth) * 2 - 1;
            const y = (e.clientY / innerHeight) * 2 - 1;

            setMousePos({ x, y });

            containerRef.current.style.setProperty('--mouse-x', e.clientX + 'px');
            containerRef.current.style.setProperty('--mouse-y', e.clientY + 'px');
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Particle System
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle configuration
        const particleCount = 60;
        const particles = [];

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Slower, floaty movement
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.size = Math.random() * 2 + 0.5; // Slightly varied sizes
                this.opacity = Math.random() * 0.5 + 0.1;
                this.fadeSpeed = Math.random() * 0.005 + 0.002;
                this.fadeDirection = 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Subtle repulsion from mouse
                const dx = this.x - (parseFloat(containerRef.current?.style.getPropertyValue('--mouse-x')) || 0);
                const dy = this.y - (parseFloat(containerRef.current?.style.getPropertyValue('--mouse-y')) || 0);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * 0.5;
                    this.y += Math.sin(angle) * 0.5;
                }

                // Wrap around screen
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;

                // Twinkle effect
                this.opacity += this.fadeSpeed * this.fadeDirection;
                if (this.opacity > 0.6 || this.opacity < 0.1) {
                    this.fadeDirection *= -1;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(243, 156, 18, ${this.opacity})`; // Gold color #F39C12
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const moveX = mousePos.x * -20;
    const moveY = mousePos.y * -20;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 overflow-hidden bg-[#0f172a]"
        >
            {/* Background Image with Parallax */}
            <div
                className="absolute inset-[-50px] bg-cover bg-center transition-transform duration-100 ease-out will-change-transform"
                style={{
                    backgroundImage: `url(${libraryBg})`,
                    transform: `translate(${moveX}px, ${moveY}px) scale(1.05)`,
                    filter: 'brightness(0.5) contrast(1.15) blur(1.5px)', // Slightly darker for particles to pop
                }}
            />

            {/* Canvas for Particles */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 pointer-events-none"
            />

            {/* Spotlight Mask */}
            <div
                className="absolute inset-0 pointer-events-none transition-colors duration-300 z-20"
                style={{
                    background: `radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), transparent 0%, rgba(2, 6, 23, 0.7) 40%, rgba(2, 6, 23, 0.95) 100%)`
                }}
            />

            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay z-20"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Warm Glow Tint */}
            <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                    background: `radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(234, 179, 8, 0.1), transparent 70%)`,
                    mixBlendMode: 'plus-lighter'
                }}
            />
        </div>
    );
};

export default SpotlightBackground;
