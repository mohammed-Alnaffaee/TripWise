/**
 * Enhanced Save Handler with Custom Modal
 * - Replaces prompt() with custom styled modal
 * - Reuses same localStorage logic as existing code
 * - Drop-in replacement for REAL_FIX.js save functionality
 */

(function() {
    'use strict';
    
    console.log('🔧 Loading enhanced save handler with custom modal...');
    
    // Wait for DOM and other scripts to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSaveButton);
    } else {
        // DOM already loaded, wait for other scripts
        setTimeout(initSaveButton, 1000);
    }
    
    function initSaveButton() {
        console.log('🚀 Initializing save button with custom modal...');
        
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
        
        console.log('✅ Save button ready with custom modal!');
    }
    
    // Single unified save handler with custom modal
    function handleSaveClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('💾 Save button clicked');
        
        // Check if user is logged in
        const user = getCurrentUser();
        if (!user || !user.email) {
            showError('You must be logged in to save trips');
            console.error('❌ No user logged in');
            return;
        }
        
        console.log('✅ User authenticated:', user.email);
        
        // Check if itinerary exists
        if (typeof itinerary === 'undefined' || !itinerary || itinerary.length === 0) {
            showError('Please add at least one day to your trip before saving');
            console.error('❌ No itinerary to save');
            return;
        }
        
        console.log('✅ Itinerary exists:', itinerary.length, 'days');
        
        // Get or create trip ID and name
        let tripId = window.currentTripId;
        let tripName = window.currentTripName;
        
        if (!tripId) {
            // New trip - show custom modal to ask for name
            const params = new URLSearchParams(window.location.search);
            const countryLabel = params.get('countryLabel') || params.get('country') || 'Custom';
            const defaultName = countryLabel + ' Trip';
            
            // Use custom modal instead of prompt
            showTripNameModal(defaultName, (enteredName) => {
                // User saved with a name
                tripName = enteredName.trim();
                tripId = generateTripId();
                
                // Store globally
                window.currentTripId = tripId;
                window.currentTripName = tripName;
                
                console.log('✅ New trip created:', tripId, tripName);
                
                // Continue with save
                proceedWithSave(user, tripId, tripName);
            }, () => {
                // User cancelled
                console.log('❌ User cancelled trip name modal');
            });
            
            return; // Exit here, save will continue in callback
        }
        
        // Existing trip - save directly
        proceedWithSave(user, tripId, tripName);
    }
    
    // Proceed with save after getting trip name
    function proceedWithSave(user, tripId, tripName) {
        // Build trip data
        const params = new URLSearchParams(window.location.search);
        
        let startDate = params.get('startDate') || '';
        let endDate = params.get('endDate') || '';
        
        // Get dates from itinerary if not in URL
        if ((!startDate || !endDate) && itinerary.length > 0) {
            startDate = startDate || itinerary[0].date || '';
            endDate = endDate || itinerary[itinerary.length - 1].date || '';
        }
        
       // Decide country + label
let country = (params.get('country') || '').toLowerCase();
let countryLabel = params.get('countryLabel') || '';

// Special case: japan-custom-plan opened from "Customize This Plan"
const path = window.location.pathname.toLowerCase();
const mode = params.get('mode');

if (!country) {
    if (path.includes('japan-custom-plan') || mode === 'japan') {
        country = 'japan';
        if (!countryLabel) countryLabel = 'Japan';
    }
}

// Default label if still empty
if (!countryLabel) {
    if (country === 'japan') countryLabel = 'Japan';
    else countryLabel = 'Custom';
}

const tripData = {
    id: tripId,
    title: tripName,
    country: country,
    countryLabel: countryLabel,
    startDate: startDate,
    endDate: endDate,
    days: itinerary.length,
    lastUpdated: new Date().toISOString()
};



        
        console.log('📦 Trip data prepared:', tripData);
        
        // Save to database
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
                    itinerary: itinerary
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Database error:', errorData);
                showError('Failed to save trip: ' + (errorData.error || 'Unknown error'));
                return;
            }
            
            const result = await response.json();
            console.log('✅ Saved to database:', result);
            
            // Update frontend ID with database ID
            if (result && result.id) {
                tripData.id = result.id;
                window.currentTripId = result.id;
            }
            
            // Save itinerary to localStorage
            try {
                const itineraryKey = 'itinerary:' + tripData.id;
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
                
                const existingIndex = trips.findIndex(t => String(t.id) === String(tripData.id));
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
            showError('Network error while saving trip. Please check your connection and try again.');
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
        
        // Try showToast (from japan-custom-plan.js)
        if (typeof showToast === 'function') {
            showToast(message);
            return;
        }
        
        // Try toast element
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
    
    // Helper: Show error message
    function showError(message) {
        // Try existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message, 'error');
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
    
    console.log('✅ Enhanced save handler with custom modal loaded');
})();
