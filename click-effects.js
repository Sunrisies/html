(function() {
    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.1);
            transform: scale(0);
            animation: ripple 0.8s linear;
            pointer-events: none;
        }

        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .particle {
            position: absolute;
            pointer-events: none;
            animation: particle 1s linear forwards;
        }

        @keyframes particle {
            0% {
                transform: translate(0, 0);
                opacity: 1;
            }
            100% {
                transform: translate(var(--tx), var(--ty));
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    class ClickEffects {
        constructor(options = {}) {
            this.colors = options.colors || ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
            this.particleCount = options.particleCount || 12;
            this.rippleSize = options.rippleSize || 0.1;
            this.init();
        }

        init() {
            document.addEventListener('click', this.handleClick.bind(this));
        }

        createRipple(e) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            
            const size = Math.max(window.innerWidth, window.innerHeight) * this.rippleSize;
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = e.clientX - size/2 + 'px';
            ripple.style.top = e.clientY - size/2 + 'px';
            
            document.body.appendChild(ripple);
            
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        }

        createParticles(e) {
            for (let i = 0; i < this.particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 8 + 4;
                const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                const angle = (Math.PI * 2 * i) / this.particleCount;
                const velocity = Math.random() * 100 + 50;
                
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity;
                
                particle.style.width = particle.style.height = size + 'px';
                particle.style.backgroundColor = color;
                particle.style.left = e.clientX - size/2 + 'px';
                particle.style.top = e.clientY - size/2 + 'px';
                particle.style.setProperty('--tx', `${tx}px`);
                particle.style.setProperty('--ty', `${ty}px`);
                
                document.body.appendChild(particle);
                
                particle.addEventListener('animationend', () => {
                    particle.remove();
                });
            }
        }

        handleClick(e) {
            this.createRipple(e);
            this.createParticles(e);
        }
    }

    // 暴露到全局
    window.ClickEffects = ClickEffects;
})();