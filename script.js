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
const imageLightbox = document.getElementById('image-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');
let currentLanguage = 'es';

function openImageLightbox(image) {
    if (!imageLightbox || !lightboxImage || !image) return;

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || 'Imagen ampliada';
    imageLightbox.classList.remove('hidden');
    imageLightbox.classList.add('flex');
    imageLightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    lightboxClose?.focus();
}

function closeImageLightbox() {
    if (!imageLightbox || !lightboxImage) return;

    imageLightbox.classList.add('hidden');
    imageLightbox.classList.remove('flex');
    imageLightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.removeAttribute('src');
    document.body.classList.remove('modal-open');
}

function applyLanguage(language) {
    currentLanguage = language;
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach((element) => {
        const value = element.getAttribute(language === 'en' ? 'data-en' : 'data-es');
        if (value) {
            element.innerHTML = value;
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
        millonarios: 'images/Estadio.jpeg',
        nacional: 'images/Estadio.jpeg',
        santafe: 'images/Estadio.jpeg',
        brasil: 'images/Estadio.jpeg',
        realMadrid: 'images/Estadio.jpeg',
        liverpool: 'images/Estadio.jpeg',
        juventus: 'images/Estadio.jpeg'
    };

    const categoryLabel = categoryNames[category] || 'Colección destacada';
    productPanelHeading.textContent = `${categoryLabel}`;
    const panelImage = categoryImages[category];

    if (productPanelImage && panelImage) {
        productPanelImage.src = panelImage;
        productPanelImage.alt = `Imagen de ${categoryLabel}`;
        productPanelImage.classList.remove('hidden');
        productPanelPlaceholder.classList.add('hidden');
    } else {
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

    if (menuButton) {
        menuButton.setAttribute('aria-expanded', 'false');
    }

    applyLanguage(currentLanguage);
    updateProductPanel('brasil');

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            applyLanguage(currentLanguage === 'es' ? 'en' : 'es');
        });
    }

    const defaultSubButton = document.querySelector('.sub-category-button[data-target="brasil"]');
    if (defaultSubButton) {
        setActiveSubCategory(defaultSubButton);
    }

    const defaultDrawerButton = document.querySelector('.drawer-category-button[data-target="brasil"]');
    if (defaultDrawerButton) {
        setActiveDrawerCategory(defaultDrawerButton);
    }

    const defaultTab = document.querySelector('.main-tab[data-region="countries"]');
    if (defaultTab) {
        setActiveMainTab(defaultTab);
        updateIndicator(defaultTab);
    }

    updateSubCategoryButtons('countries');
    filterProductCards('countries', 'brasil');

    homeLogo?.addEventListener('click', () => {
        selectCategory('brasil', 'countries');
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

    document.querySelectorAll('[data-lightbox-image]').forEach((image) => {
        image.addEventListener('click', (event) => {
            event.stopPropagation();
            openImageLightbox(image);
        });
    });

    lightboxClose?.addEventListener('click', closeImageLightbox);
    imageLightbox?.addEventListener('click', (event) => {
        if (event.target === imageLightbox) {
            closeImageLightbox();
        }
    });

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
