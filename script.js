const drawer = document.getElementById('nav-drawer');
const overlay = document.getElementById('drawer-overlay');
const menuButton = document.querySelector('button[aria-controls="nav-drawer"]');
const homeLogo = document.getElementById('home-logo');
const langToggle = document.getElementById('lang-toggle');
const tabs = document.querySelectorAll('.main-tab');
const indicator = document.getElementById('active-tab-line');
const subCategoryButtons = document.querySelectorAll('.sub-category-button');
const drawerCategoryButtons = document.querySelectorAll('.drawer-category-button');
const productPanelHeading = document.getElementById('panel-heading');
const productPanelPlaceholder = document.getElementById('panel-placeholder');
const productPanelImage = document.getElementById('panel-image');
const productPanelFeatureGrid = document.getElementById('panel-feature-grid');
const imageLightbox = document.getElementById('image-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomResetBtn = document.getElementById('zoom-reset-btn');
const zoomPercent = document.getElementById('zoom-percent');
const lightboxImgContainer = document.getElementById('lightbox-img-container');

let currentLanguage = 'es';
let scale = 1.0;
let panX = 0;
let panY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let hasDragged = false;
let dragStartX = 0;
let dragStartY = 0;
let initialTouchDistance = 0;
let initialScaleForPinch = 1.0;

function updateLightboxTransform(useTransition = true) {
    if (!lightboxImage) return;
    if (useTransition) {
        lightboxImage.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    } else {
        lightboxImage.style.transition = 'none';
    }
    lightboxImage.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    if (zoomPercent) {
        zoomPercent.textContent = `${Math.round(scale * 100)}%`;
    }
}

function zoomIn() {
    if (scale < 4.0) {
        scale = Math.min(4.0, scale + 0.5);
        updateLightboxTransform(true);
    }
}

function zoomOut() {
    if (scale > 0.5) {
        scale = Math.max(0.5, scale - 0.5);
        if (scale <= 1.0) {
            panX = 0;
            panY = 0;
        }
        updateLightboxTransform(true);
    }
}

function resetZoom() {
    scale = 1.0;
    panX = 0;
    panY = 0;
    updateLightboxTransform(true);
}

function openImageLightbox(image) {
    if (!imageLightbox || !lightboxImage || !image) return;

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || 'Imagen ampliada';
    imageLightbox.classList.remove('hidden');
    imageLightbox.classList.add('flex');
    imageLightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    
    // Reset state on open
    scale = 1.0;
    panX = 0;
    panY = 0;
    hasDragged = false;
    initialTouchDistance = 0;
    updateLightboxTransform(false);
    
    lightboxClose?.focus();
}

function closeImageLightbox() {
    if (!imageLightbox || !lightboxImage) return;

    imageLightbox.classList.add('hidden');
    imageLightbox.classList.remove('flex');
    imageLightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.removeAttribute('src');
    document.body.classList.remove('modal-open');
    
    // Reset state on close
    scale = 1.0;
    panX = 0;
    panY = 0;
    hasDragged = false;
    initialTouchDistance = 0;
}

function applyLanguage(language) {
    currentLanguage = language;
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach((element) => {
        const value = element.getAttribute(language === 'en' ? 'data-en' : 'data-es');
        if (value) {
            if (element.tagName === 'INPUT') {
                element.setAttribute('placeholder', value);
            } else {
                element.innerHTML = value;
            }
        }
    });

    if (langToggle) {
        langToggle.textContent = language === 'en' ? 'ES' : 'EN';
        langToggle.setAttribute('aria-label', language === 'en' ? 'Cambiar idioma' : 'Change language');
    }
}

function setActiveDrawerCategory(activeButton) {
    drawerCategoryButtons.forEach((button) => {
        button.classList.remove('active-drawer-item');
    });
    activeButton.classList.add('active-drawer-item');
}

function setActiveSubCategory(activeButton) {
    subCategoryButtons.forEach((button) => {
        button.classList.remove('active-filter-text');
        button.classList.add('text-on-surface-variant');
    });

    activeButton.classList.add('active-filter-text');
    activeButton.classList.remove('text-on-surface-variant');
}

function updateSubCategoryButtons(region) {
    subCategoryButtons.forEach((button) => {
        const buttonRegion = button.getAttribute('data-region');
        if (buttonRegion === region) {
            button.classList.remove('hidden');
            button.style.display = '';
        } else {
            button.classList.add('hidden');
            button.style.display = 'none';
        }
    });
}

function filterProductCards(region, team) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card) => {
        const cardRegion = card.getAttribute('data-region');
        const cardTeam = card.getAttribute('data-team');
        const matchesRegion = !region || cardRegion === region;
        const matchesTeam = !team || cardTeam === team;
        if (matchesRegion && matchesTeam) {
            card.classList.remove('hidden');
            card.style.display = '';
        } else {
            card.classList.add('hidden');
            card.style.display = 'none';
        }
    });
}

function updateProductPanel(category) {
    if (!productPanelHeading || !productPanelPlaceholder) return;

    const categoryNames = {
        millonarios: 'Millonarios',
        nacional: 'Atlético Nacional',
        brasil: 'Brasil',
        juventus: 'Juventus',
        realMadrid: 'Real Madrid',
        liverpool: 'Liverpool',
        santafe: 'Santa Fe',
        buzos: 'Buzos'
    };
    const categoryImages = {
        millonarios: 'images/equipos-locales/millonarios/coleccion-destacada/Estadio.jpeg',
        nacional: 'images/equipos-locales/atletico-nacional/coleccion-destacada/Estadio.jpeg',
        santafe: 'images/equipos-locales/santafe/coleccion-destacada/Estadio.jpeg',
        brasil: 'images/equipos-locales/millonarios/coleccion-destacada/Estadio.jpeg',
        realMadrid: 'images/equipos-locales/millonarios/coleccion-destacada/Estadio.jpeg',
        liverpool: 'images/equipos-locales/millonarios/coleccion-destacada/Estadio.jpeg',
        juventus: 'images/equipos-locales/millonarios/coleccion-destacada/Estadio.jpeg'
    };

    const categoryFeatures = {
        buzos: [
            {
                href: '#buzo-oversize',
                src: 'images/buzos/buzos/coleccion-destacada/ADIDAS-VERDE-NEGRO.jpeg',
                label: 'Adidas',
                alt: 'Adidas Verde Negro'
            },
            {
                href: '#buzo-premium',
                src: 'images/buzos/buzos/coleccion-destacada/POLO-VERDE.jpeg',
                label: 'Polo Verde',
                alt: 'Polo Verde'
            }
        ],
        santafe: [
            {
                href: '#santafe-card',
                src: 'images/equipos-locales/santafe/coleccion-destacada/Estadio.jpeg',
                label: 'Estadio',
                alt: 'Estadio El Campín'
            },
            {
                href: '#santafe-card',
                src: 'images/equipos-locales/santafe/coleccion-destacada/edicion-santafe.jpeg',
                label: 'Edición Santa Fe',
                alt: 'Camiseta Edición Santa Fe'
            }
        ]
    };

    const categoryLabel = categoryNames[category] || 'Colección destacada';
    productPanelHeading.textContent = `${categoryLabel}`;
    const panelImage = categoryImages[category];

    if (categoryFeatures[category]) {
        if (productPanelImage) {
            productPanelImage.classList.add('hidden');
            productPanelImage.removeAttribute('alt');
        }
        if (productPanelFeatureGrid) {
            productPanelFeatureGrid.className = `absolute inset-0 grid grid-cols-${categoryFeatures[category].length} gap-2 p-3`;
            productPanelFeatureGrid.innerHTML = categoryFeatures[category].map(feat => `
                <a class="group/feature relative overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-low" href="${feat.href}">
                    <img alt="${feat.alt}" class="h-full w-full object-cover transition-transform duration-500 group-hover/feature:scale-105" src="${feat.src}">
                    <span class="absolute inset-x-0 bottom-0 bg-background/80 px-2 py-2 font-label-caps text-[10px] uppercase tracking-widest text-secondary">${feat.label}</span>
                </a>
            `).join('');
            productPanelFeatureGrid.classList.remove('hidden');
        }
        productPanelPlaceholder.classList.add('hidden');
    } else if (productPanelImage && panelImage) {
        productPanelFeatureGrid?.classList.add('hidden');
        productPanelImage.src = panelImage;
        productPanelImage.alt = `Imagen de ${categoryLabel}`;
        productPanelImage.classList.remove('hidden');
        productPanelPlaceholder.classList.add('hidden');
    } else {
        productPanelFeatureGrid?.classList.add('hidden');
        if (productPanelImage) {
            productPanelImage.classList.add('hidden');
            productPanelImage.removeAttribute('alt');
        }
        productPanelPlaceholder.classList.remove('hidden');
        productPanelPlaceholder.textContent = `Posible imagen adicional para ${categoryLabel}.`;
    }

    if (productPanelHeading.scrollIntoView) {
        productPanelHeading.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function toggleDrawer() {
    if (!drawer || !overlay) return;

    const isOpen = drawer.classList.toggle('open');
    overlay.classList.toggle('visible', isOpen);
    overlay.setAttribute('aria-hidden', String(!isOpen));

    if (menuButton) {
        menuButton.setAttribute('aria-expanded', String(isOpen));
    }

    document.body.classList.toggle('drawer-open', isOpen);
}

function selectCategory(target, region) {
    if (!target) return;

    updateProductPanel(target);
    if (region) {
        updateSubCategoryButtons(region);
        filterProductCards(region, target);

        const matchingTab = [...tabs].find((tab) => tab.getAttribute('data-region') === region);
        if (matchingTab) {
            setActiveMainTab(matchingTab);
            updateIndicator(matchingTab);
        }
    }

    const subButton = document.querySelector(`.sub-category-button[data-target="${target}"]`);
    if (subButton) {
        setActiveSubCategory(subButton);
    }

    const drawerButton = document.querySelector(`.drawer-category-button[data-target="${target}"]`);
    if (drawerButton) {
        setActiveDrawerCategory(drawerButton);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');

    // Automatic fallback for image extensions (.jpg <-> .jpeg <-> .png)
    document.querySelectorAll('img').forEach((img) => {
        img.addEventListener('error', function handleImgErr() {
            const currentSrc = this.src;
            if (!currentSrc) return;
            this.removeEventListener('error', handleImgErr); // Prevent loop
            
            const lowerSrc = currentSrc.toLowerCase();
            if (lowerSrc.endsWith('.jpg')) {
                this.src = currentSrc.slice(0, -4) + '.jpeg';
            } else if (lowerSrc.endsWith('.jpeg')) {
                this.src = currentSrc.slice(0, -5) + '.jpg';
            } else if (lowerSrc.endsWith('.png')) {
                this.src = currentSrc.slice(0, -4) + '.jpg';
            }
        });
    });

    if (menuButton) {
        menuButton.setAttribute('aria-expanded', 'false');
    }

    applyLanguage(currentLanguage);
    updateProductPanel('millonarios');

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            applyLanguage(currentLanguage === 'es' ? 'en' : 'es');
        });
    }

    const defaultSubButton = document.querySelector('.sub-category-button[data-target="millonarios"]');
    if (defaultSubButton) {
        setActiveSubCategory(defaultSubButton);
    }

    const defaultDrawerButton = document.querySelector('.drawer-category-button[data-target="millonarios"]');
    if (defaultDrawerButton) {
        setActiveDrawerCategory(defaultDrawerButton);
    }

    const defaultTab = document.querySelector('.main-tab[data-region="colombian"]');
    if (defaultTab) {
        setActiveMainTab(defaultTab);
        updateIndicator(defaultTab);
    }

    updateSubCategoryButtons('colombian');
    filterProductCards('colombian', 'millonarios');

    homeLogo?.addEventListener('click', () => {
        selectCategory('millonarios', 'colombian');
        document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Attempt to load local image files (e.g., images/millonarios.jpg) if they exist.
    document.querySelectorAll('img[data-local-src]').forEach((imgEl) => {
        const localSrc = imgEl.getAttribute('data-local-src');
        if (!localSrc) return;
        const tester = new Image();
        tester.onload = () => { imgEl.src = localSrc; };
        tester.onerror = () => { /* keep placeholder if missing */ };
        tester.src = localSrc;
    });

    // Select all catalog images as well as data-lightbox-image elements
    document.querySelectorAll('.product-card img, [data-lightbox-image]').forEach((image) => {
        image.classList.add('cursor-zoom-in');
        image.addEventListener('click', (event) => {
            event.stopPropagation();
            openImageLightbox(image);
        });
    });

    lightboxClose?.addEventListener('click', closeImageLightbox);
    
    // Close lightbox when clicking background overlay (imageLightbox or lightbox-img-container)
    imageLightbox?.addEventListener('click', (event) => {
        if (hasDragged) {
            hasDragged = false;
            return;
        }
        if (event.target === imageLightbox || event.target === lightboxImgContainer) {
            closeImageLightbox();
        }
    });

    // Zoom buttons listeners
    zoomInBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        zoomIn();
    });

    zoomOutBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        zoomOut();
    });

    zoomResetBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        resetZoom();
    });

    // Double click toggle zoom
    lightboxImgContainer?.addEventListener('dblclick', (event) => {
        event.stopPropagation();
        if (scale > 1.0) {
            resetZoom();
        } else {
            scale = 2.0;
            panX = 0;
            panY = 0;
            updateLightboxTransform(true);
        }
    });

    // Mouse drag, touch pan/pinch, and scroll wheel events
    if (lightboxImgContainer) {
        // Scroll wheel zoom
        lightboxImgContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY;
            const zoomStep = 0.15;
            if (delta < 0) {
                // Scroll up -> Zoom In
                if (scale < 4.0) {
                    scale = Math.min(4.0, scale + zoomStep);
                    updateLightboxTransform(true);
                }
            } else {
                // Scroll down -> Zoom Out
                if (scale > 0.5) {
                    scale = Math.max(0.5, scale - zoomStep);
                    if (scale <= 1.0) {
                        panX = 0;
                        panY = 0;
                    }
                    updateLightboxTransform(true);
                }
            }
        }, { passive: false });

        lightboxImgContainer.addEventListener('mousedown', (e) => {
            if (scale <= 1.0) return;
            isDragging = true;
            hasDragged = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            lightboxImgContainer.classList.remove('cursor-grab');
            lightboxImgContainer.classList.add('cursor-grabbing');
            startX = e.clientX - panX;
            startY = e.clientY - panY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
            if (dist > 5) {
                hasDragged = true;
            }
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            updateLightboxTransform(false); // No transition for real-time drag feel
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                lightboxImgContainer.classList.remove('cursor-grabbing');
                lightboxImgContainer.classList.add('cursor-grab');
            }
        });

        // Touch drag & pinch-to-zoom support
        lightboxImgContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Pinch to zoom start
                isDragging = false;
                initialTouchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                initialScaleForPinch = scale;
            } else if (e.touches.length === 1) {
                // Drag start
                if (scale <= 1.0) return;
                isDragging = true;
                hasDragged = false;
                dragStartX = e.touches[0].clientX;
                dragStartY = e.touches[0].clientY;
                startX = e.touches[0].clientX - panX;
                startY = e.touches[0].clientY - panY;
            }
        });

        lightboxImgContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && initialTouchDistance > 0) {
                e.preventDefault();
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const factor = currentDistance / initialTouchDistance;
                scale = Math.min(4.0, Math.max(0.5, initialScaleForPinch * factor));
                if (scale <= 1.0) {
                    panX = 0;
                    panY = 0;
                }
                updateLightboxTransform(false); // Real-time feedback
            } else if (isDragging && e.touches.length === 1) {
                const dist = Math.hypot(e.touches[0].clientX - dragStartX, e.touches[0].clientY - dragStartY);
                if (dist > 5) {
                    hasDragged = true;
                }
                panX = e.touches[0].clientX - startX;
                panY = e.touches[0].clientY - startY;
                updateLightboxTransform(false);
            }
        }, { passive: false });

        lightboxImgContainer.addEventListener('touchend', (e) => {
            isDragging = false;
            if (e.touches.length < 2) {
                initialTouchDistance = 0;
            }
        });
    }

    subCategoryButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-target');
            const region = button.getAttribute('data-region');
            selectCategory(target, region);
        });
    });

    drawerCategoryButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const target = button.getAttribute('data-target');
            const region = button.getAttribute('data-region');
            selectCategory(target, region);
            if (drawer?.classList.contains('open')) {
                toggleDrawer();
            }
        });
    });

    // Dynamically inject "Agregar al carrito" button on catalog cards
    document.querySelectorAll('.catalog-card').forEach(card => {
        const titleSpan = card.querySelector('.font-label-caps');
        const priceSpan = card.querySelector('.font-body-md');
        const imgEl = card.querySelector('img');
        if (!titleSpan || !priceSpan || !imgEl) return;
        
        const title = titleSpan.textContent.trim();
        const priceText = priceSpan.textContent;
        const price = parseFloat(priceText.replace(/[^0-9]/g, '')) || 0;
        const image = imgEl.getAttribute('data-local-src') || imgEl.getAttribute('src');
        
        const btn = document.createElement('button');
        btn.className = 'add-to-cart-btn mt-2 py-2 px-4 rounded-xl border border-outline-variant/30 bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-[11px] font-label-caps uppercase tracking-wider transition-all duration-300 w-full flex items-center justify-center gap-2';
        btn.innerHTML = `<span class="material-symbols-outlined text-sm">add_shopping_cart</span> Agregar`;
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(title, price, image);
        });
        
        card.appendChild(btn);
    });

    // Load cart from localStorage
    loadCart();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && imageLightbox && !imageLightbox.classList.contains('hidden')) {
        closeImageLightbox();
        return;
    }

    if (event.key === 'Escape' && drawer?.classList.contains('open')) {
        toggleDrawer();
    }
});

function setActiveMainTab(activeTab) {
    tabs.forEach((tab) => {
        tab.classList.remove('active-filter-text');
        tab.classList.add('text-on-surface-variant');
    });
    activeTab.classList.add('active-filter-text');
    activeTab.classList.remove('text-on-surface-variant');
}

function updateIndicator(target) {
    if (indicator) {
        indicator.style.width = `${target.offsetWidth}px`;
        indicator.style.left = `${target.offsetLeft}px`;
    }
}

if (tabs.length > 0) {
    setTimeout(() => updateIndicator(tabs[0]), 100);
}

tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
        const targetTab = event.currentTarget;
        setActiveMainTab(targetTab);
        updateIndicator(targetTab);

        const region = targetTab.getAttribute('data-region');
        if (region) {
            updateSubCategoryButtons(region);
            const defaultButton = document.querySelector(`.sub-category-button[data-region="${region}"]`);
            if (defaultButton) {
                selectCategory(defaultButton.getAttribute('data-target'), region);
            }
        }
    });
});

const filters = document.querySelectorAll('.category-filter');
filters.forEach((filter) => {
    filter.addEventListener('click', () => {
        filters.forEach((item) => {
            item.classList.remove('active-filter-text');
            item.classList.add('text-on-surface-variant');
            item.setAttribute('aria-pressed', 'false');
        });

        filter.classList.add('active-filter-text');
        filter.classList.remove('text-on-surface-variant');
        filter.setAttribute('aria-pressed', 'true');
    });
});

const revealObserverOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, revealObserverOptions);

document.querySelectorAll('.reveal').forEach((element) => {
    revealObserver.observe(element);
});

document.querySelectorAll('nav a, #nav-drawer a').forEach((link) => {
    link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('http')) {
            event.preventDefault();
            document.body.classList.remove('loaded');
            setTimeout(() => {
                window.location.href = href;
            }, 400);
        }
    });
});

// Shopping Cart Management Logic
let cart = [];

function loadCart() {
    const savedCart = localStorage.getItem('rd_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch(e) {
            cart = [];
        }
    }
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('rd_cart', JSON.stringify(cart));
}

function toggleCart() {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    if (!cartDrawer || !cartOverlay) return;
    
    const isOpen = cartDrawer.classList.toggle('open');
    cartOverlay.classList.toggle('visible', isOpen);
    cartOverlay.classList.toggle('hidden', !isOpen);
    document.body.classList.toggle('cart-open', isOpen);
}

function openCart() {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    if (!cartDrawer || !cartOverlay) return;
    
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('visible');
    cartOverlay.classList.remove('hidden');
    document.body.classList.add('cart-open');
}

function closeCart() {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    if (!cartDrawer || !cartOverlay) return;
    
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('visible');
    cartOverlay.classList.add('hidden');
    document.body.classList.remove('cart-open');
}

function addToCart(title, price, image) {
    const existingItem = cart.find(item => item.title === title);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ title, price, image, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    openCart();
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    const badge = document.getElementById('cart-badge');
    const checkoutBtn = document.getElementById('checkout-whatsapp-btn');
    if (!container || !totalEl) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (badge) {
        badge.textContent = totalItems;
        if (totalItems > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
    
    totalEl.textContent = `$${totalPrice.toLocaleString('es-CO')} COP`;
    
    if (checkoutBtn) {
        checkoutBtn.disabled = totalItems === 0;
    }
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center text-on-surface-variant/60 gap-4" id="cart-empty-message">
                <span class="material-symbols-outlined text-5xl">shopping_cart</span>
                <p class="font-body-md" data-i18n data-es="Tu carrito está vacío." data-en="Your cart is empty.">Tu carrito está vacío.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cart.map((item, idx) => `
        <div class="flex items-center gap-4 bg-surface-container-high/40 p-3 rounded-2xl border border-outline-variant/10">
            <img class="w-16 h-16 object-cover rounded-xl bg-surface-container-low" src="${item.image}" alt="${item.title}">
            <div class="flex-grow flex flex-col">
                <span class="font-label-caps text-[12px] text-on-surface tracking-wider">${item.title}</span>
                <span class="font-body-sm text-secondary font-bold">$${(item.price * item.quantity).toLocaleString('es-CO')} COP</span>
                <div class="flex items-center gap-2 mt-2">
                    <button class="flex items-center justify-center w-6 h-6 rounded-lg bg-surface-container-highest hover:bg-secondary hover:text-on-secondary transition-all" onclick="changeQuantity(${idx}, -1)">
                        <span class="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                    <span class="font-body-md text-on-surface font-semibold text-[13px] w-6 text-center">${item.quantity}</span>
                    <button class="flex items-center justify-center w-6 h-6 rounded-lg bg-surface-container-highest hover:bg-secondary hover:text-on-secondary transition-all" onclick="changeQuantity(${idx}, 1)">
                        <span class="material-symbols-outlined text-[14px]">add</span>
                    </button>
                </div>
            </div>
            <button class="text-on-surface-variant hover:text-error transition-colors p-1" onclick="removeFromCart(${idx})" aria-label="Eliminar item">
                <span class="material-symbols-outlined text-lg">delete</span>
            </button>
        </div>
    `).join('');
}

function changeQuantity(index, amount) {
    if (index < 0 || index >= cart.length) return;
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
}

function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function sendWhatsappCheckout() {
    if (cart.length === 0) return;
    
    let message = "¡Hola! Me gustaría confirmar la disponibilidad de las siguientes prendas:\n\n";
    cart.forEach(item => {
        message += `👕 *${item.title}*\n   Cantidad: ${item.quantity}\n   Precio: $${(item.price * item.quantity).toLocaleString('es-CO')} COP\n\n`;
    });
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `💰 *Total estimado:* $${totalPrice.toLocaleString('es-CO')} COP\n\n`;
    message += `¿Tienen disponibilidad para envío inmediato? ¡Muchas gracias!`;
    
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/573235282928?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
}

// Make functions globally accessible to inline HTML onclick handlers
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.sendWhatsappCheckout = sendWhatsappCheckout;
window.loadCart = loadCart;
