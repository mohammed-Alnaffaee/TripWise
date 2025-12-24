async function loadTripFromDatabase(tripId) {
    console.log('🔄 Loading trip from database:', tripId);
    
    try {
        const response = await fetch(`http://localhost:3000/api/trip/${tripId}`);
        
        if (!response.ok) {
            console.error('❌ Failed to load trip:', response.status);
            throw new Error(`Failed to load trip: ${response.statusText}`);
        }
        
        const tripData = await response.json();
        console.log('✅ Trip data loaded from database:', tripData);
        
        // Set global variables
        currentTripId = tripData.id;
        currentTripName = tripData.trip_name || 'Trip';
        
        // Parse itinerary from database
        if (tripData.itinerary && Array.isArray(tripData.itinerary)) {
            itinerary = tripData.itinerary;
            console.log(`✅ Loaded ${itinerary.length} days with activities`);
        } else {
            console.warn('⚠️ No itinerary data found in trip');
            itinerary = [];
        }
        
        // Update UI with trip metadata
        updateTripHeader(tripData);
        
        // Render the itinerary
        if (typeof renderItinerary === 'function') {
            renderItinerary();
        }
        
        // Update map markers
        if (typeof updateMapMarkers === 'function') {
            updateMapMarkers();
        }
        
        // Update balance calculator
        if (typeof renderBalanceCalculator === 'function') {
            renderBalanceCalculator();
        }
        
        // Also save to localStorage for offline access
        saveToLocalStorage(tripData);
        
        if (typeof showNotification === 'function') {
            showNotification(`Loaded: ${currentTripName}`);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error loading trip from database:', error);
        
        // Fallback to localStorage if database fails
        console.log('⚠️ Falling back to localStorage...');
        return loadTripFromLocalStorage(tripId);
    }
}

/**
 * Update trip header with metadata
 */
function updateTripHeader(tripData) {
    // Update trip name
    const tripCountryNameEl = document.getElementById('tripCountryName');
    if (tripCountryNameEl) {
        tripCountryNameEl.textContent = tripData.trip_name || tripData.country || 'Trip';
    }
    
    // Update date range
    if (tripData.start_date && tripData.end_date) {
        const tripDateRangeEl = document.getElementById('tripDateRange');
        if (tripDateRangeEl) {
            tripDateRangeEl.innerHTML = `
                <i class="fas fa-calendar"></i>
                ${formatDate(tripData.start_date)} - ${formatDate(tripData.end_date)}
            `;
        }
    }
    
    // Update duration
    const tripDurationEl = document.getElementById('tripDuration');
    if (tripDurationEl && tripData.days_count) {
        tripDurationEl.innerHTML = `
            <i class="fas fa-clock"></i>
            Duration: ${tripData.days_count} ${tripData.days_count === 1 ? 'day' : 'days'}
        `;
    } else if (tripDurationEl && itinerary.length > 0) {
        tripDurationEl.innerHTML = `
            <i class="fas fa-clock"></i>
            Duration: ${itinerary.length} ${itinerary.length === 1 ? 'day' : 'days'}
        `;
    }
    
    // Update country metadata
    const tripMetaCountryEl = document.getElementById('tripMetaCountry');
    if (tripMetaCountryEl && tripData.country) {
        tripMetaCountryEl.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            ${tripData.country}
        `;
    }
}

/**
 * Save trip to localStorage for offline access
 */
function saveToLocalStorage(tripData) {
    try {
        const user = getCurrentUser();
        if (!user || !user.email) return;
        
        // Save itinerary
        const itineraryKey = 'itinerary:' + tripData.id;
        localStorage.setItem(itineraryKey, JSON.stringify(tripData.itinerary));
        
        // Save trip metadata
        const tripsKey = 'tripwise:trips:' + user.email;
        const existingTrips = JSON.parse(localStorage.getItem(tripsKey) || '[]');
        
        const tripMetadata = {
            id: String(tripData.id),
            title: tripData.trip_name,
            country: tripData.country,
            countryLabel: tripData.country,
            startDate: tripData.start_date,
            endDate: tripData.end_date,
            days: tripData.days_count || tripData.itinerary.length,
            lastUpdated: new Date().toISOString()
        };
        
        const idx = existingTrips.findIndex(t => String(t.id) === String(tripData.id));
        if (idx >= 0) {
            existingTrips[idx] = tripMetadata;
        } else {
            existingTrips.push(tripMetadata);
        }
        
        localStorage.setItem(tripsKey, JSON.stringify(existingTrips));
        console.log('✅ Saved trip to localStorage for offline access');
        
    } catch (e) {
        console.warn('⚠️ Could not save to localStorage:', e);
    }
}

/**
 * Fallback: Load from localStorage (original behavior)
 */
function loadTripFromLocalStorage(tripId) {
    console.log('📦 Loading trip from localStorage:', tripId);
    
    const itineraryKey = 'itinerary:' + tripId;
    const stored = localStorage.getItem(itineraryKey);
    
    if (!stored) {
        console.error('❌ Trip not found in localStorage');
        alert('Trip not found. Please try again or contact support.');
        return false;
    }
    
    try {
        itinerary = JSON.parse(stored);
        currentTripId = tripId;
        
        // Try to get trip metadata
        const user = getCurrentUser();
        if (user && user.email) {
            const tripsKey = 'tripwise:trips:' + user.email;
            const tripsData = localStorage.getItem(tripsKey);
            if (tripsData) {
                const trips = JSON.parse(tripsData);
                const trip = trips.find(t => String(t.id) === String(tripId));
                if (trip) {
                    currentTripName = trip.title;
                    updateTripHeader({
                        trip_name: trip.title,
                        country: trip.country,
                        start_date: trip.startDate,
                        end_date: trip.endDate,
                        days_count: trip.days
                    });
                }
            }
        }
        
        // Render UI
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
            showNotification('Trip loaded from local storage');
        }
        
        return true;
    } catch (e) {
        console.error('❌ Error parsing localStorage trip:', e);
        alert('Error loading trip. Data may be corrupted.');
        return false;
    }
}

/**
 * Main initialization - detects tripId and loads appropriately
 * REPLACES the old loadTripFromURL function
 */
async function initializeTripLoader() {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('tripId');
    
    if (!tripId) {
        console.log('ℹ️ No tripId in URL - using template initialization');
        return; // No trip to load, continue with template initialization
    }
    
    console.log('🎯 Detected tripId in URL:', tripId);
    
    // Load from database first (primary source)
    const success = await loadTripFromDatabase(tripId);
    
    if (!success) {
        console.error('❌ Failed to load trip from all sources');
    }
}

// ============================================================================
// OVERRIDE DOMContentLoaded to use new loader
// ============================================================================

// Save the original DOMContentLoaded behavior
const originalInit = () => {
    if (typeof detectMode === 'function') detectMode();
    if (typeof updatePageContent === 'function') updatePageContent();
    if (typeof initializeItineraryFromTemplate === 'function') initializeItineraryFromTemplate();
    if (typeof initializeMap === 'function') initializeMap();
    if (typeof renderItinerary === 'function') renderItinerary();
    if (typeof updateMapMarkers === 'function') updateMapMarkers();
    if (typeof setupFormHandlers === 'function') setupFormHandlers();
    if (typeof setupEventListeners === 'function') setupEventListeners();
};

// New initialization that checks for tripId first
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Trip Planner Initializing with Database Loader...');
    
    // Check if we're loading a saved trip
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('tripId');
    
    if (tripId) {
        // Loading saved trip from database
        console.log('📂 Loading saved trip:', tripId);
        
        // Initialize basic components first
        if (typeof detectMode === 'function') detectMode();
        if (typeof initializeMap === 'function') initializeMap();
        if (typeof setupFormHandlers === 'function') setupFormHandlers();
        if (typeof setupEventListeners === 'function') setupEventListeners();
        
        // Load the trip from database
        await initializeTripLoader();
        
    } else {
        // Normal initialization for new trips
        console.log('✨ Starting new trip...');
        originalInit();
    }
});

console.log('✅ Trip Loader Fix loaded successfully');