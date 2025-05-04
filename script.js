

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- Utility Functions ---
    const select = (selector, parent = document) => parent.querySelector(selector);
    const selectAll = (selector, parent = document) => parent.querySelectorAll(selector);
    const on = (type, selector, listener, options = false) => {
        // Event delegation helper
        document.addEventListener(type, (e) => {
            const targetElement = e.target.closest(selector);
            if (targetElement) {
                listener.call(targetElement, e); // Ensure 'this' refers to the '.selector' element
            }
        }, options);
    };
    const onScroll = (listener) => window.addEventListener('scroll', listener);
    const onLoad = (listener) => window.addEventListener('load', listener);


    // --- Configuration ---
    const themes = [
        { name: 'Default Purple', primary: '#4a00e0', secondary: '#8e2de2', accent: '#00bcd4' },
        { name: 'Ocean Blue', primary: '#0052D4', secondary: '#4364F7', accent: '#6FB1FC' },
        { name: 'Emerald Green', primary: '#1D976C', secondary: '#59C173', accent: '#93F9B9' },
        { name: 'Sunset Orange', primary: '#FF8C00', secondary: '#FFA500', accent: '#FFD700' },
        { name: 'Crimson Red', primary: '#D31027', secondary: '#EA384D', accent: '#FF8A80' },
    ];
    let currentThemeIndex = 0;


    // --- Element Selectors ---
    const preloader = select('#preloader');
    const header = select('.site-header');
    const menuToggle = select('#menu-toggle');
    const navLinksContainer = select('#nav-links');
    const navLinks = selectAll('.nav-links a.nav-item[href^="#"]'); // Select only internal nav links
    const backToTopButton = select('.back-to-top');
    const yearSpan = select('#year');
    const contactForm = select('#contactForm');
    const themeSwitcherButton = select('#theme-switcher');
    const typewriterElement = select('#typewriter');
    // Select elements for scroll animation based on data-aos attribute OR custom classes
    const animatedElements = selectAll('[data-aos], .fade-in, .slide-up'); // Include AOS targets if used
    const statNumbers = selectAll('.stat-number');
    const educationTabs = selectAll('.education-tabs .nav-link'); // Target Bootstrap buttons/links
    const educationContents = selectAll('.education-content .tab-pane'); // Target Bootstrap panes

    // --- 1. Preloader ---
    onLoad(() => {
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden'; // Hide completely after fade
            setTimeout(() => {
                preloader.remove(); // Remove from DOM after transition
            }, 500); // Match CSS transition duration
        }
    });

    // --- 2. Sticky Header ---
    const handleScrollHeader = () => {
        if (!header) return;
        window.scrollY > 50 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
    };
    onScroll(handleScrollHeader);
    handleScrollHeader(); // Initial check

    // --- 3. Mobile Navigation ---
    if (menuToggle && navLinksContainer) {
        on('click', '#menu-toggle', function(e) {
            e.preventDefault();
            navLinksContainer.classList.toggle('active');
            const isExpanded = navLinksContainer.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            // Change hamburger to X icon (Requires Font Awesome fa-times)
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Close menu when a link is clicked (on mobile)
        on('click', '#nav-links a', () => {
            if (navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

         // Close menu when clicking outside
         document.addEventListener('click', (e) => {
             if (navLinksContainer.classList.contains('active') &&
                 !navLinksContainer.contains(e.target) &&
                 !menuToggle.contains(e.target)) {
                 navLinksContainer.classList.remove('active');
                 menuToggle.setAttribute('aria-expanded', 'false');
                 const icon = menuToggle.querySelector('i');
                 if (icon) {
                     icon.classList.remove('fa-times');
                     icon.classList.add('fa-bars');
                 }
             }
         });
    }

    // --- 4 & 5. Smooth Scrolling & Active Nav Link Highlighting ---
    const activateNavLink = (targetId) => {
        if (!targetId) return; // Ensure targetId is valid
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${targetId}`) {
                link.classList.add('active');
            }
        });
         // Remove active state from non-internal links like Resume
         selectAll('.nav-links .resume-nav-btn').forEach(link => link.classList.remove('active'));
    };

    // Smooth scroll for internal links (includes #home)
    on('click', '.nav-links a[href^="#"]', function(e) {
        const href = this.getAttribute('href');
        const targetElement = select(href);

        if (targetElement) {
            e.preventDefault();
            const headerHeight = header ? header.offsetHeight : 70; // Fallback height
            const elementPosition = targetElement.offsetTop;
            // Adjust offset: subtract header height and add a small buffer (e.g., 10px)
            const offsetPosition = elementPosition - headerHeight - 10;

            window.scrollTo({
                top: offsetPosition < 0 ? 0 : offsetPosition, // Prevent scrolling above top
                behavior: 'smooth'
            });

             // Close mobile menu if open
             if (navLinksContainer.classList.contains('active')) {
                 navLinksContainer.classList.remove('active');
                 menuToggle.setAttribute('aria-expanded', 'false');
                 const icon = menuToggle.querySelector('i');
                  if (icon) {
                      icon.classList.remove('fa-times');
                      icon.classList.add('fa-bars');
                  }
             }
        }
        // If it's just "#", scroll to top smoothly
        else if (href === "#") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // Intersection Observer for Active Nav Link Highlighting
    const sectionObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            // Check if section is sufficiently visible in the top part of the viewport
            if (entry.isIntersecting && entry.boundingClientRect.top <= (header ? header.offsetHeight + 50 : 120)) {
                activateNavLink(entry.target.id);
            }
        });
    };
    const sectionObserverOptions = {
        root: null,
        
        rootMargin: `-${header ? header.offsetHeight : 70}px 0px -40% 0px`,
        threshold: 0 // Trigger as soon as the section edge enters/leaves the margin bounds
    };
    const sectionObserver = new IntersectionObserver(sectionObserverCallback, sectionObserverOptions);
    selectAll('section[id]').forEach(section => sectionObserver.observe(section));
    // Initial check for home section on page load
    if (window.scrollY < 100) { activateNavLink('home'); }


    // --- 6. Typing Effect ---
    const typingTexts = ["B.Tech IT Student", "Aspiring Developer", "Cloud Enthusiast", "Python Programmer"];
    let typeIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeTimeout; // Store timeout to clear it if needed

    function typeEffect() {
        if (!typewriterElement) return;
        clearTimeout(typeTimeout); // Clear previous timeout

        const currentText = typingTexts[typeIndex];
        const speed = isDeleting ? (50 + Math.random() * 50) : (100 + Math.random() * 100);

        // Update text content
        typewriterElement.textContent = currentText.substring(0, charIndex);
        typewriterElement.style.borderRightColor = 'var(--primary-color)'; // Ensure cursor is visible during typing/deleting

        if (!isDeleting && charIndex < currentText.length) {
            // Typing forward
            charIndex++;
            typeTimeout = setTimeout(typeEffect, speed);
        } else if (isDeleting && charIndex > 0) {
            // Deleting
            charIndex--;
            typeTimeout = setTimeout(typeEffect, speed);
        } else {
            // Switch state (finished typing or finished deleting)
            isDeleting = !isDeleting;
            if (!isDeleting) { // If just finished deleting, move to next text
                typeIndex = (typeIndex + 1) % typingTexts.length;
            }
            // Pause at the end of typing or deleting
            const pauseTime = isDeleting ? 1500 : 500; // Longer pause after typing
            // Hide cursor during pause before deleting, show during pause before typing
            typewriterElement.style.borderRightColor = isDeleting ? 'transparent' : 'var(--primary-color)';
            typeTimeout = setTimeout(typeEffect, pauseTime);
        }
    }
    if (typewriterElement) {
        typeTimeout = setTimeout(typeEffect, 1000); // Start after initial delay
    }

    // --- 7. Scroll Animations (Intersection Observer or AOS) ---
   
    const animationObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If using AOS, AOS handles adding its own class.
                // If using custom observer:
                 entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    };
    const animationObserverOptions = {
        root: null, rootMargin: '0px', threshold: 0.1 // Trigger when 10% visible
    };
    const animationObserver = new IntersectionObserver(animationObserverCallback, animationObserverOptions);
    // Observe elements with data-aos attribute OR specific animation classes
    selectAll('[data-aos], .fade-in, .slide-up, .fade-up, .zoom-in, .fade-left, .fade-right').forEach(el => {
        animationObserver.observe(el);
    });
    
    // --- 8. Stats Counter ---
    const counterObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const numbersToAnimate = section.querySelectorAll('.stat-number');
                numbersToAnimate.forEach(num => {
                    if (num.classList.contains('counted')) return;
                    num.classList.add('counted');

                    const target = +num.dataset.target;
                    const duration = 1500; // ms
                    let start = 0;
                    const stepTime = 16; // approx 60fps
                    const steps = Math.ceil(duration / stepTime);
                    const increment = target / steps;
                    let currentStep = 0;

                    const updateCount = () => {
                        start += increment;
                        currentStep++;
                        if (currentStep < steps) {
                            num.textContent = Math.ceil(start);
                            requestAnimationFrame(updateCount);
                        } else {
                            num.textContent = target; // Ensure final exact value
                        }
                    };
                    requestAnimationFrame(updateCount);
                });
                 observer.unobserve(section); // Count only once
            }
        });
    };
    const counterObserverOptions = { threshold: 0.5 };
    const counterObserver = new IntersectionObserver(counterObserverCallback, counterObserverOptions);
    const statsSection = select('#stats');
    if (statsSection) { counterObserver.observe(statsSection); }

    // --- 9. Skills Progress Bars ---
    const skillsObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillsSectionElement = entry.target;
                // Correctly select the fill elements
                const progressFills = skillsSectionElement.querySelectorAll('.progress-fill');

                progressFills.forEach((fill, index) => {
                    // Check if already animated (width is not '0%' or empty)
                    if (fill.style.width && fill.style.width !== '0%') return;

                    // Find the corresponding progress-bar parent to get the target width
                    const progressBar = fill.closest('.progress-bar');
                    const targetWidth = progressBar ? progressBar.style.width : '0%'; // Read from inline style

                    if (targetWidth && targetWidth !== '0%') {
                        setTimeout(() => {
                           fill.style.width = targetWidth; // Animate the .progress-fill
                        }, 150 * index); // Stagger animation slightly
                    }
                });
                 observer.unobserve(skillsSectionElement); // Animate only once
            }
        });
    };
    const skillsObserverOptions = { threshold: 0.3 };
    const skillsObserver = new IntersectionObserver(skillsObserverCallback, skillsObserverOptions);
    const skillsSection = select('#skills');
    if (skillsSection) {
        // Initialize progress fills to 0 width visually before observing
        // (CSS already sets initial width: 0)
        skillsObserver.observe(skillsSection);
    }

    // --- 10. Education Tabs ---
    // Works independently of Bootstrap JS by managing 'active' class on content panes
    if (educationTabs.length > 0 && educationContents.length > 0) {
        on('click', '.education-tabs .nav-link', function(e) { // Target Bootstrap's nav-link
            e.preventDefault();

            // Get the target content ID from data-bs-target or data-target
            const targetId = this.dataset.bsTarget || this.dataset.target;
            if (!targetId) return; // Exit if no target defined

            // Deactivate all tabs and content panes
            educationTabs.forEach(tab => tab.classList.remove('active'));
            educationContents.forEach(content => content.classList.remove('active'));

            // Activate clicked tab
            this.classList.add('active');
            // Activate corresponding content pane by ID
            const targetContent = select(targetId); // Use the ID from data-target
            if (targetContent) {
                targetContent.classList.add('active'); // Add 'active' class for CSS to show
            } else {
                 console.warn(`Education tab content not found for selector: ${targetId}`);
            }
        });

        // Ensure the first tab/pane is active by default if none have 'active' class initially
        if (!select('.education-tabs .nav-link.active') && educationTabs[0]) {
            educationTabs[0].classList.add('active');
            const firstTargetId = educationTabs[0].dataset.bsTarget || educationTabs[0].dataset.target;
            const firstContent = firstTargetId ? select(firstTargetId) : null;
            if (firstContent) {
                firstContent.classList.add('active');
            }
        }
    }


    // --- 11. Contact Form ---
    // The form now submits directly to Formspree via the action attribute in index.html
    // The custom JavaScript submission handling has been removed.

    // --- 12. Dynamic Footer Year ---
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    // --- 13. Back-to-Top Button ---
    const handleScrollBackToTop = () => {
        if (!backToTopButton) return;
        window.scrollY > 200 ? backToTopButton.classList.add('visible') : backToTopButton.classList.remove('visible');
    };
    onScroll(handleScrollBackToTop);
    handleScrollBackToTop(); // Initial check
    on('click', '.back-to-top', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- 14. Theme Switcher ("Painter" effect) ---
    const applyTheme = (themeIndex) => {
        const theme = themes[themeIndex];
        if (!theme) return;
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--secondary-color', theme.secondary);
        root.style.setProperty('--accent-color', theme.accent);
        // Add logic here to update --accent-color-darker if needed, e.g., based on the new accent color
        // Or define it directly in the themes object: { name: '...', ..., accent: '#...', accentDarker: '#...' }

        localStorage.setItem('portfolioThemeIndex', themeIndex);
        if (themeSwitcherButton) {
             themeSwitcherButton.setAttribute('title', `Current Theme: ${theme.name}. Click to change.`);
        }
    };

    const cycleTheme = () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        applyTheme(currentThemeIndex);
    };

    if (themeSwitcherButton) { on('click', '#theme-switcher', cycleTheme); }

    // Load saved theme on startup
    const savedThemeIndex = localStorage.getItem('portfolioThemeIndex');
    if (savedThemeIndex !== null && themes[+savedThemeIndex]) { // Convert to number
        currentThemeIndex = +savedThemeIndex;
    }
    applyTheme(currentThemeIndex); // Apply initial/saved theme

}); // End DOMContentLoaded
