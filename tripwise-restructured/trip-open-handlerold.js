/**
 * Trip Open Handler
 * - Handles opening saved trips from Profile page
 * - Loads trip data into japan-custom-plan.html
 * - Generic structure for future multi-country support
 */

(function() {
    'use strict';

    /**
     * Open a saved trip by ID
     * @param {string} tripId - The trip ID to open
     */
    window.openTrip = function(tripId) {
        console.log('🔄 Opening trip:', tripId);

        if (!tripId) {
            console.error('❌ No trip ID provided');
            alert('Error: Cannot open trip - no ID provided');
            return;
        }

        // Get trip metadata from user's trips list
        const user = getCurrentUser();
        if (!user || !user.email) {
            console.error('❌ No user logged in');
            alert('Please log in to open trips');
            return;
        }

        // Load trip summary
        const tripsKey = 'tripwise:trips:' + user.email;
        const tripsData = localStorage.getItem(tripsKey);

        if (!tripsData) {
            console.error('❌ No trips found for user');
            alert('No saved trips found');
            return;
        }

        let tripSummary = null;
        try {
            const trips = JSON.parse(tripsData);
            tripSummary = trips.find(t => String(t.id) === String(tripId));
        } catch (e) {
            console.error('❌ Error parsing trips:', e);
            alert('Error loading trip data');
            return;
        }

        if (!tripSummary) {
            console.error('❌ Trip not found:', tripId);
            alert('Trip not found');
            return;
        }

        console.log('✅ Trip summary loaded:', tripSummary);

        // Check if itinerary exists in localStorage
        const itineraryKey = 'itinerary:' + tripId;
        const itineraryData = localStorage.getItem(itineraryKey);
                  console.log('before if ')
        if (!itineraryData) {
            //console.warn('⚠️ No itinerary found in localStorage for trip:', tripId);
            //alert('Trip itinerary not found. The trip may need to be re-saved.');
            //return;
             // Itinerary not present locally — do NOT block opening the trip.
            // Many users may have trips saved only on the server (DB-first). In that
            // case we still navigate to the trip planner page which will attempt
            // to load the trip from the backend (see trip-loader-fix.js / trip-planner.js).
            console.warn('⚠️ No itinerary found in localStorage for trip:', tripId);
            // Optional gentle notice — do not alert aggressively because it interrupts
            // the flow. Use console + a non-blocking notification if available.
            if (typeof showNotification === 'function') {
                showNotification('Itinerary not found locally — loading from server...', 'info');
            } else {
                console.log('Itinerary not found locally — planner will attempt to load from server.');
            }
            // Continue — do not return. The planner page will fetch the trip by tripId.
            console.log('After if ')
            confirm('Afrer if')

        }
        

        // Determine target page based on country
let country = (tripSummary.country || '').toLowerCase();

// Fallback: use countryLabel if country is empty
if (!country && tripSummary.countryLabel) {
    const label = tripSummary.countryLabel.toLowerCase();
    if (label === 'japan') {
        country = 'japan';
    }
}

const targetPage = getTargetPageForCountry(country);


        console.log('✅ Redirecting to:', targetPage);

        // Build URL with trip parameters
        const urlParams = new URLSearchParams({
            tripId: tripId,
            country: country,
            countryLabel: tripSummary.countryLabel || tripSummary.country || 'Custom',
            startDate: tripSummary.startDate || '',
            endDate: tripSummary.endDate || ''
        });

        // Navigate to target page
        window.location.href = targetPage + '?' + urlParams.toString();
    };

    /**
     * Get target page for a given country
     * @param {string} country - Country code/name
     * @returns {string} - Target HTML page
     */
    function getTargetPageForCountry(country) {
        // Country to page mapping
        const countryPageMap = {
            'japan': 'japan-custom-plan.html',
            'malaysia': 'trip-planner.html', // Future: malaysia-custom-plan.html
            'france': 'trip-planner.html',   // Future: france-custom-plan.html
            'italy': 'trip-planner.html',    // Future: italy-custom-plan.html
            'usa': 'trip-planner.html',      // Future: usa-custom-plan.html
            'uk': 'trip-planner.html',       // Future: uk-custom-plan.html
            // Add more countries as needed
        };

        // Default to trip-planner.html for unknown countries
        return countryPageMap[country] || 'trip-planner.html';
    }

    /**
     * Helper: Get current user
     * @returns {object|null} - User object or null
     */
    function getCurrentUser() {
        if (typeof window.getCurrentUser === 'function') {
            return window.getCurrentUser();
        }

        // Fallback: read from localStorage directly
        const STORAGE_KEYS = {
            CURRENT_USER: 'currentUser'
        };
        const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return userStr ? JSON.parse(userStr) : null;
    }

    console.log('✅ Trip Open Handler loaded');
})();
