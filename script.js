    // ==================== UTILS ====================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ==================== NAVIGATION ====================
const navBtns = $$('.nav-btn');
const pages = $$('.page');

navBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPage = this.getAttribute('data-page');
        const targetElement = $(`#${targetPage}`);
        
        if (!targetElement) return; // Sécurité : stop si la page existe pas
        
        navBtns.forEach(b => {
            b.classList.remove('active');
            b.removeAttribute('aria-current');
        });
        
        $$(`[data-page="${targetPage}"]`).forEach(b => {
            b.classList.add('active');
            b.setAttribute('aria-current', 'page');
        });
        
        pages.forEach(page => page.classList.remove('active'));
        targetElement.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll
    });
});

// ==================== FILTRE GALERIE ====================
const filterBtns = $$('.filter-btn');
const galleryCards = $$('.card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-pressed', 'true');
        
        const filterValue = this.getAttribute('data-filter');
        
        // Animation fade au lieu de display brutal
        galleryCards.forEach(card => {
            const match = filterValue === 'all' || card.getAttribute('data-category') === filterValue;
            card.style.transition = 'opacity 0.3s, transform 0.3s';
            card.style.opacity = match ? '1' : '0';
            card.style.transform = match ? 'scale(1)' : 'scale(0.8)';
            card.setAttribute('aria-hidden', !match);
            
            setTimeout(() => {
                card.style.display = match ? 'block' : 'none';
            }, 300);
        });
    });
});

// ==================== LIGHTBOX ====================
const lightbox = $('#lightbox');
const lightboxImg = $('#lightbox-img');
const lightboxClose = $('#lightbox-close');
let lastFocusedElement = null; // Mémorise où était le focus

$$('.card img').forEach(img => {
    const openLightbox = () => {
        lastFocusedElement = document.activeElement; // Sauvegarde focus
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "Photo Julien André";
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloque scroll du fond
        lightboxClose.focus();
    };
    
    img.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox();
    });
    
    // Accessibilité clavier
    img.parentElement.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox();
        }
    });
});

const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Remet le scroll
    if(lastFocusedElement) lastFocusedElement.focus(); // Remet le focus
};

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox) closeLightbox();
});

// Fermer avec Echap
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

// ==================== DATE MIN = AUJOURD'HUI ====================
const dateInput = $('#date');
if(dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

// ==================== VALIDATION WHATSAPP ====================
const setupWhatsAppValidation = (inputId, isForm = false) => {
    const input = $(`#${inputId}`);
    if(!input) return;
    
    input.addEventListener('input', function() {
        const errorEl = $(`#${inputId}-error`);
        if (this.validity.patternMismatch) {
            if(errorEl) errorEl.style.display = 'block';
            if(isForm) this.style.borderColor = '#e74c3c';
        } else {
            if(errorEl) errorEl.style.display = 'none';
            if(isForm) this.style.borderColor = this.value ? '#4caf50' : '#ddd';
        }
    });
};

setupWhatsAppValidation('whatsapp');
setupWhatsAppValidation('whatsappForm', true); // DRY : évite duplication

// ============================================
// FONCTION GENERIQUE POUR FORMULAIRES
// ============================================

function handleFormSubmit(formId, callback) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les données du formulaire
        const data = new FormData(e.target);
        
        // Construire le message avec le callback
        const message = callback(data);
        
        // Votre numéro WhatsApp (sans le 0, avec indicatif 243)
        const numero = "243992126727";
        
        // Encoder le message pour l'URL
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
        
        // Ouvrir WhatsApp
        window.open(url, '_blank');
        
        // Message de confirmation
        alert('✅ Demande préparée ! Redirection vers WhatsApp.');
        
        // Optionnel : réinitialiser le formulaire
        // e.target.reset();
    });
}

// ============================================
// FORMULAIRE DE RÉSERVATION
// ============================================

handleFormSubmit('formReservation', (data) => {
    // Récupérer les valeurs avec data.get()
    const nom = data.get('nom');
    const whatsapp = data.get('whatsapp');
    const insta = data.get('insta');
    const facebook = data.get('facebook');
    const date = data.get('date');
    const ceremonie = data.get('ceremonie');
    const details = data.get('details');
    
    // Vérifier que les champs obligatoires sont remplis
    if (!nom || !whatsapp || !date || !ceremonie) {
        alert('❌ Veuillez remplir : Nom, WhatsApp, Date et Type de cérémonie');
        throw new Error('Champs obligatoires manquants');
    }
    
    // Ajouter les options facultatives
    const instaText = insta ? `%0A*Insta:* ${insta}` : '';
    const facebookText = facebook ? `%0A*Facebook:* ${facebook}` : '';
    const detailsText = details ? `%0A*Détails:* ${details}` : '%0A*Détails:* Aucun';
    
    // Construire le message final
    return `*📸 NOUVELLE RÉSERVATION*%0A%0A*Nom:* ${nom}%0A*WhatsApp:* ${whatsapp}${instaText}${facebookText}%0A*Date:* ${date}%0A*Type:* ${ceremonie}${detailsText}%0A%0A_Merci de confirmer la disponibilité_`;
});

// ============================================
// FORMULAIRE DE FORMATION
// ============================================

handleFormSubmit('formFormation', (data) => {
    // Récupérer les valeurs avec data.get()
    const nomForm = data.get('nomForm');
    const whatsappForm = data.get('whatsappForm');
    const packForm = data.get('packForm');
    const motivation = data.get('motivation');
    
    // Vérifier que les champs obligatoires sont remplis
    if (!nomForm || !whatsappForm || !packForm) {
        alert('❌ Veuillez remplir : Nom, WhatsApp et Pack de formation');
        throw new Error('Champs obligatoires manquants');
    }
    
    // Ajouter la motivation si présente
    const motivationText = motivation ? `%0A*Motivation:* ${motivation}` : '';
    
    // Construire le message final
    return `*🎓 DEMANDE FORMATION PHOTO*%0A%0A*Nom:* ${nomForm}%0A*WhatsApp:* ${whatsappForm}%0A*Pack:* ${packForm}${motivationText}`;
});

// FORMULAIRE FORMATION  
handleFormSubmit('formFormation', (data) => {
    return `*🎓 DEMANDE FORMATION PHOTO*%0A%0A*Nom:* ${data.get('nomForm')}%0A*WhatsApp:* ${data.get('whatsappForm')}%0A*Pack:* ${data.get('packForm')}%0A*Motivation:* ${data.get('motivation') || 'Non spécifiée'}`;
});

// ==================== SCROLL TO TOP ====================
const scrollTopBtn = $('#scrollTop');
if(scrollTopBtn) {
    // Throttle pour perf : évite de spam l'event scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
                ticking = false;
            });
            ticking = true;
        }
    });
    
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    scrollTopBtn.addEventListener('click', scrollToTop);
    scrollTopBtn.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
        }
    });
}

// ==================== ANIMATION AU SCROLL ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('zoom-in');
            observer.unobserve(entry.target); // Stop observer après anim = perf
        }
    });
}, { threshold: 0.1 });

$$('.card, .testimonial-card, .money-card').forEach((el) => observer.observe(el));

// ==================== DARK MODE ====================
function initDarkMode() {
    const darkModeToggle = $('#darkModeToggle');
    if (!darkModeToggle) return;
    
    const updateButton = (isDark) => {
        darkModeToggle.innerHTML = isDark ? '☀️ Mode clair' : '🌙 Mode sombre';
        darkModeToggle.setAttribute('aria-label', isDark ? 'Basculer en mode clair' : 'Basculer en mode sombre');
    };
    
    // Gère le cas où l'user préfère dark mode système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let darkActive = localStorage.getItem('darkMode');
    darkActive = darkActive !== null ? darkActive === 'true' : prefersDark;
    
    if (darkActive) document.body.classList.add('dark-mode');
    updateButton(darkActive);
    
    darkModeToggle.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-mode');
        updateButton(isDark);
        try {
            localStorage.setItem('darkMode', isDark);
        } catch(e) {}
    });
}

initDarkMode();


