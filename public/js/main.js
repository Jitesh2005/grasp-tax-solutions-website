// js/main.js

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,  // Animation duration in milliseconds
    once: true       // Whether animation should happen only once
});

// Optional: Smooth scroll behavior for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Optional: Responsive navbar toggle (for mobile if you implement one)
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// ✅ Show only the section matching the URL hash (e.g. #tax or #legal)
function showServiceSection(hash) {
    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(section => section.classList.remove('active'));
    const target = document.querySelector(hash);
    if (target) target.classList.add('active');
}

// ✅ Initial load and hash change listener
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash || '#tax'; // default to #tax
    showServiceSection(hash);
});

window.addEventListener('hashchange', () => {
    showServiceSection(window.location.hash);
});

console.log("Grasp Tax Solutions website loaded successfully with AOS animations and enhancements.");