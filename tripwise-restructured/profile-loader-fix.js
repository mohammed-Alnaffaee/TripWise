async function loadUserTripsFromDatabase() {
    const user = getCurrentUser();
    
    if (!user || !user.email) {
        console.warn('⚠️ No user logged in');
        return [];
    }
    
    // Use user.id if available, fallback to email
    const userId = user.id || user.email;
    
    try {
        console.log('🔄 Loading trips from database for user:', userId);
        
        const response = await fetch(`http://localhost:3000/api/trips/${userId}`);
        
        if (!response.ok) {
            console.error('❌ Failed to load trips:', response.status);
            throw new Error(`Failed to load trips: ${response.statusText}`);
        }
        
        const trips = await response.json();
        console.log(`✅ Loaded ${trips.length} trips from database`);
        
        // Transform database format to match expected format
        const transformedTrips = trips.map(trip => ({
            id: String(trip.id),
            title: trip.trip_name || 'Untitled Trip',
            country: trip.country,
            countryLabel: trip.country,
            startDate: trip.start_date,
            endDate: trip.end_date,
            days: trip.days_count,
            lastUpdated: trip.created_at || new Date().toISOString()
        }));
        
        // Also save to localStorage for offline access
        saveTripsToLocalStorage(transformedTrips);
        
        return transformedTrips;
        
    } catch (error) {
        console.error('❌ Error loading trips from database:', error);
        console.log('⚠️ Falling back to localStorage...');
        
        // Fallback to localStorage
        return getAllSavedTripsFromLocalStorage();
    }
}

/**
 * Fallback: Get trips from localStorage (original behavior)
 */
function getAllSavedTripsFromLocalStorage() {
    const user = getCurrentUser();
    if (!user || !user.email) {
        return [];
    }
    
    const tripsKey = 'tripwise:trips:' + user.email;
    const tripsData = localStorage.getItem(tripsKey);
    
    if (!tripsData) {
        return [];
    }
    
    try {
        const trips = JSON.parse(tripsData);
        return trips.sort((a, b) => {
            const dateA = new Date(a.lastUpdated || 0);
            const dateB = new Date(b.lastUpdated || 0);
            return dateA - dateB;
        });
    } catch (e) {
        console.error('Error parsing trips from localStorage:', e);
        return [];
    }
}

/**
 * Save trips to localStorage for offline access
 */
function saveTripsToLocalStorage(trips) {
    try {
        const user = getCurrentUser();
        if (!user || !user.email) return;
        
        const tripsKey = 'tripwise:trips:' + user.email;
        localStorage.setItem(tripsKey, JSON.stringify(trips));
        console.log('✅ Saved trips to localStorage for offline access');
        
    } catch (e) {
        console.warn('⚠️ Could not save trips to localStorage:', e);
    }
}

/**
 * Load recent trips and display them
 * REPLACES the original loadRecentTrips function
 */
// Get saved trips – try database first
let savedTrips = await loadUserTripsFromDatabase();

// If database is empty or failed, fall back to localStorage
if (!Array.isArray(savedTrips) || savedTrips.length === 0) {
    console.warn('⚠️ No trips from DB, using localStorage fallback');
    savedTrips = getAllSavedTripsFromLocalStorage();
}

// Still nothing? Show "No trips yet" message and stop
if (!savedTrips || savedTrips.length === 0) {
    tripsListEl.innerHTML = `
        <div class="no-trips">
            <i class="fas fa-suitcase-rolling"></i>
            <p>No trips yet</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">Start planning your first adventure!</p>
        </div>
    `;
    return;
}


/**
 * Initialize profile page with database loading
 */
async function initializeProfile() {
    console.log('🚀 Profile page initializing with database loader...');
    
    // Load user data
    if (typeof loadUserData === 'function') {
        loadUserData();
    }
    
    // Load trips from database
    await loadRecentTrips();
}

// Override DOMContentLoaded for profile page
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're on the profile page
    if (window.location.pathname.includes('profile.html')) {
        await initializeProfile();
    }
});

console.log('✅ Profile Loader Fix loaded successfully');