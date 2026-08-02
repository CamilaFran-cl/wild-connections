'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
    }

    // 3. Scroll reveal
    const revealElements = document.querySelectorAll('.reveal, .reveal-scale');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // 4. Active nav link
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(link => {
        if (link.getAttribute('href') === currentPath || (currentPath === '/' && link.getAttribute('href') === '/index.html')) {
            link.classList.add('active');
        }
    });

    // 5. Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu on link click
                    if (navToggle && navLinks && navToggle.classList.contains('open')) {
                        navToggle.classList.remove('open');
                        navLinks.classList.remove('open');
                    }
                }
            }
        });
    });

    // 6. Page entrance animation
    const mainContent = document.querySelector('main') || document.body;
    if (mainContent) {
        mainContent.classList.add('page-enter');
    }

    // 7. Check Authentication State (Update Navigation)
    const userPlan = localStorage.getItem('wc_user_plan');
    if (userPlan) {
        // User is logged in
        const avatarUrl = localStorage.getItem('wc_profile_image') || 'assets/mentor-isabella.jpg';
        
        // Desktop Navbar
        const loginLinkDesktop = document.querySelector('.nav-actions a[href="login.html"]');
        if (loginLinkDesktop) {
            const profileLink = document.createElement('a');
            profileLink.href = 'my-profile.html';
            profileLink.className = 'nav-profile-avatar';
            profileLink.style.cssText = 'margin-right: 15px; display: inline-block; width: 36px; height: 36px; border-radius: 50%; overflow: hidden; border: 2px solid var(--gold-primary); vertical-align: middle; cursor: pointer;';
            profileLink.innerHTML = `<img src="${avatarUrl}" alt="Mi Perfil" style="width: 100%; height: 100%; object-fit: cover;">`;
            loginLinkDesktop.replaceWith(profileLink);
        }

        // Mobile Navbar
        const loginLinkMobile = document.querySelector('.mobile-nav-inner a[href="login.html"]');
        if (loginLinkMobile) {
            loginLinkMobile.href = 'my-profile.html';
            loginLinkMobile.innerHTML = `
                <img src="${avatarUrl}" alt="Perfil" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid var(--gold-primary);">
                Mi Perfil
            `;
        }
    }
});
