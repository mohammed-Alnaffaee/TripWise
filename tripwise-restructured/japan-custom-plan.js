// ===== Japan Custom Plan - Complete 10-Day Itinerary with Links =====

// Global State
let map = null;
let markers = [];
let routePolyline = null;
let itinerary = [];
let currentActiveDayIndex = null;
let editingDayIndex = null;
let editingActivityIndex = null;
// Track current Japan trip (so we only ask for the name once per page)
let japanTripId = null;
let japanTripName = null;
let pendingDeleteDayIndex = null;



// Complete Japan 10-day itinerary with ALL activities and links
const originalJapanItinerary = [
    {
        day: 1,
        date: '2025-11-10',
        title: 'Arrival in Tokyo',
        city: 'Tokyo',
        lat: 35.6762,
        lng: 139.6503,
        activities: [
            {
                type: 'Hotel',
                name: 'Airport Arrival & Hotel Check-in',
                startTime: '10:00',
                endTime: '14:00',
                location: 'Shibuya District, Tokyo',
                link: 'https://maps.google.com/search/Shibuya+Tokyo',
                description: 'Arrive at Narita Airport, meet your guide, and transfer to your hotel in Shibuya. Rest and freshen up after your journey.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.6595,
                lng: 139.7004
            },
            {
                type: 'Activity',
                name: 'Shibuya Crossing Experience',
                startTime: '16:00',
                endTime: '18:00',
                location: 'Shibuya Crossing, Tokyo',
                link: 'https://maps.google.com/search/Shibuya+Crossing+Tokyo',
                description: 'Experience the world\'s busiest pedestrian crossing and explore the vibrant Shibuya district with its neon lights and bustling atmosphere.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.6595,
                lng: 139.7004
            },
            {
                type: 'Food',
                name: 'Welcome Dinner',
                startTime: '19:00',
                endTime: '21:00',
                location: 'Local Izakaya, Shibuya',
                link: 'https://maps.google.com/search/Izakaya+Shibuya+Tokyo',
                description: 'Traditional Japanese welcome dinner at a local izakaya, featuring authentic dishes and sake tasting.',
                budget: 'Paid',
                price: 5000,
                currency: 'JPY',
                lat: 35.6595,
                lng: 139.6983
            }
        ]
    },
    {
        day: 2,
        date: '2025-11-11',
        title: 'Traditional Tokyo',
        city: 'Tokyo',
        lat: 35.6762,
        lng: 139.6503,
        activities: [
            {
                type: 'Activity',
                name: 'Senso-ji Temple Visit',
                startTime: '09:00',
                endTime: '11:00',
                location: 'Asakusa, Tokyo',
                link: 'https://maps.google.com/search/Senso-ji+Temple+Asakusa+Tokyo',
                description: 'Visit Tokyo\'s oldest temple, explore the traditional Nakamise shopping street, and witness morning prayers.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.7148,
                lng: 139.7967
            },
            {
                type: 'Activity',
                name: 'Imperial Palace Gardens',
                startTime: '13:00',
                endTime: '15:00',
                location: 'Imperial Palace, Tokyo',
                link: 'https://maps.google.com/search/Imperial+Palace+East+Gardens+Tokyo',
                description: 'Stroll through the serene East Gardens of the Imperial Palace, enjoying traditional Japanese landscaping and seasonal flowers.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.6852,
                lng: 139.7528
            },
            {
                type: 'Food',
                name: 'Tsukiji Outer Market',
                startTime: '16:00',
                endTime: '18:00',
                location: 'Tsukiji, Tokyo',
                link: 'https://maps.google.com/search/Tsukiji+Outer+Market+Tokyo',
                description: 'Explore the famous fish market, sample fresh sushi, and experience the bustling atmosphere of Tokyo\'s food culture.',
                budget: 'Paid',
                price: 3000,
                currency: 'JPY',
                lat: 35.6654,
                lng: 139.7707
            }
        ]
    },
    {
        day: 3,
        date: '2025-11-12',
        title: 'Modern Tokyo & Pop Culture',
        city: 'Tokyo',
        lat: 35.6762,
        lng: 139.6503,
        activities: [
            {
                type: 'Activity',
                name: 'Harajuku & Takeshita Street',
                startTime: '10:00',
                endTime: '12:00',
                location: 'Harajuku, Tokyo',
                link: 'https://maps.google.com/search/Takeshita+Street+Harajuku+Tokyo',
                description: 'Explore the epicenter of youth culture, fashion, and pop culture. Visit unique shops and experience Tokyo\'s creative side.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.6702,
                lng: 139.7026
            },
            {
                type: 'Activity',
                name: 'Akihabara Electric Town',
                startTime: '14:00',
                endTime: '16:00',
                location: 'Akihabara, Tokyo',
                link: 'https://maps.google.com/search/Akihabara+Electric+Town+Tokyo',
                description: 'Discover the world\'s largest electronics district, anime culture, and gaming centers. Perfect for tech enthusiasts!',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.6984,
                lng: 139.7731
            },
            {
                type: 'Activity',
                name: 'Tokyo Skytree',
                startTime: '18:00',
                endTime: '20:00',
                location: 'Sumida, Tokyo',
                link: 'https://maps.google.com/search/Tokyo+Skytree',
                description: 'Enjoy panoramic views of Tokyo from the world\'s second-tallest structure. Perfect for sunset and night city views.',
                budget: 'Paid',
                price: 2100,
                currency: 'JPY',
                lat: 35.7101,
                lng: 139.8107
            }
        ]
    },
    {
        day: 4,
        date: '2025-11-13',
        title: 'Mount Fuji Day Trip',
        city: 'Mount Fuji',
        lat: 35.3606,
        lng: 138.7274,
        activities: [
            {
                type: 'Activity',
                name: 'Mount Fuji 5th Station',
                startTime: '09:00',
                endTime: '12:00',
                location: 'Mount Fuji, Japan',
                link: 'https://maps.google.com/search/Mount+Fuji+5th+Station',
                description: 'Visit the 5th Station of Mount Fuji for breathtaking views of Japan\'s iconic mountain and surrounding landscapes.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.3606,
                lng: 138.7274
            },
            {
                type: 'Activity',
                name: 'Lake Kawaguchi',
                startTime: '13:00',
                endTime: '15:00',
                location: 'Kawaguchi Lake, Japan',
                link: 'https://maps.google.com/search/Lake+Kawaguchi+Japan',
                description: 'Enjoy the serene beauty of Lake Kawaguchi with perfect reflections of Mount Fuji on clear days.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.5111,
                lng: 138.7640
            },
            {
                type: 'Activity',
                name: 'Onsen Experience',
                startTime: '16:00',
                endTime: '18:00',
                location: 'Fuji Five Lakes Area',
                link: 'https://maps.google.com/search/Onsen+Mount+Fuji+area',
                description: 'Relax in traditional Japanese hot springs with views of Mount Fuji. A quintessential Japanese experience.',
                budget: 'Paid',
                price: 2000,
                currency: 'JPY',
                lat: 35.5111,
                lng: 138.7640
            }
        ]
    },
    {
        day: 5,
        date: '2025-11-14',
        title: 'Travel to Kyoto',
        city: 'Kyoto',
        lat: 35.0116,
        lng: 135.7681,
        activities: [
            {
                type: 'Flight',
                name: 'Shinkansen Bullet Train',
                startTime: '09:00',
                endTime: '12:00',
                location: 'Tokyo to Kyoto',
                link: 'https://maps.google.com/search/Tokyo+Station+to+Kyoto+Station',
                description: 'Experience Japan\'s famous bullet train from Tokyo to Kyoto. Enjoy the scenic journey and Japanese efficiency.',
                budget: 'Paid',
                price: 13320,
                currency: 'JPY',
                lat: 35.0116,
                lng: 135.7681
            },
            {
                type: 'Hotel',
                name: 'Ryokan Check-in',
                startTime: '13:00',
                endTime: '15:00',
                location: 'Gion District, Kyoto',
                link: 'https://maps.google.com/search/Traditional+Ryokan+Kyoto',
                description: 'Check into a traditional Japanese inn (ryokan) and experience authentic hospitality with tatami mats and futon beds.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.0036,
                lng: 135.7751
            },
            {
                type: 'Activity',
                name: 'Gion District Evening Walk',
                startTime: '17:00',
                endTime: '19:00',
                location: 'Gion District, Kyoto',
                link: 'https://maps.google.com/search/Gion+District+Kyoto',
                description: 'Stroll through Kyoto\'s famous geisha district, with its traditional wooden buildings and lantern-lit streets.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.0036,
                lng: 135.7751
            }
        ]
    },
    {
        day: 6,
        date: '2025-11-15',
        title: 'Golden Kyoto',
        city: 'Kyoto',
        lat: 35.0394,
        lng: 135.7292,
        activities: [
            {
                type: 'Activity',
                name: 'Kinkaku-ji Golden Pavilion',
                startTime: '08:00',
                endTime: '10:00',
                location: 'Kinkaku-ji, Kyoto',
                link: 'https://maps.google.com/search/Kinkaku-ji+Golden+Pavilion+Kyoto',
                description: 'Visit Kyoto\'s most famous temple, covered in gold leaf and reflected in a tranquil pond surrounded by gardens.',
                budget: 'Paid',
                price: 500,
                currency: 'JPY',
                lat: 35.0394,
                lng: 135.7292
            },
            {
                type: 'Activity',
                name: 'Arashiyama Bamboo Grove',
                startTime: '11:00',
                endTime: '13:00',
                location: 'Arashiyama, Kyoto',
                link: 'https://maps.google.com/search/Arashiyama+Bamboo+Grove+Kyoto',
                description: 'Walk through the enchanting bamboo forest where towering bamboo creates a natural green tunnel with filtered sunlight.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 35.0170,
                lng: 135.6727
            },
            {
                type: 'Activity',
                name: 'Tenryu-ji Temple',
                startTime: '14:00',
                endTime: '16:00',
                location: 'Arashiyama, Kyoto',
                link: 'https://maps.google.com/search/Tenryu-ji+Temple+Kyoto',
                description: 'Explore this UNESCO World Heritage Zen temple with its famous landscape garden designed for meditation.',
                budget: 'Paid',
                price: 600,
                currency: 'JPY',
                lat: 35.0156,
                lng: 135.6737
            }
        ]
    },
    {
        day: 7,
        date: '2025-11-16',
        title: 'Spiritual Kyoto',
        city: 'Kyoto',
        lat: 34.9671,
        lng: 135.7727,
        activities: [
            {
                type: 'Activity',
                name: 'Fushimi Inari Shrine',
                startTime: '08:00',
                endTime: '11:00',
                location: 'Fushimi Inari, Kyoto',
                link: 'https://maps.google.com/search/Fushimi+Inari+Shrine+Kyoto',
                description: 'Hike through thousands of vermillion torii gates that create tunnels up the mountainside at this iconic shrine.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 34.9671,
                lng: 135.7727
            },
            {
                type: 'Activity',
                name: 'Kiyomizu-dera Temple',
                startTime: '13:00',
                endTime: '15:00',
                location: 'Higashiyama, Kyoto',
                link: 'https://maps.google.com/search/Kiyomizu-dera+Temple+Kyoto',
                description: 'Visit this wooden temple offering panoramic views of Kyoto. Famous for its wooden stage that juts out 13 meters above the hillside.',
                budget: 'Paid',
                price: 400,
                currency: 'JPY',
                lat: 34.9948,
                lng: 135.7850
            },
            {
                type: 'Activity',
                name: 'Traditional Tea Ceremony',
                startTime: '16:00',
                endTime: '17:30',
                location: 'Gion District, Kyoto',
                link: 'https://maps.google.com/search/Tea+Ceremony+Kyoto',
                description: 'Participate in an authentic Japanese tea ceremony and learn about the philosophy and aesthetics of this ancient art.',
                budget: 'Paid',
                price: 3500,
                currency: 'JPY',
                lat: 35.0036,
                lng: 135.7751
            }
        ]
    },
    {
        day: 8,
        date: '2025-11-17',
        title: 'Travel to Osaka',
        city: 'Osaka',
        lat: 34.6937,
        lng: 135.5023,
        activities: [
            {
                type: 'Flight',
                name: 'Travel to Osaka',
                startTime: '10:00',
                endTime: '11:30',
                location: 'Kyoto to Osaka',
                link: 'https://maps.google.com/search/Kyoto+to+Osaka+train',
                description: 'Take the express train from Kyoto to Osaka, Japan\'s culinary capital and vibrant economic hub.',
                budget: 'Paid',
                price: 560,
                currency: 'JPY',
                lat: 34.6937,
                lng: 135.5023
            },
            {
                type: 'Activity',
                name: 'Osaka Castle',
                startTime: '13:00',
                endTime: '15:00',
                location: 'Osaka Castle, Osaka',
                link: 'https://maps.google.com/search/Osaka+Castle',
                description: 'Explore one of Japan\'s most famous castles, rebuilt in 1931, with excellent views of the city from the top floor.',
                budget: 'Paid',
                price: 600,
                currency: 'JPY',
                lat: 34.6873,
                lng: 135.5262
            },
            {
                type: 'Food',
                name: 'Dotonbori Food Adventure',
                startTime: '18:00',
                endTime: '21:00',
                location: 'Dotonbori, Osaka',
                link: 'https://maps.google.com/search/Dotonbori+Osaka',
                description: 'Experience Osaka\'s famous food scene in the neon-lit Dotonbori district. Try takoyaki, okonomiyaki, and other local specialties.',
                budget: 'Paid',
                price: 4000,
                currency: 'JPY',
                lat: 34.6688,
                lng: 135.5020
            }
        ]
    },
    {
        day: 9,
        date: '2025-11-18',
        title: 'Universal Studios Japan',
        city: 'Osaka',
        lat: 34.6657,
        lng: 135.4326,
        activities: [
            {
                type: 'Activity',
                name: 'Wizarding World of Harry Potter',
                startTime: '09:00',
                endTime: '12:00',
                location: 'Universal Studios Japan',
                link: 'https://maps.google.com/search/Universal+Studios+Japan+Osaka',
                description: 'Enter the magical world of Hogwarts with authentic recreations of famous locations and thrilling rides.',
                budget: 'Paid',
                price: 8900,
                currency: 'JPY',
                lat: 34.6657,
                lng: 135.4326
            },
            {
                type: 'Activity',
                name: 'Nintendo World',
                startTime: '13:00',
                endTime: '16:00',
                location: 'Nintendo World, USJ',
                link: 'https://maps.google.com/search/Nintendo+World+Universal+Studios+Japan',
                description: 'Explore the colorful world of Super Mario and Nintendo characters with interactive attractions and games.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 34.6657,
                lng: 135.4326
            },
            {
                type: 'Activity',
                name: 'Souvenir Shopping',
                startTime: '17:00',
                endTime: '19:00',
                location: 'Shinsaibashi, Osaka',
                link: 'https://maps.google.com/search/Shinsaibashi+Shopping+Osaka',
                description: 'Browse unique Japanese souvenirs, anime merchandise, and local crafts to take home memories of your trip.',
                budget: 'Paid',
                price: 5000,
                currency: 'JPY',
                lat: 34.6730,
                lng: 135.5019
            }
        ]
    },
    {
        day: 10,
        date: '2025-11-19',
        title: 'Departure',
        city: 'Osaka',
        lat: 34.4347,
        lng: 135.2442,
        activities: [
            {
                type: 'Hotel',
                name: 'Hotel Check-out',
                startTime: '10:00',
                endTime: '11:00',
                location: 'Hotel in Osaka',
                link: 'https://maps.google.com/search/Osaka+Hotels',
                description: 'Pack your memories and check out from your hotel. Our team will assist with luggage and transportation arrangements.',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 34.6937,
                lng: 135.5023
            },
            {
                type: 'Flight',
                name: 'Airport Transfer',
                startTime: '12:00',
                endTime: '14:00',
                location: 'Kansai International Airport',
                link: 'https://maps.google.com/search/Kansai+International+Airport',
                description: 'Comfortable transfer to Kansai International Airport for your departure flight. End of an unforgettable Japanese adventure!',
                budget: 'Free',
                price: 0,
                currency: 'JPY',
                lat: 34.4347,
                lng: 135.2442
            }
        ]
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const country = (params.get('country') || 'japan').toLowerCase();
    const countryLabel = params.get('countryLabel') || (country === 'malaysia' ? 'Malaysia' : 'Japan');

    // تحديث عنوان الـ Sidebar حسب البلد
    const titleSpan = document.getElementById('plannerCountryTitle');
    if (titleSpan) {
        titleSpan.textContent = countryLabel + ' Adventure';
    }

    // نخزّن البلد عالمياً لو احتجناه في الحفظ
    window.currentCountry = country;
    window.currentCountryLabel = countryLabel;

    initializeItinerary();
    initializeMap();
    renderDayList();
    setupEventListeners();
    updateBalance();
});


// Initialize itinerary from localStorage or use default
// Load itinerary for a specific tripId (from Profile) or fall back to old behavior
function initializeItinerary() {
    const params = new URLSearchParams(window.location.search);
    const tripIdFromUrl = params.get('tripId');
    const mode = params.get('mode');

    // 1) If opened from Profile: load itinerary:<tripId>
    if (tripIdFromUrl) {
        const itineraryKey = 'itinerary:' + tripIdFromUrl;
        const stored = localStorage.getItem(itineraryKey);

        if (stored) {
            try {
                itinerary = JSON.parse(stored);

                // Remember current trip so save-with-custom-modal knows it’s an existing trip
                window.currentTripId = tripIdFromUrl;
                window.currentTripName = params.get('countryLabel') || 'Japan Trip';

                // Keep old behavior in sync so "Customize This Plan" still works
                localStorage.setItem('japanCustomItinerary', JSON.stringify(itinerary));

                showToast('Loaded your saved Japan trip.');
                return; // IMPORTANT: stop here, we already loaded the trip
            } catch (e) {
                console.error('Error parsing itinerary for tripId', tripIdFromUrl, e);
            }
        }
    }

    // 1.5) If opened as a planner (from homepage/menu), start EMPTY
    if (mode === 'planner') {
        const savedPlanner = localStorage.getItem('japanCustomItinerary');
        if (savedPlanner) {
            try {
                itinerary = JSON.parse(savedPlanner);
                showToast('Welcome back! Your planned Japan trip has been loaded.');
            } catch (e) {
                console.error('Error parsing saved planner itinerary', e);
                itinerary = [];
            }
        } else {
            itinerary = [];
            showToast('Start planning your Japan trip by adding your first day.');
        }
        return;
    }

    // Show a small banner indicating which mode the UI is in
    try {
        const banner = document.getElementById('plannerModeBanner');
        if (banner) {
            if (mode === 'planner') {
                banner.textContent = 'Planner mode — empty/custom saved plan';
                banner.style.display = 'inline-block';
            } else if (mode === 'japan') {
                banner.textContent = 'Template mode — 10-day ready plan';
                banner.style.display = 'inline-block';
            } else {
                banner.style.display = 'none';
            }
        }
    } catch (e) {
        // ignore
    }

    // 2) Old behavior (when no tripId in URL and not in planner mode)
    const saved = localStorage.getItem('japanCustomItinerary');
    if (saved) {
        try {
            itinerary = JSON.parse(saved);
            showToast('Welcome back! Your customized plan has been loaded.');
        } catch (e) {
            itinerary = JSON.parse(JSON.stringify(originalJapanItinerary));
        }
    } else {
        itinerary = JSON.parse(JSON.stringify(originalJapanItinerary));
        showToast('Welcome! Complete 10-day Japan itinerary loaded.');
    }
}



// ===== Map Initialization =====
function initializeMap() {
    map = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true
    }).setView([36.5, 138.0], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 5
    }).addTo(map);
    
    setTimeout(() => {
        map.invalidateSize();
        updateMapMarkers();
    }, 100);
}

function updateMapMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    if (routePolyline) {
        map.removeLayer(routePolyline);
        routePolyline = null;
    }
    
    const cities = itinerary
        .filter(day => day.lat && day.lng && day.city)
        .reduce((acc, day) => {
            if (!acc[day.city]) {
                acc[day.city] = {
                    name: day.city,
                    lat: day.lat,
                    lng: day.lng,
                    days: []
                };
            }
            acc[day.city].days.push(day.day);
            return acc;
        }, {});
    
    const cityArray = Object.values(cities);
    
    cityArray.forEach((city) => {
        const marker = L.marker([city.lat, city.lng], {
            icon: L.divIcon({
                className: 'custom-city-marker',
                html: `<div style="
                    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); 
                    color: white; 
                    padding: 10px 16px; 
                    border-radius: 20px; 
                    font-weight: bold; 
                    font-size: 14px; 
                    border: 3px solid white; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
                    white-space: nowrap;
                    font-family: 'Inter', sans-serif;
                ">✈ ${city.name}</div>`,
                iconSize: [120, 40],
                iconAnchor: [60, 20]
            })
        }).addTo(map);
        
        const dayRange = city.days.length > 1 
            ? `Days ${Math.min(...city.days)}-${Math.max(...city.days)}`
            : `Day ${city.days[0]}`;
        
        marker.bindPopup(`
            <div style="min-width: 180px; font-family: 'Inter', sans-serif;">
                <h3 style="margin: 0 0 0.5rem 0; color: #1e40af; font-size: 1.1rem;">${city.name}</h3>
                <p style="margin: 0; font-size: 0.9rem; color: #64748b;">
                    <i class="fas fa-calendar"></i> ${dayRange}
                </p>
            </div>
        `);
        
        markers.push(marker);
    });
    
    if (cityArray.length > 1) {
        const routeCoords = cityArray.map(city => [city.lat, city.lng]);
        routePolyline = L.polyline(routeCoords, {
            color: '#f59e0b',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10',
            lineJoin: 'round'
        }).addTo(map);
        
        map.fitBounds(routePolyline.getBounds(), { 
            padding: [60, 60],
            maxZoom: 10
        });
    } else if (cityArray.length === 1) {
        map.setView([cityArray[0].lat, cityArray[0].lng], 10);
    }
}

// ===== Day List Rendering =====
function renderDayList() {
    const container = document.getElementById('dayListContainer');
    container.innerHTML = '';
    
    if (itinerary.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--medium-gray);">
                <i class="fas fa-calendar-plus" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p style="font-size: 1.1rem; font-weight: 600;">No days added yet</p>
                <p style="font-size: 0.9rem;">Click "Add Day" to start planning</p>
            </div>
        `;
        return;
    }
    
    itinerary.forEach((day, index) => {
        const dayElement = createDayElement(day, index);
        container.appendChild(dayElement);
    });
}

function createDayElement(day, index) {
    const dayItem = document.createElement('div');
    dayItem.className = 'day-item';
    
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    if (currentActiveDayIndex === index) {
        dayHeader.classList.add('active');
    }
    
    dayHeader.innerHTML = `
        <div class="day-number">${day.day}</div>
        <div class="day-info">
            <div class="day-title">${day.title}</div>
            <div class="day-summary">
                ${day.city || 'No location'} • ${day.activities.length} activities
            </div>
        </div>
        <div class="day-actions">
            <button class="btn-day-action btn-edit-day" data-index="${index}" title="Edit day">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-day-action btn-delete-day" data-index="${index}" title="Delete day">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    
    dayHeader.addEventListener('click', (e) => {
        if (e.target.closest('.btn-day-action')) return;
        toggleDay(index);
    });
    
    dayItem.appendChild(dayHeader);
    
    const activityList = document.createElement('div');
    activityList.className = 'activity-list';
    if (currentActiveDayIndex === index) {
        activityList.classList.add('expanded');
    }
    
    day.activities.forEach((activity, activityIndex) => {
        const activityElement = createCollapsibleActivityElement(activity, index, activityIndex);
        activityList.appendChild(activityElement);
    });
    
    dayItem.appendChild(activityList);
    
    if (currentActiveDayIndex === index) {
        const addActivitySection = document.createElement('div');
        addActivitySection.className = 'add-activity-section';
        addActivitySection.innerHTML = `
            <button class="btn-add-activity" data-day-index="${index}">
                <i class="fas fa-plus"></i>
                Add Activity
            </button>
        `;
        dayItem.appendChild(addActivitySection);
    }
    
    return dayItem;
}

function createCollapsibleActivityElement(activity, dayIndex, activityIndex) {
    const activityItem = document.createElement('div');
    activityItem.className = 'collapsible-activity';
    activityItem.dataset.dayIndex = dayIndex;
    activityItem.dataset.activityIndex = activityIndex;
    
    const timeRange = activity.startTime && activity.endTime 
        ? `${activity.startTime} - ${activity.endTime}` 
        : 'Time not set';
    
    const costDisplay = activity.budget === 'Paid' && activity.price 
        ? `${activity.currency || 'JPY'} ${activity.price.toLocaleString()}`
        : 'Free';
    
    activityItem.innerHTML = `
        <div class="activity-collapsed">
            <div class="activity-collapsed-left">
                <div class="activity-icon-small">
                    <i class="fas ${getIconForType(activity.type)}"></i>
                </div>
                <div class="activity-collapsed-info">
                    <div class="activity-time-small">
                        <i class="fas fa-clock"></i>
                        ${timeRange}
                    </div>
                    <div class="activity-name-large">${activity.name}</div>
                </div>
            </div>
            <div class="activity-collapsed-right">
                <span class="type-badge-small ${activity.type.replace(' ', '-')}">${activity.type}</span>
                <span class="activity-cost-small">${costDisplay}</span>
                <i class="fas fa-chevron-down activity-expand-icon"></i>
            </div>
        </div>
        <div class="activity-expanded" style="display: none;">
            ${activity.description ? `<div class="activity-description">${activity.description}</div>` : ''}
            ${activity.location ? `
                <div class="activity-location">
                    <i class="fas fa-map-pin"></i> ${activity.location}
                </div>
            ` : ''}
            ${activity.link ? `
                <div class="activity-map-link">
                    <a href="${activity.link}" target="_blank" class="map-link">
                        <i class="fas fa-external-link-alt"></i> View on Map
                    </a>
                </div>
            ` : ''}
            <div class="activity-actions-expanded">
                <button class="btn-activity-action-expanded btn-edit" data-day-index="${dayIndex}" data-activity-index="${activityIndex}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-activity-action-expanded btn-delete" data-day-index="${dayIndex}" data-activity-index="${activityIndex}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        </div>
    `;
    
    const collapsed = activityItem.querySelector('.activity-collapsed');
    collapsed.addEventListener('click', () => {
        activityItem.classList.toggle('expanded');
        const expanded = activityItem.querySelector('.activity-expanded');
        expanded.style.display = activityItem.classList.contains('expanded') ? 'block' : 'none';
    });
    
    return activityItem;
}

function getIconForType(type) {
    const icons = {
        'Activity': 'fa-map-marker-alt',
        'Hotel': 'fa-hotel',
        'Food': 'fa-utensils',
        'Car rent': 'fa-car',
        'Flight': 'fa-plane'
    };
    return icons[type] || 'fa-map-marker-alt';
}

function toggleDay(index) {
    if (currentActiveDayIndex === index) {
        currentActiveDayIndex = null;
    } else {
        currentActiveDayIndex = index;
        
        const day = itinerary[index];
        if (day.lat && day.lng) {
            map.setView([day.lat, day.lng], 11, { 
                animate: true,
                duration: 1
            });
        }
    }
    
    renderDayList();
}

// ===== Balance Calculator =====
function updateBalance() {
    const balanceContent = document.getElementById('balanceContent');
    
    const currencyTotals = {};
    
    itinerary.forEach(day => {
        day.activities.forEach(activity => {
            if (activity.budget === 'Paid' && activity.price) {
                const currency = activity.currency || 'JPY';
                if (!currencyTotals[currency]) {
                    currencyTotals[currency] = {
                        total: 0,
                        items: []
                    };
                }
                currencyTotals[currency].total += activity.price;
                currencyTotals[currency].items.push({
                    name: activity.name,
                    type: activity.type,
                    price: activity.price
                });
            }
        });
    });
    
    if (Object.keys(currencyTotals).length === 0) {
        balanceContent.innerHTML = `
            <div class="empty-balance-message">
                <i class="fas fa-calculator"></i>
                <h3>No Expenses Yet</h3>
                <p>Add paid activities to see your budget breakdown</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="balance-breakdown"><div class="balance-header"><h3>💰 Trip Budget</h3></div>';
    
    Object.keys(currencyTotals).forEach(currency => {
        const data = currencyTotals[currency];
        html += `
            <div class="currency-section">
                <div class="currency-header">
                    <span class="currency-name">${currency}</span>
                    <span class="currency-total">${data.total.toLocaleString()}</span>
                </div>
                <div class="balance-items">
        `;
        
        data.items.forEach(item => {
            html += `
                <div class="balance-item">
                    <div class="balance-item-info">
                        <div class="balance-item-icon">
                            <i class="fas ${getIconForType(item.type)}"></i>
                        </div>
                        <div>
                            <h4>${item.name}</h4>
                            <p>${item.type}</p>
                        </div>
                    </div>
                    <div class="balance-amount">${item.price.toLocaleString()}</div>
                </div>
            `;
        });
        
        html += '</div></div>';
    });
    
    html += `
        <div class="grand-total-section">
            <h3>📊 Grand Total</h3>
            <div class="grand-total-amounts">
    `;
    
    Object.keys(currencyTotals).forEach(currency => {
        html += `
            <div class="grand-total-item">
                <div class="grand-total-currency">${currency}</div>
                <div class="grand-total-amount">${currencyTotals[currency].total.toLocaleString()}</div>
            </div>
        `;
    });
    
    html += '</div></div></div>';
    
    balanceContent.innerHTML = html;
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
    document.getElementById('btnAddDay').addEventListener('click', openAddDayModal);
    document.getElementById('btnSavePlan').addEventListener('click', savePlan);
    document.getElementById('btnMobileMenu')?.addEventListener('click', toggleMobileSidebar);
    document.getElementById('btnCancelDay').addEventListener('click', closeDayModal);
    document.getElementById('formDay').addEventListener('submit', handleDaySubmit);
    document.getElementById('btnCancelActivity').addEventListener('click', closeActivityModal);
    document.getElementById('formActivity').addEventListener('submit', handleActivitySubmit);
    
    document.getElementById('tabRouteMap').addEventListener('click', () => switchTab('map'));
    document.getElementById('tabBalance').addEventListener('click', () => switchTab('balance'));
    
    document.querySelectorAll('input[name="budget"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('paidFields').style.display = 
                this.value === 'Paid' ? 'block' : 'none';
        });
    });
    
    document.getElementById('modalDay').addEventListener('click', function(e) {
        if (e.target === this) closeDayModal();
    });
    
    document.getElementById('modalActivity').addEventListener('click', function(e) {
        if (e.target === this) closeActivityModal();
    });
    
    document.getElementById('dayListContainer').addEventListener('click', function(e) {
        if (e.target.closest('.btn-edit-day')) {
            const index = parseInt(e.target.closest('.btn-edit-day').dataset.index);
            openEditDayModal(index);
        }
        
        if (e.target.closest('.btn-delete-day')) {
        const index = parseInt(e.target.closest('.btn-delete-day').dataset.index);
        openDeleteDayConfirm(index);   // بدلاً من deleteDay(index)
        }
        
        if (e.target.closest('.btn-add-activity')) {
            const dayIndex = parseInt(e.target.closest('.btn-add-activity').dataset.dayIndex);
            openAddActivityModal(dayIndex);
        }
        
        if (e.target.closest('.btn-edit')) {
            const btn = e.target.closest('.btn-edit');
            const dayIndex = parseInt(btn.dataset.dayIndex);
            const activityIndex = parseInt(btn.dataset.activityIndex);
            openEditActivityModal(dayIndex, activityIndex);
        }
        
        if (e.target.closest('.btn-delete')) {
            const btn = e.target.closest('.btn-delete');
            const dayIndex = parseInt(btn.dataset.dayIndex);
            const activityIndex = parseInt(btn.dataset.activityIndex);
            deleteActivity(dayIndex, activityIndex);
        }
    });
    
    updateMobileUI();
    window.addEventListener('resize', () => {
        updateMobileUI();
        if (map) {
            setTimeout(() => map.invalidateSize(), 100);
        }
    });
        const deleteModal = document.getElementById('deleteDayModal');
    const btnConfirmDeleteDay = document.getElementById('btnConfirmDeleteDay');
    const btnCancelDeleteDay = document.getElementById('btnCancelDeleteDay');

    if (btnConfirmDeleteDay) {
        btnConfirmDeleteDay.addEventListener('click', handleConfirmDeleteDay);
    }

    if (btnCancelDeleteDay) {
        btnCancelDeleteDay.addEventListener('click', closeDeleteDayConfirm);
    }

    if (deleteModal) {
        // إغلاق المودال إذا ضغطنا على الخلفية الداكنة
        deleteModal.addEventListener('click', function (e) {
            if (e.target === deleteModal) {
                closeDeleteDayConfirm();
            }
        });
    }

}

function switchTab(tab) {
    if (tab === 'map') {
        document.getElementById('tabRouteMap').classList.add('active');
        document.getElementById('tabBalance').classList.remove('active');
        document.getElementById('mapView').style.display = 'block';
        document.getElementById('balanceView').classList.remove('active');
        setTimeout(() => map.invalidateSize(), 100);
    } else {
        document.getElementById('tabRouteMap').classList.remove('active');
        document.getElementById('tabBalance').classList.add('active');
        document.getElementById('mapView').style.display = 'none';
        document.getElementById('balanceView').classList.add('active');
    }
}

function updateMobileUI() {
    const isMobile = window.innerWidth <= 768;
    const btn = document.getElementById('btnMobileMenu');
    if (btn) {
        btn.style.display = isMobile ? 'flex' : 'none';
    }
}

function toggleMobileSidebar() {
    document.getElementById('plannerSidebar').classList.toggle('mobile-open');
}

// ===== Day Operations =====
function openAddDayModal() {
    editingDayIndex = null;
    document.getElementById('modalDayTitle').textContent = 'Add New Day';
    document.getElementById('dayTitle').value = `Day ${itinerary.length + 1}`;
    document.getElementById('dayCity').value = '';
    document.getElementById('dayDate').value = '';
    document.getElementById('modalDay').classList.add('active');
}

function openEditDayModal(index) {
    editingDayIndex = index;
    const day = itinerary[index];
    document.getElementById('modalDayTitle').textContent = 'Edit Day';
    document.getElementById('dayTitle').value = day.title;
    document.getElementById('dayCity').value = day.city || '';
    document.getElementById('dayDate').value = day.date || '';
    document.getElementById('modalDay').classList.add('active');
}

function closeDayModal() {
    document.getElementById('modalDay').classList.remove('active');
    editingDayIndex = null;
}

async function handleDaySubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('dayTitle').value.trim();
    const city = document.getElementById('dayCity').value.trim();
    const date = document.getElementById('dayDate').value;
    
    if (!title) {
        alert('Please enter a day title');
        return;
    }
    
    let lat = null;
    let lng = null;
    
    if (city) {
        const coords = await geocodeCity(city);
        if (coords) {
            lat = coords.lat;
            lng = coords.lng;
        }
    }
    
    if (editingDayIndex !== null) {
        itinerary[editingDayIndex].title = title;
        itinerary[editingDayIndex].city = city;
        itinerary[editingDayIndex].date = date;
        itinerary[editingDayIndex].lat = lat;
        itinerary[editingDayIndex].lng = lng;
        showToast('✅ Day updated successfully!');
    } else {
        itinerary.push({
            day: itinerary.length + 1,
            date: date,
            title: title,
            city: city,
            activities: [],
            lat: lat,
            lng: lng
        });
        showToast('✅ Day added successfully!');
    }
    
    renderDayList();
    updateMapMarkers();
    savePlan();
    closeDayModal();
}

function deleteDay(index) {
    if (index < 0 || index >= itinerary.length) return;

    itinerary.splice(index, 1);

    // إعادة ترقيم الأيام
    itinerary.forEach((day, idx) => {
        day.day = idx + 1;
    });

    // تحديث اليوم النشط
    if (currentActiveDayIndex === index) {
        currentActiveDayIndex = null;
    } else if (currentActiveDayIndex > index) {
        currentActiveDayIndex--;
    }

    renderDayList();
    updateMapMarkers();
    updateBalance();
    savePlan();
    showToast('🗑️ Day deleted');
}

function openDeleteDayConfirm(index) {
    pendingDeleteDayIndex = index;

    const modal = document.getElementById('deleteDayModal');
    const titleEl = document.getElementById('deleteDayTitle');
    const messageEl = document.getElementById('deleteDayMessage');

    if (itinerary[index]) {
        if (titleEl) {
            titleEl.textContent = `Delete "${itinerary[index].title}"?`;
        }
        if (messageEl) {
            messageEl.textContent = 'Are you sure you want to delete this day? This action cannot be undone.';
        }
    }

    if (modal) {
        modal.classList.add('active'); // نفس الكلاس المستخدم مع باقي الـ modals
    }
}

function closeDeleteDayConfirm() {
    const modal = document.getElementById('deleteDayModal');
    if (modal) {
        modal.classList.remove('active');
    }
    pendingDeleteDayIndex = null;
}

function handleConfirmDeleteDay() {
    if (pendingDeleteDayIndex === null) return;

    deleteDay(pendingDeleteDayIndex);
    closeDeleteDayConfirm();
}


// ===== Activity Operations =====
function openAddActivityModal(dayIndex) {
    editingDayIndex = dayIndex;
    editingActivityIndex = null;
    document.getElementById('modalActivityTitle').textContent = 'Add Activity';
    document.getElementById('activityType').value = '';
    document.getElementById('activityName').value = '';
    document.getElementById('activityLocation').value = '';
    document.getElementById('activityLink').value = '';
    document.getElementById('activityDescription').value = '';
    document.getElementById('activityStartTime').value = '';
    document.getElementById('activityEndTime').value = '';
    document.querySelector('input[name="budget"][value="Free"]').checked = true;
    document.getElementById('paidFields').style.display = 'none';
    document.getElementById('activityPrice').value = '';
    document.getElementById('activityCurrency').value = 'JPY';
    document.getElementById('modalActivity').classList.add('active');
}

function openEditActivityModal(dayIndex, activityIndex) {
    editingDayIndex = dayIndex;
    editingActivityIndex = activityIndex;
    const activity = itinerary[dayIndex].activities[activityIndex];
    
    document.getElementById('modalActivityTitle').textContent = 'Edit Activity';
    document.getElementById('activityType').value = activity.type || '';
    document.getElementById('activityName').value = activity.name;
    document.getElementById('activityLocation').value = activity.location || '';
    document.getElementById('activityLink').value = activity.link || '';
    document.getElementById('activityDescription').value = activity.description || '';
    document.getElementById('activityStartTime').value = activity.startTime || '';
    document.getElementById('activityEndTime').value = activity.endTime || '';
    
    if (activity.budget === 'Paid') {
        document.querySelector('input[name="budget"][value="Paid"]').checked = true;
        document.getElementById('paidFields').style.display = 'block';
        document.getElementById('activityPrice').value = activity.price || '';
        document.getElementById('activityCurrency').value = activity.currency || 'JPY';
    } else {
        document.querySelector('input[name="budget"][value="Free"]').checked = true;
        document.getElementById('paidFields').style.display = 'none';
    }
    
    document.getElementById('modalActivity').classList.add('active');
}

function closeActivityModal() {
    document.getElementById('modalActivity').classList.remove('active');
    editingDayIndex = null;
    editingActivityIndex = null;
}

async function handleActivitySubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('activityType').value;
    const name = document.getElementById('activityName').value.trim();
    const location = document.getElementById('activityLocation').value.trim();
    const link = document.getElementById('activityLink').value.trim();
    const description = document.getElementById('activityDescription').value.trim();
    const startTime = document.getElementById('activityStartTime').value;
    const endTime = document.getElementById('activityEndTime').value;
    const budget = document.querySelector('input[name="budget"]:checked').value;
    const price = budget === 'Paid' ? parseFloat(document.getElementById('activityPrice').value) || 0 : 0;
    const currency = document.getElementById('activityCurrency').value;
    
    if (!type || !name || !startTime || !endTime) {
        alert('Please fill in all required fields');
        return;
    }
    
    let lat = null;
    let lng = null;
    
    if (location) {
        const coords = await geocodeCity(location);
        if (coords) {
            lat = coords.lat;
            lng = coords.lng;
        }
    }
    
    const activity = {
        type,
        name,
        startTime,
        endTime,
        location,
        link,
        description,
        budget,
        price,
        currency,
        lat,
        lng
    };
    
    if (editingActivityIndex !== null) {
        itinerary[editingDayIndex].activities[editingActivityIndex] = activity;
        showToast('✅ Activity updated!');
    } else {
        itinerary[editingDayIndex].activities.push(activity);
        showToast('✅ Activity added!');
    }
    
    renderDayList();
    updateMapMarkers();
    updateBalance();
    savePlan();
    closeActivityModal();
}

function deleteActivity(dayIndex, activityIndex) {
    if (confirm('Delete this activity?')) {
        itinerary[dayIndex].activities.splice(activityIndex, 1);
        renderDayList();
        updateMapMarkers();
        updateBalance();
        savePlan();
        showToast('🗑️ Activity deleted');
    }
}

// ===== Geocoding =====
async function geocodeCity(cityName) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (error) {
        console.error('Geocoding error:', error);
    }
    
    return null;
}

// =====================
// SAVE BUTTON (AUTO-SAVE ONLY)
// =====================

function savePlan() {
    // نحفظ الخطة في localStorage بصمت بدون أي أسئلة
    try {
        localStorage.setItem('japanCustomItinerary', JSON.stringify(itinerary));
    } catch (e) {
        console.error('Error auto-saving itinerary:', e);
    }
    // لا نسمي الرحلة هنا، ولا نحفظ في الـ DB
}

/**
 * Read logged-in user from localStorage (same data used by auth script)
 */
function getCurrentUserForJapan() {
    try {
        const raw = localStorage.getItem('currentUser'); // STORAGE_KEYS.CURRENT_USER
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error('Error reading currentUser from localStorage:', e);
        return null;
    }
}

/**
 * Ask for name, send trip to backend, and register it so it appears in Profile
 */
async function saveJapanTripToProfileAndDatabase() {
    const user = getCurrentUserForJapan();
    if (!user || (!user.id && !user.email)) {
        console.warn('No logged-in user → skip saving trip to profile/database');
        return;
    }

    if (!Array.isArray(itinerary) || itinerary.length === 0) {
        alert('Add at least one day before saving the trip to your profile.');
        return;
    }

    // Ask user for a trip name
    const defaultName = 'Japan Trip';
    const tripNameInput = prompt('Enter a name for this trip:', defaultName);
    if (!tripNameInput || tripNameInput.trim() === '') {
        // user cancelled
        return;
    }
    const tripName = tripNameInput.trim();

    // Infer start / end date from itinerary days
    let startDate = null;
    let endDate = null;
    try {
        startDate = itinerary[0].date || null;
        endDate = itinerary[itinerary.length - 1].date || null;
    } catch (e) {
        console.warn('Could not infer dates from itinerary:', e);
    }

    const today = new Date().toISOString().slice(0, 10);
    if (!startDate) startDate = today;
    if (!endDate) endDate = startDate;

    const userId = user.id || user.email;

    // Data sent to Node/Express (/api/trips) – your server.js already expects this shape
    const body = {
        user_id: userId,
        trip_name: tripName,
        country: 'Japan',
        start_date: startDate,
        end_date: endDate,
        days_count: itinerary.length,
        itinerary: itinerary       // will be stringified in server.js into itinerary_json
    };

    const response = await fetch('http://localhost:3000/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        console.error('Failed to save Japan trip to DB:', data);
        alert(data.error || 'Failed to save trip to your profile.');
        return;
    }

    console.log('✅ Japan trip saved in DB:', data);

    // Use the real DB id for everything else
    const dbId = String(data.id);

    // 1) Save full itinerary so trip-planner.html can open it with ?tripId=<id>
    try {
        const itineraryKey = 'itinerary:' + dbId;
        localStorage.setItem(itineraryKey, JSON.stringify(itinerary));
    } catch (e) {
        console.warn('Could not save itinerary for trip id', dbId, e);
    }

    // 2) Add / update trip summary used by Profile “Recent Trips”
    try {
        const tripsKey = 'tripwise:trips:' + (user.email || user.id);
        let trips = [];
        const existing = localStorage.getItem(tripsKey);
        if (existing) {
            trips = JSON.parse(existing);
        }

        const summary = {
            id: dbId,
            title: tripName,
            country: 'Japan',
            countryLabel: 'Japan',
            startDate,
            endDate,
            days: itinerary.length,
            lastUpdated: new Date().toISOString()
        };

        const idx = trips.findIndex(t => String(t.id) === dbId);
        if (idx >= 0) {
            trips[idx] = summary;
        } else {
            trips.push(summary);
        }

        localStorage.setItem(tripsKey, JSON.stringify(trips));
        console.log('✅ Japan trip registered in localStorage for profile.');
    } catch (e) {
        console.warn('Could not update trips list for profile:', e);
    }

    alert('Trip saved to your profile successfully!');
}

// Expose a canonical save function used by the global save button handler
if (typeof window !== 'undefined') {
    window.savePlannerTripToProfileAndDatabase = async function(tripData) {
        // We ignore the passed tripData for the Japan planner and use the local itinerary
        await saveJapanTripToProfileAndDatabase();
        return { saved: true, server: true, id: window.currentTripId || null, message: 'Saved' };
    };
}

// ===== Toast Notification =====
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
