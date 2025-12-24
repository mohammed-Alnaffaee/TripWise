// ===== Tripwise - Main Interactive Functions =====
// Note: Authentication is handled by tripwise-auth-final.js



// DOM Elements
const showMoreBtn = document.getElementById("showMoreBtn");
const offerBtn = document.getElementById("offerBtn");

// Country label mapping
const countryLabels = {
    'saudi-arabia': 'Saudi Arabia',
    'india': 'India',
    'japan': 'Japan',
    'malaysia': 'Malaysia',
    'france': 'France',
    'italy': 'Italy',
    'united-states': 'United States',
    'thailand': 'Thailand',
    'turkey': 'Turkey',
    'uae': 'United Arab Emirates',
    'indonesia': 'Indonesia',
    'spain': 'Spain',
    'greece': 'Greece',
    'morocco': 'Morocco',
    'egypt': 'Egypt'
};
// ===== User Preferences & Ready Plan Recommendations =====

// قراءة تفضيلات المستخدم من localStorage
function getUserPreferences() {
    try {
        const raw = localStorage.getItem('userPreferences');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to parse userPreferences', e);
        return null;
    }
}

// تطبيق التوصيات على كروت الـ Ready Plans
function applyReadyPlanRecommendations() {
    const prefs = getUserPreferences();
    if (!prefs || !Array.isArray(prefs.tripStyles) || prefs.tripStyles.length === 0) {
        return; // لا تفضيلات → لا شيء
    }

    const selectedStyles = prefs.tripStyles.map(s => s.toLowerCase());
    
    const grid = document.querySelector('.ready-trips .trips-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.trip-card'));
    const recommended = [];
    const others = [];

    cards.forEach(card => {
        const tagsStr = (card.dataset.tags || '').toLowerCase();
        if (!tagsStr) {
            card.classList.remove('recommended');
            others.push(card);
            return;
        }

        const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
        const isMatch = tags.some(tag => selectedStyles.includes(tag));

        if (isMatch) {
            card.classList.add('recommended');
            recommended.push(card);
        } else {
            card.classList.remove('recommended');
            others.push(card);
        }
    });

    // نعيد ترتيب الكروت: الـ Recommended أول شيء (يسار)
    if (recommended.length > 0) {
        grid.innerHTML = '';
        recommended.forEach(c => grid.appendChild(c));
        others.forEach(c => grid.appendChild(c));
    }
}

// نجعلها متاحة للملفات الأخرى (auth)
window.applyReadyPlanRecommendations = applyReadyPlanRecommendations;
// ===== Ready-Made Trips Recommendations =====

// قراءة تفضيلات المستخدم من localStorage (تُحفظ من أسئلة البروفايل)
function getUserPreferences() {
    try {
        const raw = localStorage.getItem('userPreferences');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to parse userPreferences', e);
        return null;
    }
}

// تطبيق التوصيات على كروت الـ Ready Trips
function applyReadyPlanRecommendations() {
    const prefs = getUserPreferences();
    if (!prefs || !Array.isArray(prefs.tripStyles) || prefs.tripStyles.length === 0) {
        return; // لا يوجد تفضيلات محفوظة
    }

    const selectedStyles = prefs.tripStyles.map(s => s.toLowerCase());

    const grid = document.querySelector('.ready-trips .trips-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.trip-card'));
    const recommended = [];
    const others = [];

    cards.forEach(card => {
        const tagsStr = (card.dataset.tags || '').toLowerCase();
        const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

        const isMatch = tags.some(tag => selectedStyles.includes(tag));

        const overlay = card.querySelector('.trip-overlay');
        let badge = card.querySelector('.recommended-badge');

        if (isMatch) {
            // أضف الشارة "Recommended"
            if (overlay && !badge) {
                badge = document.createElement('span');
                badge.className = 'recommended-badge';
                badge.textContent = 'Recommended';
                // نضعها أول عنصر في الـ overlay (تظهر أعلى اليسار أو فوق البقية)
                overlay.insertBefore(badge, overlay.firstChild);
            }
            card.classList.add('recommended');
            recommended.push(card);
        } else {
            // إزالة الشارة إن وجدت
            if (badge) badge.remove();
            card.classList.remove('recommended');
            others.push(card);
        }
    });

    // إعادة ترتيب الكروت: الموصى بها أولاً (في اليسار)
    if (recommended.length > 0) {
        grid.innerHTML = '';
        recommended.forEach(c => grid.appendChild(c));
        others.forEach(c => grid.appendChild(c));
    }
}

// إتاحة الدالة للـ auth script ليستطيع استدعاءها بعد إنهاء الأسئلة
window.applyReadyPlanRecommendations = applyReadyPlanRecommendations;

// ===== Event Handlers =====
document.addEventListener('DOMContentLoaded', function() {
    // Offer button handler - Navigate to Ready Plans (no auth required)
    if (offerBtn) {
        offerBtn.addEventListener('click', function() {
            navigateToReadyPlans();
        });
    }
    
    // Show more button handler
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', handleShowMore);
    }
    
    // Mobile menu handler
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Auto-update date to today
    if (startDateInput && endDateInput) {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.min = today;
        endDateInput.min = today;
        
        // Auto-update return date when departure date changes
        startDateInput.addEventListener('change', function() {
            if (!isLoggedIn) return;
            
            const startDate = new Date(this.value);
            const nextDay = new Date(startDate);
            nextDay.setDate(startDate.getDate() + 1);
            endDateInput.min = nextDay.toISOString().split('T')[0];
        });
    }
        // لو نحن في الصفحة الرئيسية وعندنا ready trips → طبّق التوصيات
    if (document.querySelector('.ready-trips')) {
        applyReadyPlanRecommendations();
    }

});

// ===== Trip Planning Functions =====
function handlePlanTrip() {
    const country = countrySelect.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    if (!country || !startDate || !endDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
        alert('Return date must be after departure date');
        return;
    }
    
    // Get country label from select option text
    const countryLabel = countryLabels[country] || country;
    
    // Navigate to trip planner with parameters INCLUDING countryLabel
    const params = new URLSearchParams({
        country: country,
        countryLabel: countryLabel,
        startDate: startDate,
        endDate: endDate
    });
    params.set('mode', 'planner');
    window.location.href = `japan-custom-plan.html?${params.toString()}`;
}

// ===== Navigate to Ready Plans Function =====
function navigateToReadyPlans() {
    // Scroll to the Ready Plans section
    const readyPlansSection = document.getElementById('destinations');
    if (readyPlansSection) {
        readyPlansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add a visual highlight effect
        readyPlansSection.style.background = 'linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(239, 246, 255, 0.8) 100%)';
        readyPlansSection.style.transition = 'background 0.5s ease';
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
            readyPlansSection.style.background = 'var(--light-gray)';
        }, 3000);
        
        // Show success message
        showSuccessMessage('✨ Check out our amazing Ready-Made Trip Plans with 25% OFF!');
    }
}

// ===== Additional Functions =====
function handleShowMore() {
    if (!isLoggedIn) {
        alert('Please login to see more destinations');
        requireAuth('index.html');
        return;
    }
    
    // Simulate loading additional destinations
    loadMoreDestinations();
}

function loadMoreDestinations() {
    const additionalTrips = [
        {
            name: 'Saudi Arabia Cultural Journey',
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&auto=enhance&sat=1.2&vib=1.1',
            duration: '8 Days',
            description: 'Discover the heritage and modern wonders of the Kingdom',
            price: 'From $3,500'
        },
        {
            name: 'India Golden Triangle',
            image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=250&fit=crop&auto=enhance&sat=1.2&vib=1.1',
            duration: '12 Days',
            description: 'Explore Delhi, Agra, and Jaipur in ultimate luxury',
            price: 'From $2,800'
        },
        {
            name: 'Turkey Magic',
            image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=250&fit=crop&auto=enhance&sat=1.2&vib=1.1',
            duration: '9 Days',
            description: 'Istanbul to Cappadocia adventure',
            price: 'From $3,100'
        }
    ];

    const tripsGrid = document.querySelector('.trips-grid');
    
    additionalTrips.forEach(trip => {
        const tripCard = document.createElement('div');
        tripCard.className = 'trip-card';
        tripCard.style.animation = 'fadeInUp 0.6s ease';
        tripCard.innerHTML = `
            <div class="trip-image">
                <img src="${trip.image}" alt="${trip.name}">
                <div class="trip-overlay">
                    <span class="trip-duration">${trip.duration}</span>
                </div>
            </div>
            <div class="trip-info">
                <h3 class="trip-title">${trip.name}</h3>
                <p class="trip-description">${trip.description}</p>
                <div class="trip-price">${trip.price}</div>
                <button class="view-trip-btn">View Details</button>
            </div>
        `;
        tripsGrid.appendChild(tripCard);
    });
    
    // Hide show more button
    showMoreBtn.style.display = 'none';
    showSuccessMessage('More destinations loaded!');
}

// ===== Utility Functions =====
function getUserNameFromEmail(email) {
    return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
}

function showSuccessMessage(text) {
    const message = document.createElement('div');
    message.className = 'success-toast';
    message.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${text}</span>
    `;
    
    message.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
