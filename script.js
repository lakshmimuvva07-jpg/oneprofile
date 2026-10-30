/**
 * ==============================================================================
 * ONEPROFILE — CLIENT APPLICATION SCRIPT
 * Brand: OneProfile
 * Tagline: One Link, Everything You Need
 * Architecture & Governance Model:
 *   - Read-Only Public Experience: Public visitors and regular user accounts have
 *     strictly read-only access to browse the profile, features, and showcase.
 *   - Exclusive Administrator Control: All global website colors, themes,
 *     branding assets, content, and settings are governed centrally by the platform
 *     administrator.
 *   - Security Requirement: Secure administrator-only editing requires backend
 *     authentication and server-side role-based authorization (RBAC). No admin
 *     passwords, client-side flags, or editing tools are exposed in the frontend.
 *   - User Account Capabilities: Regular users can Sign Up, Login, view the
 *     website and its features, and Logout. Regular users cannot edit their profile
 *     appearance or platform settings.
 * Compatibility: Plain vanilla JavaScript, zero external libraries, GitHub Pages ready
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ==========================================================================
       1. GLOBAL CONSTANTS & USER SESSION KEYS
       ========================================================================== */
    const SESSION_USER_KEY = 'oneprofile_active_user';
    const LEGACY_THEME_KEY = 'oneprofile_saved_theme';

    // Clear legacy client-side theme overrides to ensure pristine official palette
    try {
        localStorage.removeItem(LEGACY_THEME_KEY);
    } catch (e) {
        // Silently continue if storage is restricted
    }

    /* ==========================================================================
       2. DOM ELEMENT REFERENCES (Matched to semantic HTML structure)
       ========================================================================== */
    // Header & Navigation Elements
    const siteHeader = document.getElementById('header');
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mainNavigation = document.getElementById('main-navigation');
    const navActions = document.getElementById('nav-actions');
    const guestActions = document.getElementById('guest-actions');
    const userActions = document.getElementById('user-actions');
    const userNameDisplay = document.getElementById('user-name-display');
    const navLinks = document.querySelectorAll('.nav-link');
    const btnLogin = document.getElementById('btn-login');
    const btnSignup = document.getElementById('btn-signup');
    const btnLogout = document.getElementById('btn-logout');

    // Call-to-Action & Hero Buttons
    const heroGetStartedBtn = document.querySelector('.hero-actions .btn-primary');
    const ctaClaimBtn = document.querySelector('.cta-actions .btn-primary');

    // Live Profile Mockup Elements (Read-Only Showcase)
    const previewLinkItems = document.querySelectorAll('.preview-link-item');

    // Demo Authentication Modal Elements
    const authModal = document.getElementById('auth-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const authForm = document.getElementById('auth-form');
    const nameFieldGroup = document.getElementById('name-field-group');
    const authNameInput = document.getElementById('auth-name');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');
    const modalFeedback = document.getElementById('modal-feedback');
    const modalSwitchBtn = document.getElementById('modal-switch-btn');
    const modalSwitchText = document.getElementById('modal-switch-text');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // Modal Mode State ('login' or 'signup')
    let currentAuthMode = 'login';

    /* ==========================================================================
       3. TOAST NOTIFICATION UTILITY
       Accessible status alerts for demo interactions
       ========================================================================== */
    function showToast(message, type = 'info', duration = 3800) {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'status');

        let icon = '✨';
        if (type === 'success') icon = '✓';
        if (type === 'warning') icon = 'ℹ️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Entrance transition
        requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        // Cleanup after duration
        setTimeout(() => {
            toast.classList.remove('is-visible');
            setTimeout(() => {
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /* ==========================================================================
       4. REGULAR USER AUTHENTICATION & SESSION STATE MANAGEMENT
       Public visitors and regular users have read-only permissions.
       Users can Sign Up, Login, view the website, and Logout.
       ========================================================================== */
    function renderAuthState(user) {
        if (user && user.email) {
            // User is signed in as a regular user
            if (guestActions) guestActions.style.display = 'none';
            if (userActions) userActions.style.display = 'flex';
            if (userNameDisplay) {
                userNameDisplay.textContent = user.name || user.email.split('@')[0];
            }
        } else {
            // Public guest state
            if (guestActions) guestActions.style.display = 'flex';
            if (userActions) userActions.style.display = 'none';
        }
    }

    function getActiveUser() {
        try {
            const raw = sessionStorage.getItem(SESSION_USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function setActiveUser(user) {
        try {
            if (user) {
                sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
            } else {
                sessionStorage.removeItem(SESSION_USER_KEY);
            }
        } catch (e) {
            console.warn('sessionStorage is unavailable:', e);
        }
        renderAuthState(user);
    }

    // Initialize auth state on load
    renderAuthState(getActiveUser());

    // Logout Action
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            setActiveUser(null);
            showToast('Logged out successfully. You are now browsing as a public visitor.', 'info', 3000);
            if (window.innerWidth <= 820) {
                toggleMobileNav(true);
            }
        });
    }

    /* ==========================================================================
       5. MOBILE NAVIGATION CONTROLLER
       ========================================================================== */
    function toggleMobileNav(forceClose = false) {
        if (!mobileNavToggle || !mainNavigation) return;

        const isCurrentlyOpen = mobileNavToggle.classList.contains('is-open');
        const shouldOpen = forceClose ? false : !isCurrentlyOpen;

        if (shouldOpen) {
            mobileNavToggle.classList.add('is-open');
            mainNavigation.classList.add('is-open');
            if (navActions) navActions.classList.add('is-open');
            mobileNavToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        } else {
            mobileNavToggle.classList.remove('is-open');
            mainNavigation.classList.remove('is-open');
            if (navActions) navActions.classList.remove('is-open');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileNav();
        });
    }

    // Dismiss drawer on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 820) {
                toggleMobileNav(true);
            }
        });
    });

    // Dismiss drawer on outside click
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 820 && mainNavigation && mainNavigation.classList.contains('is-open')) {
            if (!siteHeader.contains(e.target)) {
                toggleMobileNav(true);
            }
        }
    });

    // Dismiss on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (mainNavigation && mainNavigation.classList.contains('is-open')) {
                toggleMobileNav(true);
            }
            if (authModal && authModal.classList.contains('is-active')) {
                closeAuthModal();
            }
        }
    });

    /* ==========================================================================
       6. SMOOTH SECTION NAVIGATION & SCROLLSPY
       ========================================================================== */
    const allInternalAnchors = document.querySelectorAll('a[href^="#"]');

    allInternalAnchors.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            let targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            // Map legacy #branding anchor to #showcase
            if (targetId === '#branding') {
                targetId = '#showcase';
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                const headerOffset = siteHeader ? siteHeader.offsetHeight + 10 : 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
            }
        });
    });

    // Scrollspy for active navigation links
    const trackedSections = document.querySelectorAll('section[id]');

    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 140;

        trackedSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    const linkHref = link.getAttribute('href');
                    if (linkHref === `#${sectionId}` || (sectionId === 'showcase' && linkHref === '#branding')) {
                        link.classList.add('active');
                    }
                });
            }
        });

        // Ensure Home is highlighted when at top of page
        if (window.scrollY < 200) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#home');
            });
        }
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();

    /* ==========================================================================
       7. DEMO AUTHENTICATION MODAL (LOGIN & SIGN UP)
       Accessible modal dialog with client-side validation
       ========================================================================== */
    function openAuthModal(mode = 'login') {
        if (!authModal) return;

        currentAuthMode = mode;
        clearFormValidation();

        if (mode === 'signup') {
            modalTitle.textContent = 'Create Your OneProfile';
            modalSubtitle.textContent = 'Join thousands of creators building their digital empire.';
            modalSubmitBtn.textContent = 'Create Free Account';
            modalSwitchText.textContent = 'Already have an account?';
            modalSwitchBtn.textContent = 'Log In';
            if (nameFieldGroup) nameFieldGroup.style.display = 'flex';
        } else {
            modalTitle.textContent = 'Welcome to OneProfile';
            modalSubtitle.textContent = 'Experience our creator account portal interface.';
            modalSubmitBtn.textContent = 'Log In to OneProfile';
            modalSwitchText.textContent = "Don't have an account?";
            modalSwitchBtn.textContent = 'Sign Up';
            if (nameFieldGroup) nameFieldGroup.style.display = 'none';
        }

        authModal.classList.add('is-active');
        authModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            if (mode === 'signup' && authNameInput) {
                authNameInput.focus();
            } else if (authEmailInput) {
                authEmailInput.focus();
            }
        }, 100);
    }

    function closeAuthModal() {
        if (!authModal) return;
        authModal.classList.remove('is-active');
        authModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        clearFormValidation();
    }

    function clearFormValidation() {
        if (authForm) authForm.reset();
        [authNameInput, authEmailInput, authPasswordInput].forEach(input => {
            if (input) input.classList.remove('is-invalid');
        });
        if (nameError) nameError.textContent = '';
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';
        if (modalFeedback) {
            modalFeedback.textContent = '';
            modalFeedback.className = 'modal-feedback';
        }
    }

    // Modal Trigger Buttons
    if (btnLogin) {
        btnLogin.addEventListener('click', () => openAuthModal('login'));
    }
    if (btnSignup) {
        btnSignup.addEventListener('click', () => openAuthModal('signup'));
    }
    if (heroGetStartedBtn) {
        heroGetStartedBtn.addEventListener('click', () => openAuthModal('signup'));
    }
    if (ctaClaimBtn) {
        ctaClaimBtn.addEventListener('click', () => openAuthModal('signup'));
    }

    // Modal Close
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeAuthModal);
    }
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                closeAuthModal();
            }
        });
    }

    // Switch between Login and Sign Up
    if (modalSwitchBtn) {
        modalSwitchBtn.addEventListener('click', () => {
            openAuthModal(currentAuthMode === 'login' ? 'signup' : 'login');
        });
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;
            if (nameError) nameError.textContent = '';
            if (emailError) emailError.textContent = '';
            if (passwordError) passwordError.textContent = '';
            if (modalFeedback) {
                modalFeedback.textContent = '';
                modalFeedback.className = 'modal-feedback';
            }

            let submittedName = '';
            if (currentAuthMode === 'signup' && authNameInput) {
                submittedName = authNameInput.value.trim();
                if (!submittedName) {
                    authNameInput.classList.add('is-invalid');
                    if (nameError) nameError.textContent = 'Please enter your full name.';
                    isValid = false;
                } else if (submittedName.length < 2) {
                    authNameInput.classList.add('is-invalid');
                    if (nameError) nameError.textContent = 'Name must be at least 2 characters.';
                    isValid = false;
                } else {
                    authNameInput.classList.remove('is-invalid');
                }
            }

            const emailVal = authEmailInput ? authEmailInput.value.trim() : '';
            if (!emailVal) {
                if (authEmailInput) authEmailInput.classList.add('is-invalid');
                if (emailError) emailError.textContent = 'Please enter your email address.';
                isValid = false;
            } else if (!validateEmail(emailVal)) {
                if (authEmailInput) authEmailInput.classList.add('is-invalid');
                if (emailError) emailError.textContent = 'Please enter a valid email address.';
                isValid = false;
            } else if (authEmailInput) {
                authEmailInput.classList.remove('is-invalid');
            }

            const passwordVal = authPasswordInput ? authPasswordInput.value : '';
            if (!passwordVal) {
                if (authPasswordInput) authPasswordInput.classList.add('is-invalid');
                if (passwordError) passwordError.textContent = 'Please enter a password.';
                isValid = false;
            } else if (passwordVal.length < 6) {
                if (authPasswordInput) authPasswordInput.classList.add('is-invalid');
                if (passwordError) passwordError.textContent = 'Password must be at least 6 characters.';
                isValid = false;
            } else if (authPasswordInput) {
                authPasswordInput.classList.remove('is-invalid');
            }

            if (!isValid) return;

            // Form validation passed -> Sign in as regular user (Read-Only access)
            if (!submittedName) {
                const prefix = emailVal.split('@')[0];
                submittedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            }

            const activeUser = {
                name: submittedName,
                email: emailVal,
                role: 'regular_user'
            };

            setActiveUser(activeUser);

            const actionLabel = currentAuthMode === 'signup' ? 'Account created' : 'Logged in';
            modalFeedback.className = 'modal-feedback is-success';
            modalFeedback.textContent = `✓ ${actionLabel} successfully as ${submittedName}! Account Role: Regular User (Read-Only access).`;

            showToast(`Signed in as ${submittedName}. Welcome to OneProfile!`, 'success', 3500);

            setTimeout(() => {
                closeAuthModal();
            }, 1400);
        });

        // Real-time clearance of invalid state
        [authNameInput, authEmailInput, authPasswordInput].forEach(input => {
            if (!input) return;
            input.addEventListener('input', () => {
                input.classList.remove('is-invalid');
                if (modalFeedback) modalFeedback.textContent = '';
            });
        });
    }

    /* ==========================================================================
       8. READ-ONLY PREVIEW & FEATURE INTERACTIONS
       ========================================================================== */
    // Live Profile Mockup link items (Read-Only demonstration)
    previewLinkItems.forEach(item => {
        item.addEventListener('click', () => {
            const linkTitle = item.querySelector('span') ? item.querySelector('span').textContent : 'Profile Link';
            showToast(`Read-only preview: In your live creator profile, followers visit "${linkTitle}".`, 'info', 3000);
        });
    });

    // Feature card links
    const featureLinks = document.querySelectorAll('.feature-link');
    featureLinks.forEach(link => {
        link.addEventListener('click', () => {
            const card = link.closest('.feature-card');
            const title = card ? card.querySelector('.feature-title').textContent : 'Feature';
            showToast(`Exploring ${title}: This feature is ready to configure in your OneProfile creator tier.`, 'info', 2800);
        });
    });

    // Footer informational links
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
        const linkText = link.textContent.trim();
        if (['Privacy Policy', 'Terms of Service', 'Community Guidelines', 'Contact Support'].includes(linkText)) {
            link.addEventListener('click', () => {
                showToast(`Information: ${linkText} documents will be published upon commercial launch.`, 'info', 3000);
            });
        }
    });

    console.log('OneProfile frontend initialized. Public/Regular User Mode: Read-Only. Administrator controls restricted to verified backend.');
});
