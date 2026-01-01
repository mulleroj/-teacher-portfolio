// ============================================
// NAVIGATION FUNCTIONALITY
// ============================================

const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');

// Sticky navbar on scroll with style change
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();
});

// Mobile menu toggle
mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');

    // Change icon
    if (navMenu.classList.contains('active')) {
        mobileToggle.textContent = '✕';
    } else {
        mobileToggle.textContent = '☰';
    }
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.textContent = '☰';
    });
});

// ============================================
// SMOOTH SCROLLING
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    console.log(`Found ${smoothScrollLinks.length} links for smooth scrolling`);

    // Handle initial hash scrolling (e.g. coming from another page)
    if (window.location.hash) {
        console.log('Initial hash detected:', window.location.hash);
        setTimeout(() => {
            const targetId = window.location.hash;
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                console.log('Scrolling to target section:', targetId);
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            } else {
                console.log('Target section not found for hash:', targetId);
            }
        }, 800); // Increased delay to ensure page is fully rendered
    }

    smoothScrollLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Skip empty hashes or just '#'
            if (targetId === '#') return;

            e.preventDefault();
            console.log('Click detected on:', this);

            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for navbar height

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // If it's a mobile menu link, close the menu
                if (this.classList.contains('nav-link') && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileToggle.textContent = '☰';
                }
            } else {
                console.log('Target section not found:', targetId);
            }
        });
    });
});

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with fade-in class
const fadeElements = document.querySelectorAll('.fade-in');
fadeElements.forEach(el => {
    observer.observe(el);
});

// Also add fade-in to specific elements if they don't have it
const dynamicFadeElements = document.querySelectorAll('.card, .about-content, .section-header');
dynamicFadeElements.forEach(el => {
    if (!el.classList.contains('fade-in')) {
        el.classList.add('fade-in');
        observer.observe(el);
    }
});

// ============================================
// HERO PARALLAX EFFECT
// ============================================

const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 700;
    }
});

// ============================================
// DYNAMIC TEXT EFFECTS
// ============================================

// Add gradient pulse animation to hero title on load
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero h1');

    if (heroTitle) {
        // Animate on page load
        setTimeout(() => {
            heroTitle.style.animation = 'fadeInUp 1s ease-out';
        }, 100);
    }
});

// ============================================
// SMOOTH PAGE TRANSITIONS
// ============================================

// Add slight delay to page elements appearing
window.addEventListener('load', () => {
    document.body.style.opacity = '0';

    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// ============================================
// CONTACT FORM ENHANCEMENT (if form is added later)
// ============================================

const contactItems = document.querySelectorAll('.contact-item');

contactItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'scale(1.05)';
        item.style.transition = 'transform 0.3s ease';
    });

    item.addEventListener('mouseleave', () => {
        item.style.transform = 'scale(1)';
    });
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Debounce scroll events for better performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = window.requestAnimationFrame(() => {
        // Scroll-based effects are handled here
    });
}, { passive: true });

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        mobileToggle.textContent = '☰';
    }
});

// Focus management for mobile menu
mobileToggle.addEventListener('focus', () => {
    mobileToggle.style.outline = '2px solid var(--accent-cyan)';
    mobileToggle.style.outlineOffset = '2px';
});

mobileToggle.addEventListener('blur', () => {
    mobileToggle.style.outline = 'none';
});

// ============================================
// CONSOLE GREETING
// ============================================

console.log('%c🎓 Welcome to AI Educator Portfolio!', 'font-size: 20px; color: #6366f1; font-weight: bold;');
console.log('%c✨ Built with modern web technologies and passion for education', 'font-size: 14px; color: #3b82f6;');
console.log('%c🤖 Interested in AI? Check out the AI News section!', 'font-size: 12px; color: #06b6d4;');
