// ===== Unified Trip Planner - Multi-Country Support via URL Parameters =====
// Supports: ?mode=japan|malaysia|paris|newyork|blank
// Each mode has its own itinerary template and localStorage namespace

// ============================================
// COUNTRY REGISTRY - All country configurations
// ============================================

const COUNTRY_REGISTRY = {
    japan: {
        title: 'Japan Trip Planner',
        heroTitle: 'Plan Your Japan Adventure',
        heroSubtitle: 'Discover the magic of Tokyo, Kyoto, and Osaka',
        mapConfig: {
            center: [36.2048, 138.2529],
            zoom: 6,
            routeWaypoints: [
                [35.6762, 139.6503], // Tokyo
                [35.0116, 135.7681], // Kyoto
                [34.6937, 135.5023]  // Osaka
            ]
        },
        currency: 'JPY',
        itineraryTemplate: [
            { day: 1, city: 'Tokyo', title: 'Arrival in Tokyo', coords: [35.6762, 139.6503] },
            { day: 2, city: 'Tokyo', title: 'Explore Tokyo', coords: [35.6762, 139.6503] },
            { day: 3, city: 'Kyoto', title: 'Travel to Kyoto', coords: [35.0116, 135.7681] },
            { day: 4, city: 'Kyoto', title: 'Temples and Culture', coords: [35.0116, 135.7681] },
            { day: 5, city: 'Osaka', title: 'Osaka Food Tour', coords: [34.6937, 135.5023] },
            { day: 6, city: 'Osaka', title: 'Universal Studios Japan', coords: [34.6654, 135.4324] },
            { day: 7, city: 'Tokyo', title: 'Return to Tokyo & Departure', coords: [35.6762, 139.6503] }
        ]
    },
    malaysia: {
        title: 'Malaysia Trip Planner',
        heroTitle: 'Plan Your Malaysia Adventure',
        heroSubtitle: 'From Kuala Lumpur to the tropical islands',
        mapConfig: {
            center: [4.2105, 101.9758],
            zoom: 6,
            routeWaypoints: [
                [3.1390, 101.6869], // Kuala Lumpur
                [5.9780, 116.0735], // Kota Kinabalu
                [6.0329, 116.1193]  // Mount Kinabalu
            ]
        },
        currency: 'MYR',
        itineraryTemplate: [
            { day: 1, city: 'Kuala Lumpur', title: 'Arrival in Kuala Lumpur', coords: [3.1390, 101.6869] },
            { day: 2, city: 'Kuala Lumpur', title: 'City Tour & Petronas Towers', coords: [3.1579, 101.7114] },
            { day: 3, city: 'Kota Kinabalu', title: 'Flight to Kota Kinabalu', coords: [5.9780, 116.0735] },
            { day: 4, city: 'Kota Kinabalu', title: 'Island Hopping', coords: [5.9780, 116.0735] },
            { day: 5, city: 'Mount Kinabalu', title: 'Mount Kinabalu National Park', coords: [6.0329, 116.1193] },
            { day: 6, city: 'Kuala Lumpur', title: 'Return to Kuala Lumpur', coords: [3.1390, 101.6869] },
            { day: 7, city: 'Kuala Lumpur', title: 'Shopping & Departure', coords: [3.1390, 101.6869] }
        ]
    },
    paris: {
        title: 'Paris Trip Planner',
        heroTitle: 'Plan Your Paris Escape',
        heroSubtitle: 'Experience the City of Light in style',
        mapConfig: {
            center: [48.8566, 2.3522],
            zoom: 12,
            routeWaypoints: [
                [48.8566, 2.3522],  // City Center
                [48.8584, 2.2945],  // Eiffel Tower
                [48.8606, 2.3376]   // Louvre
            ]
        },
        currency: 'EUR',
        itineraryTemplate: [
            { day: 1, city: 'Paris', title: 'Arrival and Eiffel Tower', coords: [48.8584, 2.2945] },
            { day: 2, city: 'Paris', title: 'Louvre and Seine Cruise', coords: [48.8606, 2.3376] },
            { day: 3, city: 'Paris', title: 'Montmartre & Sacré-Cœur', coords: [48.8867, 2.3431] },
            { day: 4, city: 'Paris', title: 'Versailles Day Trip', coords: [48.8049, 2.1204] },
            { day: 5, city: 'Paris', title: 'Shopping & Cafés', coords: [48.8566, 2.3522] }
        ]
    },
    newyork: {
        title: 'New York Trip Planner',
        heroTitle: 'Plan Your New York City Trip',
        heroSubtitle: 'From Times Square to Central Park',
        mapConfig: {
            center: [40.7128, -74.0060],
            zoom: 11,
            routeWaypoints: [
                [40.7580, -73.9855], // Times Square
                [40.7812, -73.9665], // Central Park
                [40.7061, -74.0170]  // Statue of Liberty Ferry
            ]
        },
        currency: 'USD',
        itineraryTemplate: [
            { day: 1, city: 'New York', title: 'Arrival and Times Square', coords: [40.7580, -73.9855] },
            { day: 2, city: 'New York', title: 'Central Park & Museums', coords: [40.7812, -73.9665] },
            { day: 3, city: 'New York', title: 'Statue of Liberty & Ellis Island', coords: [40.7061, -74.0170] },
            { day: 4, city: 'New York', title: 'Brooklyn Bridge & DUMBO', coords: [40.7061, -73.9969] },
            { day: 5, city: 'New York', title: 'Shopping and Departure', coords: [40.7580, -73.9855] }
        ]
    },
    blank: {
        title: 'Custom Trip Planner',
        heroTitle: 'Design Your Perfect Trip',
        heroSubtitle: 'Choose any destination and build your itinerary from scratch',
        mapConfig: {
            center: [20, 0],
            zoom: 2,
            routeWaypoints: []
        },
        currency: 'USD',
        itineraryTemplate: []
    }
};

// ============================================
// MODE DETECTION & INITIALIZATION
// ============================================

var currentMode = 'blank';
var currentCountryConfig = COUNTRY_REGISTRY.blank;
var defaultCurrency = currentCountryConfig.currency;

// Parse URL query parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        mode: params.get('mode') || 'blank',
        country: params.get('country') || '',
        countryLabel: params.get('countryLabel') || '',
        startDate: params.get('startDate') || '',
        endDate: params.get('endDate') || ''
    };
}

// Set mode based on URL parameters
function detectMode() {
    const params = getUrlParams();
    const requestedMode = params.mode.toLowerCase();

    if (COUNTRY_REGISTRY[requestedMode]) {
        currentMode = requestedMode;
        currentCountryConfig = COUNTRY_REGISTRY[requestedMode];
    } else {
        currentMode = 'blank';
        currentCountryConfig = COUNTRY_REGISTRY.blank;
    }

    // Update currency
    defaultCurrency = currentCountryConfig.currency;
}

// ============================================
// GLOBAL STATE & MAP VARIABLES
// ============================================

let map;
let markers = [];
let routePolyline = null;
let itinerary = [];
let currentDayIndex = 0;
let currentActivityIndex = -1;
let isEditMode = false;
let expandedActivityId = null;
let currentTripId = null;

// ============================================
// MAP INITIALIZATION & MANAGEMENT
// ============================================

function initializeMap() {
    if (!map) {
        map = L.map('mapView').setView(
            currentCountryConfig.mapConfig.center,
            currentCountryConfig.mapConfig.zoom
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView(
            currentCountryConfig.mapConfig.center,
            currentCountryConfig.mapConfig.zoom
        );
    }

    updateMapMarkers();
}

function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}

function updateMapMarkers() {
    if (!map) return;

    clearMarkers();

    itinerary.forEach(day => {
        if (!day || !day.activities) return;

        day.activities.forEach(activity => {
            if (!activity || activity.lat === null || activity.lng === null) return;

            const marker = L.marker([activity.lat, activity.lng]).addTo(map)
                .bindPopup(`
                    <strong>${activity.name || ''}</strong><br>
                    <span>${activity.type || ''}</span><br>
                    <span>${activity.location || ''}</span>
                `);

            markers.push(marker);
        });
    });

    // Draw route polyline if waypoints exist
    if (routePolyline) {
        routePolyline.remove();
        routePolyline = null;
    }

    if (currentCountryConfig.mapConfig.routeWaypoints &&
        currentCountryConfig.mapConfig.routeWaypoints.length > 0) {
        routePolyline = L.polyline(currentCountryConfig.mapConfig.routeWaypoints, {
            color: '#2563eb',
            weight: 4,
            opacity: 0.8
        }).addTo(map);

        map.fitBounds(routePolyline.getBounds(), {
            padding: [50, 50]
        });
    } else if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds(), {
            padding: [50, 50]
        });
    }
}

// ============================================
// ITINERARY DATA HELPERS
// ============================================

function createDay(dayNumber, city = '', title = '', coords = null, date = '') {
    const base = {
        day: dayNumber,
        city: city || '',
        title: title || `Day ${dayNumber}`,
        date: date || '',
        lat: coords ? coords[0] : null,
        lng: coords ? coords[1] : null,
        activities: []
    };
    return base;
}

function createActivity(overrides = {}) {
    const defaultActivity = {
        id: 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: '',
        type: 'Activity',
        location: '',
        locationLink: '',
        startTime: '',
        endTime: '',
        budget: 'Free',
        price: null,
        currency: defaultCurrency || 'USD',
        lat: null,
        lng: null,
        description: ''
    };
    return Object.assign({}, defaultActivity, overrides || {});
}

// Initialize itinerary based on template
function initializeItineraryFromTemplate() {
    itinerary = [];

    if (!currentCountryConfig.itineraryTemplate ||
        currentCountryConfig.itineraryTemplate.length === 0) {
        // Provide an empty day for custom mode
        itinerary.push(createDay(1, '', 'Day 1'));
        return;
    }

    currentCountryConfig.itineraryTemplate.forEach(templateDay => {
        const dayObj = createDay(
            templateDay.day,
            templateDay.city,
            templateDay.title,
            templateDay.coords,
            '' // date will be assigned from URL dates if available
        );
        itinerary.push(dayObj);
    });

    // Attempt to apply date range from URL
    const params = getUrlParams();
    if (params.startDate && params.endDate) {
        applyDatesToItinerary(params.startDate, params.endDate);
    }
}

// Assign dates across days based on start & end date
function applyDatesToItinerary(startDateStr, endDateStr) {
    let start;
    let end;

    try {
        start = new Date(startDateStr);
        end = new Date(endDateStr);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error();
    } catch (e) {
        console.warn('Invalid date range. Skipping date assignment.');
        return;
    }

    const diffMs = end - start;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) || 0;

    itinerary.forEach((day, index) => {
        const dayDate = new Date(start.getTime());
        dayDate.setDate(start.getDate() + index);
        day.date = dayDate.toISOString().split('T')[0];
    });

    const tripDurationEl = document.getElementById('tripDuration');
    if (tripDurationEl) {
        tripDurationEl.innerHTML = `
            <i class="fas fa-clock"></i>
            Duration: ${diffDays + 1} ${diffDays + 1 === 1 ? 'day' : 'days'}
        `;
    }

    const tripDateRangeEl = document.getElementById('tripDateRange');
    if (tripDateRangeEl) {
        tripDateRangeEl.innerHTML = `
            <i class="fas fa-calendar"></i>
            ${formatDate(startDateStr)} - ${formatDate(endDateStr)}
        `;
    }
}

// Helper to format date
function formatDate(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// ============================================
// ITINERARY RENDERING
// ============================================

function renderItinerary() {
    const container = document.getElementById('itineraryContainer');
    if (!container) return;

    if (!itinerary || itinerary.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marked-alt"></i>
                <h3>No days added yet</h3>
                <p>Click "Add Day" to start building your trip itinerary.</p>
            </div>
        `;
        return;
    }

    let html = '';

    itinerary.forEach((day, dayIndex) => {
        const isActive = dayIndex === currentDayIndex;
        html += `
            <div class="day-card ${isActive ? 'active' : ''}" data-day-index="${dayIndex}">
                <div class="day-header">
                    <div class="day-title">
                        <h3>Day ${day.day}</h3>
                        <span>${day.city || ''}</span>
                    </div>
                    <div class="day-meta">
                        <span>
                            <i class="far fa-calendar"></i>
                            ${day.date ? formatDate(day.date) : 'No date'}
                        </span>
                        <div class="day-actions">
                            <button class="btn-icon btn-edit-day" data-day-index="${dayIndex}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete-day" data-day-index="${dayIndex}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="day-body">
        `;

        if (!day.activities || day.activities.length === 0) {
            html += `
                <div class="empty-activities">
                    <p>No activities added yet</p>
                    <button class="btn-secondary btn-add-activity" data-day-index="${dayIndex}">
                        <i class="fas fa-plus"></i>
                        Add Activity
                    </button>
                </div>
            `;
        } else {
            html += `<div class="activity-list">`;
            day.activities.forEach((activity, activityIndex) => {
                const isExpanded = expandedActivityId === activity.id;
                html += `
                    <div class="activity-card ${isExpanded ? 'expanded' : ''}" 
                         data-day-index="${dayIndex}" 
                         data-activity-index="${activityIndex}">
                        <div class="activity-header">
                            <div>
                                <h4>${activity.name || 'Untitled Activity'}</h4>
                                <span class="activity-type">
                                    <i class="fas fa-map-marker-alt"></i>
                                    ${activity.type || 'Activity'}
                                </span>
                            </div>
                            <div class="activity-meta">
                                <span class="activity-time">
                                    <i class="far fa-clock"></i>
                                    ${activity.startTime || '--:--'} - ${activity.endTime || '--:--'}
                                </span>
                                <span class="activity-budget ${activity.budget === 'Paid' ? 'paid' : 'free'}">
                                    ${activity.budget === 'Paid' 
                                        ? formatPrice(activity.price, activity.currency) 
                                        : 'Free'}
                                </span>
                                <button class="btn-icon btn-toggle-activity" data-activity-id="${activity.id}">
                                    <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'}"></i>
                                </button>
                            </div>
                        </div>
                `;

                if (isExpanded) {
                    html += `
                        <div class="activity-details">
                            ${activity.location ? `
                                <p>
                                    <i class="fas fa-map-marker-alt"></i>
                                    ${activity.location}
                                    ${activity.locationLink ? `
                                        <a href="${activity.locationLink}" target="_blank" rel="noopener">
                                            View on map
                                        </a>
                                    ` : ''}
                                </p>` : ''
                            }
                            ${activity.description ? `
                                <p>
                                    <i class="fas fa-align-left"></i>
                                    ${activity.description}
                                </p>` : ''
                            }
                            <div class="activity-actions">
                                <button class="btn-secondary btn-edit-activity" 
                                        data-day-index="${dayIndex}"
                                        data-activity-index="${activityIndex}">
                                    <i class="fas fa-edit"></i>
                                    Edit
                                </button>
                                <button class="btn-secondary btn-delete-activity" 
                                        data-day-index="${dayIndex}"
                                        data-activity-index="${activityIndex}">
                                    <i class="fas fa-trash"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    `;
                }

                html += `</div>`;
            });

            html += `
                <button class="btn-secondary btn-add-activity" data-day-index="${dayIndex}">
                    <i class="fas fa-plus"></i>
                    Add Activity
                </button>
            </div>`;
        }

        html += `</div></div>`;
    });

    container.innerHTML = html;
    attachItineraryEventListeners();
}

function formatPrice(price, currencyCode) {
    if (price === null || price === undefined || price === '') return '';

    const priceNum = Number(price);
    if (isNaN(priceNum)) return '';

    const symbolMap = {
        USD: '$',
        EUR: '€',
        JPY: '¥',
        MYR: 'RM'
    };

    const symbol = symbolMap[currencyCode] || currencyCode || '';
    return `${symbol}${priceNum.toFixed(2)}`;
}

// ============================================
// EVENT HANDLERS FOR ITINERARY UI
// ============================================

function attachItineraryEventListeners() {
    document.querySelectorAll('.btn-add-activity').forEach(btn => {
        btn.addEventListener('click', () => {
            const dayIndex = parseInt(btn.getAttribute('data-day-index'), 10);
            openActivityModal(dayIndex);
        });
    });

    document.querySelectorAll('.btn-edit-day').forEach(btn => {
        btn.addEventListener('click', () => {
            const dayIndex = parseInt(btn.getAttribute('data-day-index'), 10);
            openDayModal(dayIndex);
        });
    });

    document.querySelectorAll('.btn-delete-day').forEach(btn => {
        btn.addEventListener('click', () => {
            const dayIndex = parseInt(btn.getAttribute('data-day-index'), 10);
            deleteDay(dayIndex);
        });
    });

    document.querySelectorAll('.btn-edit-activity').forEach(btn => {
        btn.addEventListener('click', () => {
            const dayIndex = parseInt(btn.getAttribute('data-day-index'), 10);
            const activityIndex = parseInt(btn.getAttribute('data-activity-index'), 10);
            openActivityModal(dayIndex, activityIndex);
        });
    });

    document.querySelectorAll('.btn-delete-activity').forEach(btn => {
        btn.addEventListener('click', () => {
            const dayIndex = parseInt(btn.getAttribute('data-day-index'), 10);
            const activityIndex = parseInt(btn.getAttribute('data-activity-index'), 10);
            deleteActivity(dayIndex, activityIndex);
        });
    });

    document.querySelectorAll('.btn-toggle-activity').forEach(btn => {
        btn.addEventListener('click', () => {
            const activityId = btn.getAttribute('data-activity-id');
            toggleActivityDetails(activityId);
        });
    });

    // Day card click
    document.querySelectorAll('.day-card').forEach(card => {
        card.addEventListener('click', event => {
            if (event.target.closest('.btn-edit-day') ||
                event.target.closest('.btn-delete-day') ||
                event.target.closest('.btn-add-activity') ||
                event.target.closest('.btn-edit-activity') ||
                event.target.closest('.btn-delete-activity') ||
                event.target.closest('.btn-toggle-activity')) {
                return;
            }

            const dayIndex = parseInt(card.getAttribute('data-day-index'), 10);
            setCurrentDay(dayIndex);
        });
    });
}

function toggleActivityDetails(activityId) {
    if (expandedActivityId === activityId) {
        expandedActivityId = null;
    } else {
        expandedActivityId = activityId;
    }
    renderItinerary();
}

function setCurrentDay(dayIndex) {
    if (dayIndex < 0 || dayIndex >= itinerary.length) return;
    currentDayIndex = dayIndex;
    renderItinerary();
    updateMapMarkers();
}

function addNewDay() {
    const newDayNumber = itinerary.length + 1;
    const newDay = createDay(newDayNumber);
    itinerary.push(newDay);
    currentDayIndex = itinerary.length - 1;
    renderItinerary();
}

function deleteDay(dayIndex) {
    if (dayIndex < 0 || dayIndex >= itinerary.length) return;
    itinerary.splice(dayIndex, 1);

    itinerary.forEach((day, index) => {
        day.day = index + 1;
    });

    if (currentDayIndex >= itinerary.length) {
        currentDayIndex = Math.max(0, itinerary.length - 1);
    }

    renderItinerary();
    updateMapMarkers();
}

function deleteActivity(dayIndex, activityIndex) {
    if (dayIndex < 0 || dayIndex >= itinerary.length) return;
    const day = itinerary[dayIndex];
    if (!day.activities || activityIndex < 0 || activityIndex >= day.activities.length) return;

    day.activities.splice(activityIndex, 1);
    renderItinerary();
    updateMapMarkers();
}

// ============================================
// MODALS (Day & Activity)
// ============================================

function openDayModal(dayIndex) {
    const modal = document.getElementById('dayModal');
    const titleInput = document.getElementById('dayTitle');
    const cityInput = document.getElementById('dayCity');
    const dateInput = document.getElementById('dayDate');
    const dayIndexInput = document.getElementById('dayIndex');

    if (!modal || !titleInput || !cityInput || !dateInput || !dayIndexInput) return;

    if (dayIndex !== null && dayIndex !== undefined && itinerary[dayIndex]) {
        const day = itinerary[dayIndex];
        titleInput.value = day.title || `Day ${day.day}`;
        cityInput.value = day.city || '';
        dateInput.value = day.date || '';
        dayIndexInput.value = dayIndex;
    } else {
        titleInput.value = '';
        cityInput.value = '';
        dateInput.value = '';
        dayIndexInput.value = '';
    }

    modal.classList.add('open');
}

function closeDayModal() {
    const modal = document.getElementById('dayModal');
    if (modal) modal.classList.remove('open');
}

function openActivityModal(dayIndex, activityIndex = null) {
    const modal = document.getElementById('activityModal');
    const form = document.getElementById('activityForm');
    const hiddenDayIndex = document.getElementById('activityDayIndex');
    const hiddenActivityIndex = document.getElementById('activityIndex');
    const nameInput = document.getElementById('activityName');
    const typeSelect = document.getElementById('activityType');
    const locationInput = document.getElementById('activityLocation');
    const locationLinkInput = document.getElementById('activityLocationLink');
    const startTimeInput = document.getElementById('activityStartTime');
    const endTimeInput = document.getElementById('activityEndTime');
    const budgetSelect = document.getElementById('activityBudget');
    const priceInput = document.getElementById('activityPrice');
    const currencySelect = document.getElementById('activityCurrency');
    const descriptionInput = document.getElementById('activityDescription');

    if (!modal || !form || !hiddenDayIndex || !hiddenActivityIndex) return;

    hiddenDayIndex.value = dayIndex;
    hiddenActivityIndex.value = activityIndex !== null ? activityIndex : '';

    if (activityIndex !== null && itinerary[dayIndex] && itinerary[dayIndex].activities[activityIndex]) {
        const activity = itinerary[dayIndex].activities[activityIndex];
        nameInput.value = activity.name || '';
        typeSelect.value = activity.type || 'Activity';
        locationInput.value = activity.location || '';
        locationLinkInput.value = activity.locationLink || '';
        startTimeInput.value = activity.startTime || '';
        endTimeInput.value = activity.endTime || '';
        budgetSelect.value = activity.budget || 'Free';
        priceInput.value = activity.price !== null && activity.price !== undefined ? activity.price : '';
        currencySelect.value = activity.currency || defaultCurrency || 'USD';
        descriptionInput.value = activity.description || '';
    } else {
        form.reset();
        budgetSelect.value = 'Free';
        priceInput.value = '';
        currencySelect.value = defaultCurrency || 'USD';
    }

    togglePriceFieldVisibility(budgetSelect.value);
    modal.classList.add('open');
}

function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) modal.classList.remove('open');
}

function togglePriceFieldVisibility(budgetValue) {
    const priceField = document.getElementById('priceField');
    if (!priceField) return;

    if (budgetValue === 'Paid') {
        priceField.style.display = 'block';
    } else {
        priceField.style.display = 'none';
    }
}

// ============================================
// FORM SUBMISSION (DAY & ACTIVITY)
// ============================================

function setupFormHandlers() {
    const dayForm = document.getElementById('dayForm');
    const activityForm = document.getElementById('activityForm');
    const btnCancelDay = document.getElementById('btnCancelDay');
    const btnCancelActivity = document.getElementById('btnCancelActivity');
    const budgetSelect = document.getElementById('activityBudget');

    if (dayForm) {
        dayForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const titleInput = document.getElementById('dayTitle');
            const cityInput = document.getElementById('dayCity');
            const dateInput = document.getElementById('dayDate');
            const dayIndexInput = document.getElementById('dayIndex');

            const title = titleInput.value.trim();
            const city = cityInput.value.trim();
            const date = dateInput.value;
            const dayIndexStr = dayIndexInput.value;

            if (dayIndexStr !== '') {
                const dayIndex = parseInt(dayIndexStr, 10);
                if (itinerary[dayIndex]) {
                    itinerary[dayIndex].title = title || itinerary[dayIndex].title;
                    itinerary[dayIndex].city = city;
                    itinerary[dayIndex].date = date || itinerary[dayIndex].date;
                }
            } else {
                const newDay = createDay(itinerary.length + 1, city, title, null, date);
                itinerary.push(newDay);
            }

            closeDayModal();
            renderItinerary();
        });
    }

    if (activityForm) {
        activityForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const hiddenDayIndex = document.getElementById('activityDayIndex');
            const hiddenActivityIndex = document.getElementById('activityIndex');
            const nameInput = document.getElementById('activityName');
            const typeSelect = document.getElementById('activityType');
            const locationInput = document.getElementById('activityLocation');
            const locationLinkInput = document.getElementById('activityLocationLink');
            const startTimeInput = document.getElementById('activityStartTime');
            const endTimeInput = document.getElementById('activityEndTime');
            const budgetSelect = document.getElementById('activityBudget');
            const priceInput = document.getElementById('activityPrice');
            const currencySelect = document.getElementById('activityCurrency');
            const descriptionInput = document.getElementById('activityDescription');

            const dayIndex = parseInt(hiddenDayIndex.value, 10);
            const activityIndexStr = hiddenActivityIndex.value;

            if (dayIndex < 0 || dayIndex >= itinerary.length) {
                console.error('Invalid day index for activity:', dayIndex);
                return;
            }

            const activityData = {
                name: nameInput.value.trim(),
                type: typeSelect.value,
                location: locationInput.value.trim(),
                locationLink: locationLinkInput.value.trim(),
                startTime: startTimeInput.value,
                endTime: endTimeInput.value,
                budget: budgetSelect.value,
                price: budgetSelect.value === 'Paid' && priceInput.value ? Number(priceInput.value) : null,
                currency: budgetSelect.value === 'Paid' ? currencySelect.value : null,
                description: descriptionInput.value.trim()
            };

            if (!itinerary[dayIndex].activities) {
                itinerary[dayIndex].activities = [];
            }

            if (activityIndexStr !== '') {
                const activityIndex = parseInt(activityIndexStr, 10);
                if (itinerary[dayIndex].activities[activityIndex]) {
                    Object.assign(itinerary[dayIndex].activities[activityIndex], activityData);
                }
            } else {
                const newActivity = createActivity(activityData);
                itinerary[dayIndex].activities.push(newActivity);
            }

            closeActivityModal();
            renderItinerary();
            updateMapMarkers();
        });
    }

    if (btnCancelDay) {
        btnCancelDay.addEventListener('click', (event) => {
            event.preventDefault();
            closeDayModal();
        });
    }

    if (btnCancelActivity) {
        btnCancelActivity.addEventListener('click', (event) => {
            event.preventDefault();
            closeActivityModal();
        });
    }

    if (budgetSelect) {
        budgetSelect.addEventListener('change', () => {
            togglePriceFieldVisibility(budgetSelect.value);
        });
    }
}

// ============================================
// BALANCE CALCULATOR
// ============================================

function renderBalanceCalculator() {
    const container = document.getElementById('balanceContent');
    if (!container) return;

    const paid = [];

    itinerary.forEach(day => {
        (day.activities || []).forEach(a => {
            if (a.budget === 'Paid' && a.price && a.currency) {
                paid.push({
                    type: a.type,
                    name: a.name,
                    price: a.price,
                    currency: a.currency
                });
            }
        });
    });

    if (paid.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wallet"></i>
                <h3>No expenses added yet</h3>
                <p>Mark activities as "Paid" and add price + currency to see your trip balance.</p>
            </div>
        `;
        return;
    }

    const groups = {};

    paid.forEach(a => {
        if (!groups[a.currency]) groups[a.currency] = {};
        if (!groups[a.currency][a.type]) groups[a.currency][a.type] = { total: 0, count: 0 };
        groups[a.currency][a.type].total += a.price;
        groups[a.currency][a.type].count += 1;
    });

    let html = '<div class="balance-breakdown"><h3>💰 Balance Calculator</h3>';

    Object.keys(groups).sort().forEach(code => {
        const symbolMap = { USD: '$', EUR: '€', JPY: '¥', MYR: 'RM' };
        const symbol = symbolMap[code] || code;
        const total = Object.values(groups[code]).reduce((t, s) => t + s.total, 0);

        html += `
            <div class="currency-header">
                <span>${code}</span>
                <span>${symbol}${total.toFixed(2)}</span>
            </div>
        `;

        Object.entries(groups[code]).forEach(([type, t]) => {
            html += `
                <div class="balance-item">
                    <div class="balance-item-info">
                        <h4>${type}</h4>
                        <p>${t.count} item(s)</p>
                    </div>
                    <div class="balance-amount">
                        ${symbol}${t.total.toFixed(2)}
                    </div>
                </div>
            `;
        });
    });

    html += '</div>';

    container.innerHTML = html;
}

// ============================================
// TAB SWITCHING & GENERAL EVENT SETUP
// ============================================

function setupEventListeners() {
    const mapTab = document.getElementById('mapTab');
    const balanceTab = document.getElementById('balanceTab');
    const mapView = document.getElementById('mapView');
    const balanceView = document.getElementById('balanceView');

    if (mapTab && balanceTab) {
        mapTab.addEventListener('click', () => {
            mapTab.classList.add('active');
            balanceTab.classList.remove('active');
            mapView.style.display = 'block';
            balanceView.style.display = 'none';
            setTimeout(() => map.invalidateSize(), 100);
        });

        balanceTab.addEventListener('click', () => {
            balanceTab.classList.add('active');
            mapTab.classList.remove('active');
            balanceView.style.display = 'block';
            mapView.style.display = 'none';
            if (typeof renderBalanceCalculator === 'function') {
                renderBalanceCalculator();
            }
        });
    }

    const addDayBtn = document.getElementById('addDayBtn');
    if (addDayBtn) {
        addDayBtn.addEventListener('click', addNewDay);
    }
}

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    detectMode();
    updatePageContent();
    initializeItineraryFromTemplate();
    initializeMap();
    renderItinerary();
    updateMapMarkers();
    setupFormHandlers();
    setupEventListeners();
});

// Update page content based on country/mode
function updatePageContent() {
    document.title = currentCountryConfig.title || 'Trip Planner';

    const heroTitleEl = document.getElementById('tripCountryName');
    const heroSubtitleEl = document.getElementById('tripSubtitle');

    if (heroTitleEl) {
        if (currentMode === 'blank') {
            const params = getUrlParams();
            heroTitleEl.textContent = params.countryLabel || params.country || 'Custom Trip';
        } else {
            heroTitleEl.textContent = currentCountryConfig.heroTitle || currentCountryConfig.title;
        }
    }

    if (heroSubtitleEl) {
        heroSubtitleEl.textContent = currentCountryConfig.heroSubtitle || '';
    }

    const tripMetaCountryEl = document.getElementById('tripMetaCountry');
    if (tripMetaCountryEl) {
        const params = getUrlParams();
        const countryLabel = params.countryLabel || params.country || 'Custom Destination';
        tripMetaCountryEl.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            ${countryLabel}
        `;
    }
}

// ============================================
// URL-BASED TRIP LOADING (legacy localStorage)
// ============================================

// Load trip when tripId is in URL (used on trip-planner.html)
function loadTripFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('tripId');

    if (!tripId) return;

    // Just use the DB-based loader
    loadSavedTrip(tripId);
}


// ============================================
// TRIP SAVE/LOAD (localStorage + DB)
// ============================================

function generateTripId() {
    return 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function saveCurrentTrip() {
    console.log('Save button clicked -> calling handleSaveTripClick');
    handleSaveTripClick();
}

function loadTripById(tripId) {
    // For compatibility if something still calls this
    loadSavedTrip(tripId);
    return true;
}


// ============================================================================
// TRIP SAVING AND MANAGEMENT - Append to trip-planner.js
// ============================================================================

// Global variable to track current trip name
// currentTripId is already declared globally above
var currentTripName = typeof currentTripName !== 'undefined' ? currentTripName : null;

/**
 * Initialize trip from URL parameter (if loading existing trip)
 */
function initializeSavedTrip() {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('tripId');

    if (tripId) {
        loadSavedTrip(tripId);
    }
}

/**
 * Load a saved trip from localStorage and refresh the UI
 */
// Load a saved trip FROM THE BACKEND (DB), not from localStorage
// Load a saved trip from the BACKEND (DB)
async function loadSavedTrip(tripId) {
    try {
        // Ask the server for this trip (includes itinerary_json)
        const response = await fetch(`http://localhost:3000/api/trip/${tripId}`);

        if (!response.ok) {
            console.error('Failed to load trip from API:', response.status, response.statusText);
            alert('Failed to load trip from server.');
            return;
        }

        const data = await response.json();

        // Extract itinerary and basic info
        const loadedItinerary = Array.isArray(data.itinerary) ? data.itinerary : [];

        currentTripId = String(data.id);
        currentTripName = data.trip_name || 'Trip';
        itinerary = loadedItinerary;

        // Update header title
        const tripCountryNameEl = document.getElementById('tripCountryName');
        if (tripCountryNameEl) {
            tripCountryNameEl.textContent = currentTripName;
        }

        // Date range (from DB)
        if (data.start_date && data.end_date) {
            const tripDateRangeEl = document.getElementById('tripDateRange');
            if (tripDateRangeEl) {
                tripDateRangeEl.innerHTML = `
                    <i class="fas fa-calendar"></i>
                    ${formatDate(data.start_date)} - ${formatDate(data.end_date)}
                `;
            }
        }

        // Duration label based on itinerary length
        const tripDurationEl = document.getElementById('tripDuration');
        if (tripDurationEl) {
            tripDurationEl.innerHTML = `
                <i class="fas fa-clock"></i>
                Duration: ${loadedItinerary.length} ${loadedItinerary.length === 1 ? 'day' : 'days'}
            `;
        }

        // Render everything
        if (typeof renderItinerary === 'function') {
            renderItinerary();
        }
        if (typeof updateMapMarkers === 'function') {
            updateMapMarkers();
        }
        if (typeof renderBalanceCalculator === 'function') {
            renderBalanceCalculator();
        }
        if (typeof showNotification === 'function') {
            showNotification(`Loaded trip: ${currentTripName}`);
        }
    } catch (e) {
        console.error('Error loading saved trip from API:', e);
        alert('Error loading trip from server.');
    }
}



/**
 * Handle Save button click, and delegate to REAL_FIX.js for DB
 */
async function handleSaveTripClick() {
    const user = getCurrentUser();
    if (!user || !user.email) {
        alert('You must be logged in to save trips');
        return;
    }

    if (!itinerary || itinerary.length === 0) {
        alert('Please add at least one day to your trip before saving');
        return;
    }

    if (!currentTripId) {
        const params = new URLSearchParams(window.location.search);
        const countryLabel = params.get('countryLabel') || params.get('country') || 'Trip';
        const defaultName = countryLabel + ' Trip';

        const tripNameInput = prompt('Enter a name for your trip:', defaultName);

        if (!tripNameInput || tripNameInput.trim() === '') {
            return;
        }

        currentTripName = tripNameInput.trim();
        currentTripId = generateTripId();
    }

    const params = new URLSearchParams(window.location.search);
    const tripData = {
        id: currentTripId,
        title: currentTripName,
        country: params.get('country') || '',
        countryLabel: params.get('countryLabel') || '',
        startDate: params.get('startDate') || '',
        endDate: params.get('endDate') || '',
        days: itinerary.length,
        lastUpdated: new Date().toISOString()
    };

    // Use the same save flow as japan-custom-plan.js: prompt, send to DB, seed localStorage, update trips summary
    await savePlannerTripToProfileAndDatabase(tripData);
}


/**
 * Save planner trip: send to backend, save itinerary to localStorage under DB id,
 * and register/update trip summary for the current user (so Profile shows it).
 */
async function savePlannerTripToProfileAndDatabase(tripData) {
    const user = (typeof window.getCurrentUser === 'function') ? window.getCurrentUser() : null;
    if (!user || (!user.id && !user.email)) {
        console.warn('No logged-in user → skip saving trip to profile/database');
        alert('You must be logged in to save trips to your profile.');
        return false;
    }

    if (!Array.isArray(itinerary) || itinerary.length === 0) {
        alert('Add at least one day before saving the trip to your profile.');
        return false;
    }

    // Ask user for a trip name if not already set
    let tripName = tripData.title || currentTripName || '';
    if (!tripName || tripName.trim() === '') {
        const defaultName = tripData.countryLabel || tripData.country || 'Trip';
        const tripNameInput = prompt('Enter a name for this trip:', defaultName + ' Trip');
        if (!tripNameInput || tripNameInput.trim() === '') return false;
        tripName = tripNameInput.trim();
    }

    // Infer dates from itinerary when available
    let startDate = tripData.startDate || '';
    let endDate = tripData.endDate || '';
    if ((!startDate || !endDate) && itinerary && itinerary.length > 0) {
        startDate = startDate || itinerary[0].date || '';
        endDate = endDate || itinerary[itinerary.length - 1].date || '';
    }

    const userId = user.id || user.email;

    const body = {
        user_id: userId,
        trip_name: tripName,
        country: tripData.country || '',
        start_date: startDate,
        end_date: endDate,
        days_count: itinerary.length,
        itinerary: itinerary
    };

    try {
        const response = await fetch('http://localhost:3000/api/trips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            console.error('Failed to save trip to DB:', data);
            alert(data.error || 'Failed to save trip to your profile.');
            return false;
        }

        console.log('✅ Trip saved in DB:', data);

        const dbId = String(data.id || tripData.id || generateTripId());

        // Save itinerary to localStorage under DB id so planner pages can load it via ?tripId=
        try {
            const itineraryKey = 'itinerary:' + dbId;
            localStorage.setItem(itineraryKey, JSON.stringify(itinerary));
            console.log('✅ Itinerary saved to localStorage:', itineraryKey);
        } catch (e) {
            console.warn('Could not save itinerary for trip id', dbId, e);
        }

        // Update per-user trips summary
        try {
            const tripsKey = 'tripwise:trips:' + (user.email || user.id);
            let trips = [];
            const existing = localStorage.getItem(tripsKey);
            if (existing) trips = JSON.parse(existing);

            const summary = {
                id: dbId,
                title: tripName,
                country: tripData.country || '',
                countryLabel: tripData.countryLabel || tripData.country || '',
                startDate: startDate,
                endDate: endDate,
                days: itinerary.length,
                lastUpdated: new Date().toISOString()
            };

            const idx = trips.findIndex(t => String(t.id) === dbId);
            if (idx >= 0) trips[idx] = summary; else trips.push(summary);
            localStorage.setItem(tripsKey, JSON.stringify(trips));
            console.log('✅ Trip registered in localStorage for profile.');
        } catch (e) {
            console.warn('Could not update trips list for profile:', e);
        }

        // Keep global IDs in sync
        window.currentTripId = dbId;
        window.currentTripName = tripName;

        // Update UI title
        const tripCountryNameEl = document.getElementById('tripCountryName');
        if (tripCountryNameEl) tripCountryNameEl.textContent = tripName;

        // Update URL with tripId
        try {
            const params = new URLSearchParams(window.location.search);
            if (!params.get('tripId')) {
                params.set('tripId', dbId);
                const newUrl = window.location.pathname + '?' + params.toString();
                window.history.replaceState({}, '', newUrl);
            }
        } catch (e) { /* ignore */ }

        // Notify user
        if (typeof showNotification === 'function') showNotification('Trip saved successfully!');
        else alert('Trip saved to your profile successfully!');

        return true;
    } catch (error) {
        console.error('Network error saving trip:', error);
        alert('Network error while saving trip');
        return false;
    }
}

// Expose canonical save function to global scope for unified save handler compatibility
if (typeof window !== 'undefined') {
    window.savePlannerTripToProfileAndDatabase = async function(tripData) {
        return savePlannerTripToProfileAndDatabase(tripData);
    };
}

/**
 * Save user trip via REAL_FIX.js logic (DB + localStorage)
 */
async function saveUserTrip(tripData, itinerary) {
    const user = getCurrentUser();
    // لازم يكون عندك user.id و user.email من تسجيل الدخول
    if (!user || !user.id || !user.email) {
        alert('You must be logged in to save trips');
        return false;
    }

    // نحاول استنتاج التواريخ لو ناقصة
    let startDate = tripData.startDate;
    let endDate = tripData.endDate;

    if ((!startDate || !endDate) && itinerary && itinerary.length > 0) {
        startDate = startDate || itinerary[0].date;
        endDate = endDate || itinerary[itinerary.length - 1].date;
    }

    const country =
        tripData.countryLabel ||
        tripData.country ||
        'Custom';

    try {
        // نرسل الرحلة للـ backend (نضيف itinerary لو حبيت تخزنه في الـ DB)
        const response = await fetch('http://localhost:3000/api/trips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                trip_name: tripData.title,
                country: country,
                start_date: startDate,
                end_date: endDate,
                days_count: itinerary ? itinerary.length : (tripData.days || null),
                itinerary: itinerary || []   // اختياري: لو عدلت الـ server ليستقبلها
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error saving trip to DB:', data);
            alert(data.error || 'Failed to save trip');
            return false;
        }

        console.log('Trip saved in DB:', data);

        // نستخدم id الذي يرجع من الـ DB كـ tripId الرسمي
        const tripId = String(data.id || tripData.id);
        currentTripId = tripId;
        tripData.id = tripId;

        // 1) حفظ الـ itinerary في localStorage بالمفتاح الذي يستخدمه الـ opener
        try {
            const itineraryKey = 'itinerary:' + tripId;
            localStorage.setItem(itineraryKey, JSON.stringify(itinerary || []));
            console.log('✅ Itinerary saved to localStorage with key', itineraryKey);
        } catch (e) {
            console.warn('⚠️ Could not save itinerary locally:', e);
        }

        // 2) حفظ/تحديث قائمة الرحلات في localStorage ليستفيد منها loadSavedTrip
        try {
            const tripsKey = 'tripwise:trips:' + user.email;
            let trips = [];
            const existing = localStorage.getItem(tripsKey);
            if (existing) {
                trips = JSON.parse(existing);
            }

            const summary = {
                id: tripId,
                title: tripData.title,
                country: country,
                startDate: startDate,
                endDate: endDate,
                days: itinerary ? itinerary.length : (tripData.days || 0),
                lastUpdated: new Date().toISOString()
            };

            const idx = trips.findIndex(t => String(t.id) === tripId);
            if (idx >= 0) {
                trips[idx] = summary;       // تحديث رحلة قديمة
            } else {
                trips.push(summary);        // إضافة رحلة جديدة
            }

            localStorage.setItem(tripsKey, JSON.stringify(trips));
            console.log('✅ Trip summary saved to', tripsKey);
        } catch (e) {
            console.warn('⚠️ Could not save trips list:', e);
        }

        return true;
    } catch (error) {
        console.error('Network error saving trip:', error);
        alert('Network error while saving trip');
        return false;
    }
}


// Ensure saved trips are loaded and save button connected
document.addEventListener('DOMContentLoaded', function() {
    initializeSavedTrip();

    const btnSavePlan = document.getElementById('btnSavePlan');
    if (btnSavePlan) {
        const newBtn = btnSavePlan.cloneNode(true);
        btnSavePlan.parentNode.replaceChild(newBtn, btnSavePlan);

        newBtn.addEventListener('click', handleSaveTripClick);
        console.log('✅ Save button initialized with trip management');
    } else {
        console.error('Save button not found');
    }
});
