// ========================================
// REAL FIX FOR SAVE BUTTON
// ========================================
// Problem: Multiple conflicting event handlers on the same button
// Solution: Remove all old handlers and attach ONE clean handler

(function() {
    'use strict';
    
    console.log('🔧 Loading clean save button fix...');
    
    // Wait for DOM and other scripts to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSaveButton);
    } else {
        // DOM already loaded, wait for other scripts
        setTimeout(initSaveButton, 1000);
    }
    
    function initSaveButton() {
        console.log('🚀 Initializing save button...');
        
        // Find the save button
        const btnSavePlan = document.getElementById('btnSavePlan');
        
        if (!btnSavePlan) {
            console.error('❌ Save button not found: #btnSavePlan');
            return;
        }
        
        // CRITICAL: Remove ALL existing event listeners by cloning
        const cleanButton = btnSavePlan.cloneNode(true);
        btnSavePlan.parentNode.replaceChild(cleanButton, btnSavePlan);
        
        console.log('✅ Cleaned old event listeners');
        
        // Attach ONE clean event handler
        cleanButton.addEventListener('click', handleSaveClick);
        
        console.log('✅ Save button ready!');
    }
    
    // Single unified save handler
    async function handleSaveClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('💾 Save button clicked');
        
        // Check if user is logged in
        const user = getCurrentUser();
        if (!user || !user.email) {
            alert('You must be logged in to save trips');
            console.error('❌ No user logged in');
            return;
        }
        
        console.log('✅ User authenticated:', user.email);
        
        // Check if itinerary exists
        if (typeof itinerary === 'undefined' || !itinerary || itinerary.length === 0) {
            alert('Please add at least one day to your trip before saving');
            console.error('❌ No itinerary to save');
            return;
        }
        
        console.log('✅ Itinerary exists:', itinerary.length, 'days');
        
        // Get or create trip ID and name
        let tripId = window.currentTripId;
        let tripName = window.currentTripName;
        
        if (!tripId) {
            // New trip - ask for name
            const params = new URLSearchParams(window.location.search);
            const countryLabel = params.get('countryLabel') || params.get('country') || 'Custom';
            const defaultName = countryLabel + ' Trip';
            
            tripName = prompt('Enter a name for your trip:', defaultName);
            
            if (!tripName || tripName.trim() === '') {
                console.log('❌ User cancelled trip name prompt');
                return;
            }
            
            tripName = tripName.trim();
            tripId = generateTripId();
            
            // Store globally
            window.currentTripId = tripId;
            window.currentTripName = tripName;
            
            console.log('✅ New trip created:', tripId, tripName);
        }
        
        // Build trip data
        const params = new URLSearchParams(window.location.search);
        
        let startDate = params.get('startDate') || '';
        let endDate = params.get('endDate') || '';
        
        // Get dates from itinerary if not in URL
        if ((!startDate || !endDate) && itinerary.length > 0) {
            startDate = startDate || itinerary[0].date || '';
            endDate = endDate || itinerary[itinerary.length - 1].date || '';
        }
        
        const tripData = {
            id: tripId,
            title: tripName,
            country: params.get('country') || '',
            countryLabel: params.get('countryLabel') || '',
            startDate: startDate,
            endDate: endDate,
            days: itinerary.length,
            lastUpdated: new Date().toISOString()
        };
        
        console.log('📦 Trip data prepared:', tripData);
        
        // If the planner provides a canonical save function, delegate to it and use its result
        if (typeof window.savePlannerTripToProfileAndDatabase === 'function') {
            try {
                const result = await window.savePlannerTripToProfileAndDatabase(tripData);
                if (result && typeof result === 'object') {
                    if (result.server === true) {
                        showSuccess('Trip saved to server successfully!');
                    } else if (result.server === false) {
                        showSuccess(result.message || 'Trip saved locally (server failed).');
                    } else {
                        // Unknown shape, fallback
                        showSuccess('Trip saved.');
                    }
                    return;
                }
            } catch (delegErr) {
                console.warn('Delegated save threw error, falling back to internal save:', delegErr);
            }
        }

        // Save to database (fallback)
        saveToDatabase(user, tripData, itinerary);
    }
    
    // Save to database
    async function saveToDatabase(user, tripData, itinerary) {
        try {
            console.log('🔄 Saving to database...');
            
            // Use user.id if available, otherwise use email
            const userId = user.id || user.email;
            
            const country = tripData.countryLabel || tripData.country || 'Custom';
           const response = await fetch('http://localhost:3000/api/trips', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        user_id: userId,
        trip_name: tripData.title,
        country: country,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        days_count: tripData.days,
        itinerary: itinerary           // 🔹 send full days + activities
    })
});



            
            if (!response.ok) {
                let errorText = '';
                try {
                    const errorData = await response.json();
                    errorText = errorData.error || JSON.stringify(errorData);
                    console.error('❌ Database error:', response.status, response.statusText, errorData);
                } catch (e) {
                    errorText = response.statusText || 'Unknown error';
                    console.error('❌ Database error and could not parse body:', e);
                }

                // Fallback: save locally so user doesn't lose work
                try {
                    const fallbackId = tripData.id || generateTripId();
                    tripData.id = fallbackId;
                    window.currentTripId = fallbackId;

                    const itineraryKey = 'itinerary:' + fallbackId;
                    localStorage.setItem(itineraryKey, JSON.stringify(itinerary));
                    console.warn('Saved itinerary locally (server failed) as', itineraryKey);

                    // Update trips list in localStorage
                    try {
                        const tripsKey = 'tripwise:trips:' + (user.email || user.id);
                        let trips = [];
                        const existingData = localStorage.getItem(tripsKey);
                        if (existingData) trips = JSON.parse(existingData);
                        const existingIndex = trips.findIndex(t => String(t.id) === String(fallbackId));
                        const summary = Object.assign({}, tripData, { lastUpdated: new Date().toISOString(), localOnly: true });
                        if (existingIndex >= 0) trips[existingIndex] = summary; else trips.push(summary);
                        localStorage.setItem(tripsKey, JSON.stringify(trips));
                    } catch (e) {
                        console.warn('Could not update trips list (fallback):', e);
                    }

                    // Update URL
                    const params = new URLSearchParams(window.location.search);
                    if (!params.get('tripId')) {
                        params.set('tripId', fallbackId);
                        const newUrl = window.location.pathname + '?' + params.toString();
                        window.history.replaceState({}, '', newUrl);
                    }

                    showSuccess('Trip saved locally (server save failed).');
                    console.log('🎉 Local fallback save completed.');
                    return;
                } catch (fallbackErr) {
                    console.error('Fallback local save failed:', fallbackErr);
                    alert('Failed to save trip: ' + (errorText || 'Unknown error'));
                    return;
                }
            }

           const result = await response.json();
           console.log('✅ Saved to database:', result);

// 🔴 IMPORTANT: align frontend ID with database ID
if (result && result.id) {
    tripData.id = result.id;          // use DB id
    window.currentTripId = result.id; // keep global in sync
}

// Save itinerary to localStorage as backup, but now under DB id
try {
    const itineraryKey = 'itinerary:' + tripData.id; // e.g. 'itinerary:6'
    localStorage.setItem(itineraryKey, JSON.stringify(itinerary));
    console.log('✅ Itinerary saved to localStorage as', itineraryKey);
} catch (e) {
    console.warn('⚠️ Could not save to localStorage:', e);
}

            // Save to user's trips list
            try {
                const tripsKey = 'tripwise:trips:' + user.email;
                let trips = [];
                
                const existingData = localStorage.getItem(tripsKey);
                if (existingData) {
                    trips = JSON.parse(existingData);
                }
                
                const existingIndex = trips.findIndex(t => t.id === tripData.id);
                if (existingIndex >= 0) {
                    trips[existingIndex] = tripData;
                    console.log('✅ Updated existing trip in list');
                } else {
                    trips.push(tripData);
                    console.log('✅ Added new trip to list');
                }
                
                localStorage.setItem(tripsKey, JSON.stringify(trips));
            } catch (e) {
                console.warn('⚠️ Could not update trips list:', e);
            }
            
            // Update UI
            const tripNameEl = document.getElementById('tripCountryName');
            if (tripNameEl) {
                tripNameEl.textContent = tripData.title;
            }
            
            // Update URL with trip ID
            const params = new URLSearchParams(window.location.search);
            if (!params.get('tripId')) {
                params.set('tripId', tripData.id);
                const newUrl = window.location.pathname + '?' + params.toString();
                window.history.replaceState({}, '', newUrl);
                console.log('✅ Updated URL with tripId');
            }
            
            // Show success message
            showSuccess('Trip saved successfully!');
            console.log('🎉 Save completed successfully!');
            
        } catch (error) {
            console.error('❌ Network error:', error);
            alert('Network error while saving trip. Please check your connection and try again.');
        }
    }
    
    // Helper: Generate unique trip ID
    function generateTripId() {
        return 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Helper: Show success notification
    function showSuccess(message) {
        // Try to use existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message);
            return;
        }
        
        // Try toast
        const toast = document.getElementById('toast');
        if (toast) {
            const messageEl = document.getElementById('toastMessage');
            if (messageEl) {
                messageEl.textContent = message;
            }
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
            return;
        }
        
        // Fallback to alert
        alert(message);
    }
    
    // Helper: Get current user (must exist from auth script)
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
    
    console.log('✅ Save button fix loaded');
})();
