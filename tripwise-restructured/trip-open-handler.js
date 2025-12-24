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

        // Attempt to fetch trip from backend and seed localStorage so the
        // planner can render immediately after navigation. If fetching fails
        // we still navigate and let the planner's DB-first loader retry.
        (async () => {
            let tripSummary = null;
            let user = null;

            try {
                user = getCurrentUser();
            } catch (e) {
                console.warn('Could not read current user:', e);
            }

            // If we have a local trips list, try to read a summary first
            try {
                if (user && user.email) {
                    const tripsKey = 'tripwise:trips:' + user.email;
                    const tripsData = localStorage.getItem(tripsKey);
                    if (tripsData) {
                        const trips = JSON.parse(tripsData || '[]');
                        tripSummary = trips.find(t => String(t.id) === String(tripId)) || null;
                    }
                }
            } catch (e) {
                console.warn('Warning reading local trip summary:', e);
            }

            // Try fetching the full trip from the server
            try {
                const resp = await fetch(`http://localhost:3000/api/trip/${tripId}`);
                if (resp.ok) {
                    const data = await resp.json();

                    // Save itinerary to localStorage so planner can read it immediately
                    try {
                        const itineraryKey = 'itinerary:' + tripId;
                        localStorage.setItem(itineraryKey, JSON.stringify(data.itinerary || []));
                    } catch (e) {
                        console.warn('Could not save itinerary to localStorage:', e);
                    }

                    // Update trips summary for this user if we know the user's email
                    try {
                        user = user || getCurrentUser();
                        if (user && user.email) {
                            const tripsKey = 'tripwise:trips:' + user.email;
                            const existing = JSON.parse(localStorage.getItem(tripsKey) || '[]');
                            const summary = {
                                id: String(data.id),
                                title: data.trip_name || (tripSummary && tripSummary.title) || 'Untitled Trip',
                                country: data.country || (tripSummary && tripSummary.country) || '',
                                countryLabel: data.country || (tripSummary && tripSummary.countryLabel) || '',
                                startDate: data.start_date || (tripSummary && tripSummary.startDate) || '',
                                endDate: data.end_date || (tripSummary && tripSummary.endDate) || '',
                                days: data.days_count || (Array.isArray(data.itinerary) ? data.itinerary.length : 0),
                                lastUpdated: new Date().toISOString()
                            };

                            const idx = existing.findIndex(t => String(t.id) === String(tripId));
                            if (idx >= 0) existing[idx] = summary; else existing.push(summary);
                            localStorage.setItem(tripsKey, JSON.stringify(existing));
                        }
                    } catch (e) {
                        console.warn('Could not update trips summary in localStorage:', e);
                    }

                    console.log('✅ Fetched trip from server and seeded localStorage:', tripId);
                } else {
                    console.warn('Could not fetch trip from server (status ' + resp.status + '), will still navigate.');
                }
            } catch (e) {
                console.warn('Network error fetching trip from server, will still navigate:', e);
            }

            // Decide target page and navigate. Use whatever tripSummary we have (local or fetched)
            const summaryForRouting = tripSummary || (function() {
                try { const userTmp = getCurrentUser(); if (userTmp && userTmp.email) {
                    const tripsKey = 'tripwise:trips:' + userTmp.email; const tripsData = JSON.parse(localStorage.getItem(tripsKey) || '[]'); return tripsData.find(t => String(t.id) === String(tripId)) || null; } } catch(e){ }
                return null;
            })();

            let country = (summaryForRouting && summaryForRouting.country || '') .toLowerCase();
            if (!country && summaryForRouting && summaryForRouting.countryLabel) {
                const label = summaryForRouting.countryLabel.toLowerCase();
                if (label === 'japan') country = 'japan';
            }

            const targetPage = getTargetPageForCountry(country);
            const urlParams = new URLSearchParams({
                tripId: tripId,
                country: country || '',
                countryLabel: (summaryForRouting && summaryForRouting.countryLabel) || (summaryForRouting && summaryForRouting.country) || 'Custom',
                startDate: (summaryForRouting && summaryForRouting.startDate) || '',
                endDate: (summaryForRouting && summaryForRouting.endDate) || ''
            });
            // Indicate planner mode when opening from profile
            urlParams.set('mode', 'planner');

            console.log('✅ Redirecting to:', targetPage);
            window.location.href = targetPage + '?' + urlParams.toString();
        })();
        // End of async opener
        return;
    };

    /**
     * Get target page for a given country
     * @param {string} country - Country code/name
     * @returns {string} - Target HTML page
     */
    function getTargetPageForCountry(country) {
        // Country to page mapping
        const countryPageMap = {
            // All countries open in the unified custom planner (Japan-based planner)
            'japan': 'japan-custom-plan.html',
            'malaysia': 'japan-custom-plan.html',
            'france': 'japan-custom-plan.html',
            'italy': 'japan-custom-plan.html',
            'usa': 'japan-custom-plan.html',
            'uk': 'japan-custom-plan.html',
            // Add more countries as needed and keep mapping to japan-custom-plan.html
        };

        // Default to japan-custom-plan.html for unknown countries
        return countryPageMap[country] || 'japan-custom-plan.html';
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
