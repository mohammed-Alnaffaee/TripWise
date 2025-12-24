/**
 * Tripwise Authentication System - Complete Version
 * - Real Google Sign-In with GIS popup (auto_select: false)
 * - Email/password authentication (fallback only, no mock accounts)
 * - Questions modal after auth (budget + trip style)
 * - Site-wide action gating
 * - State persistence
 * - Orange + Blue theme, light overlay (0.4)
 * - Activity functionality with collapsible cards
 * - Balance calculator with multi-currency support
 * - Tab switching between map and balance views
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '133285987177-k6qknmgbovil3od5bcqo87mic80qv9lv.apps.googleusercontent.com';

// Enable real Google Sign-In
const USE_REAL_GOOGLE = true;

// LocalStorage keys
const STORAGE_KEYS = {
    IS_LOGGED_IN: 'isLoggedIn',
    CURRENT_USER: 'currentUser',
    USER_PREFERENCES: 'userPreferences'
};

// ============================================================================
// TRIP PLANNER GLOBAL VARIABLES
// ============================================================================

let map;
let markers = [];
let routePolyline = null;
let itinerary = [];
let currentDayIndex = null;
let currentActivityIndex = null;
let isEditMode = false;
let tripName = 'Trip Planner';
let defaultCurrency = 'USD';
let expandedActivityId = null; // Track which activity is expanded

// Country coordinates mapping
const countryCoordinates = {
    'India': [20.5937, 78.9629],
    'Japan': [36.2048, 138.2529],
    'USA': [37.0902, -95.7129],
    'France': [46.2276, 2.2137],
    'Germany': [51.1657, 10.4515],
    'Italy': [41.8719, 12.5674],
    'Spain': [40.4637, -3.7492],
    'UK': [55.3781, -3.4360],
    'Australia': [-25.2744, 133.7751],
    'Brazil': [-14.2350, -51.9253],
    'Canada': [56.1304, -106.3468],
    'China': [35.8617, 104.1954],
    'Mexico': [23.6345, -102.5528],
    'Thailand': [15.8700, 100.9925],
    'Turkey': [38.9637, 35.2433]
};

// Currency mapping for 15 countries
const countryCurrencies = {
    'saudi-arabia': { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
    'india': { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    'japan': { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    'malaysia': { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    'france': { code: 'EUR', symbol: '€', name: 'Euro' },
    'italy': { code: 'EUR', symbol: '€', name: 'Euro' },
    'united-states': { code: 'USD', symbol: '$', name: 'US Dollar' },
    'thailand': { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    'turkey': { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    'uae': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    'indonesia': { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    'spain': { code: 'EUR', symbol: '€', name: 'Euro' },
    'greece': { code: 'EUR', symbol: '€', name: 'Euro' },
    'morocco': { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
    'egypt': { code: 'EGP', symbol: '£', name: 'Egyptian Pound' }
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let pendingAction = null;
let questionsAnswers = {
    budget: null,
    tripStyles: []
};

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
}

/**
 * Get current user data
 */
function getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Save authentication state
 */
function saveAuthState(user) {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

/**
 * Save user preferences from questions
 */
function saveUserPreferences(preferences) {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    
    // Update user object with completed flag
    const user = getCurrentUser();
    if (user) {
        user.questionsCompleted = true;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
}

/**
 * Clear all auth data (logout)
 */
function clearAuthState() {
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
}

/**
 * Update UI based on auth state
 */
function updateAuthUI() {
    const loggedIn = isLoggedIn();
    document.body.classList.toggle('authenticated', loggedIn);
    
    // Update visibility of auth-only and guest-only elements
    document.querySelectorAll('.auth-only').forEach(el => {
        el.style.display = loggedIn ? 'block' : 'none';
        // For flex items (like buttons)
        if (el.classList.contains('login-btn') || el.tagName === 'BUTTON') {
            el.style.display = loggedIn ? 'flex' : 'none';
        }
    });
    
    document.querySelectorAll('.guest-only').forEach(el => {
        el.style.display = loggedIn ? 'none' : '';
    });
        // تحديث زر اسم المستخدم في الهيدر (الصفحة الرئيسية)
    const navUserNameEl = document.getElementById('navUserName');
    const navUserBtn = document.getElementById('navUserBtn');

    if (navUserNameEl && navUserBtn) {
        if (loggedIn) {
            const user = getCurrentUser();
            let label = 'Profile';

            if (user) {
                if (user.displayName)      label = user.displayName;
                else if (user.name)        label = user.name;
                else if (user.email)       label = user.email.split('@')[0];
            }

            navUserNameEl.textContent = label;
        } else {
            navUserNameEl.textContent = 'Profile';
        }
    }
    
}


// ============================================================================
// GOOGLE SIGN-IN
// ============================================================================

/**
 * Load Google Identity Services script
 */
function loadGoogleScript() {
    return new Promise((resolve, reject) => {
        if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Initialize real Google Sign-In
 */
function initRealGoogleSignIn() {
    if (typeof google === 'undefined' || !google.accounts) {
        console.error('Google Identity Services not loaded');
        return;
    }
    
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false
    });
}

/**
 * Handle Google credential response
 */
function handleGoogleCredentialResponse(response) {
    try {
        // Decode JWT token to get user info
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const userData = JSON.parse(jsonPayload);
        
        // Save user data
        const user = {
            name: userData.name,
            email: userData.email,
            picture: userData.picture,
            questionsCompleted: false
        };
        
        handleSuccessfulLogin(user);
        
    } catch (error) {
        console.error('Error processing Google credential:', error);
        showError('Failed to process Google sign-in', 'login');
    }
}

/**
 * Show Google Sign-In popup
 */
function showGoogleSignIn() {
    if (USE_REAL_GOOGLE && typeof google !== 'undefined' && google.accounts) {
        // Use real Google account picker
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                console.log('Google Sign-In prompt not shown - please use email/password');
            }
        });
    } else {
        console.log('Google Sign-In not available - please use email/password');
    }
}

// ============================================================================
// MODAL MANAGEMENT
// ============================================================================

/**
 * Create and inject auth modal into page
 */
function createAuthModal(modalType = 'login') {
    const isSignup = modalType === 'signup';
    
    const modalHTML = `
        <div class="auth-modal-overlay">
            <div class="auth-modal-content">
                <!-- Left Panel: Brand with Nature Photo -->
                <div class="auth-left-panel ${isSignup ? 'signup-panel' : ''}">
                    <div class="logo">
                        <i class="fas fa-plane-departure"></i>
                        <span>Tripwise</span>
                    </div>
                    <h2>${isSignup ? 'Sign up' : 'Welcome back'}</h2>
                    <p>${isSignup ? 'Start planning your perfect trip with AI-powered recommendations.' : 'Plan your perfect trip with personalized recommendations.'}</p>
                    ${isSignup ? '<div class="limited-offer"> Limited time offer: Save on your next adventure!</div>' : ''}
                </div>
                
                <!-- Right Panel: Auth Forms -->
                <div class="auth-right-panel">
                    <button class="auth-close-btn" onclick="closeAuthModal()">&times;</button>
                    
                    <!-- Login Form -->
                    <div id="loginForm" class="auth-form-container" style="display: ${!isSignup ? 'block' : 'none'}">
                        <h3>Log in</h3>
                        <p class="form-subtitle">Welcome back! Please enter your details.</p>
                        
                        <div class="auth-error" id="loginError"></div>
                        
                        <button class="google-signin-btn" onclick="showGoogleSignIn()">
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=" alt="Google">
                            Continue with Google
                        </button>
                        
                        <div class="auth-divider">or</div>
                        
                        <form onsubmit="handleEmailLogin(event)">
                            <div class="auth-form-group">
                                <label for="loginEmail">Email</label>
                                <input type="email" id="loginEmail" placeholder="Enter your email" required>
                            </div>
                            
                            <div class="auth-form-group">
                                <label for="loginPassword">Password</label>
                                <input type="password" id="loginPassword" placeholder="Enter your password" required minlength="6">
                            </div>
                            
                            <button type="submit" class="auth-submit-btn">Log in</button>
                        </form>
                        
                        <div class="auth-switch">
                            Don't have an account? <a onclick="showSignup()">Sign up</a>
                        </div>
                    </div>
                    
                    <!-- Signup Form -->
                    <div id="signupForm" class="auth-form-container" style="display: ${isSignup ? 'block' : 'none'}">
                        <h3>Sign up</h3>
                        <p class="form-subtitle">Create your account to start planning.</p>
                        
                        <div class="auth-error" id="signupError"></div>
                        
                        <button class="google-signin-btn" onclick="showGoogleSignIn()">
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=" alt="Google">
                            Sign up with Google
                        </button>
                        
                        <div class="auth-divider">or</div>
                        
                        <form onsubmit="handleEmailSignup(event)">
                            <div class="auth-form-group">
                                <label for="signupFirstName">First Name</label>
                                <input type="text" id="signupFirstName" placeholder="Enter your first name" required>
                            </div>
                            
                            <div class="auth-form-group">
                                <label for="signupLastName">Last Name</label>
                                <input type="text" id="signupLastName" placeholder="Enter your last name" required>
                            </div>
                            
                            <div class="auth-form-group">
                                <label for="signupEmail">Email</label>
                                <input type="email" id="signupEmail" placeholder="Enter your email" required>
                            </div>
                            
                            <div class="auth-form-group">
                                <label for="signupPassword">Password</label>
                                <input type="password" id="signupPassword" placeholder="Create a password (min 6 characters)" required minlength="6">
                            </div>
                            
                            <button type="submit" class="auth-submit-btn">Sign up</button>
                        </form>
                        
                        <div class="auth-switch">
                            Already have an account? <a onclick="showLogin()">Log in</a>
                        </div>
                    </div>
                    
                    <!-- Questions Modal -->
                    <div id="questionsForm" class="questions-container" style="display: none;">
                        <h3>Help us personalize your experience</h3>
                        <p class="subtitle">Answer a few quick questions to get better recommendations</p>
                        
                        <form onsubmit="handleQuestionsSubmit(event)">
                            <!-- Budget Question -->
                            <div class="question-group">
                                <label class="question-label">What's your travel budget?</label>
                                <div class="budget-options">
                                    <button type="button" class="budget-btn" onclick="selectBudget('budget-friendly')">Budget-Friendly</button>
                                    <button type="button" class="budget-btn" onclick="selectBudget('medium')">Medium</button>
                                    <button type="button" class="budget-btn" onclick="selectBudget('luxury')">Luxury</button>
                                </div>
                            </div>
                            
                            <!-- Trip Style Question -->
                            <div class="question-group">
                                <label class="question-label">What type of trips do you prefer? (Select all that apply)</label>
                                <div class="trip-style-options">
                                    <div class="style-checkbox">
                                        <input type="checkbox" id="style-nature" value="nature">
                                        <label for="style-nature"> Nature</label>
                                    </div>
                                    <div class="style-checkbox">
                                        <input type="checkbox" id="style-city" value="city">
                                        <label for="style-city"> City</label>
                                    </div>
                                    <div class="style-checkbox">
                                        <input type="checkbox" id="style-adventure" value="adventure">
                                        <label for="style-adventure"> Adventure</label>
                                    </div>
                                    <div class="style-checkbox">
                                        <input type="checkbox" id="style-beach" value="beach">
                                        <label for="style-beach"> Beach</label>
                                    </div>
                                    <div class="style-checkbox">
                                        <input type="checkbox" id="style-culture" value="culture">
                                        <label for="style-culture"> Culture</label>
                                    </div>
                                    <div class="style-checkbox">
                                        <input type="checkbox" id="style-food" value="food">
                                        <label for="style-food"> Food</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="questions-nav">
                                <button type="button" class="skip-questions-btn" onclick="skipQuestions()">Skip</button>
                                <button type="submit" class="submit-questions-btn">Continue</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.getElementById('loginModal');
    if (modalContainer) {
        modalContainer.innerHTML = modalHTML;
    }
}

/**
 * Show login form
 */
window.showLogin = function() {
    createAuthModal('login');
};

/**
 * Show signup form
 */
window.showSignup = function() {
    createAuthModal('signup');
};

/**
 * Close auth modal
 */
window.closeAuthModal = function() {
    const modalContainer = document.getElementById('loginModal');
    if (modalContainer) {
        modalContainer.innerHTML = '';
    }
    pendingAction = null;
};

/**
 * Show error message
 */
function showError(message, formType = 'login') {
    const errorEl = document.getElementById(`${formType}Error`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
        
        setTimeout(() => {
            errorEl.classList.remove('show');
        }, 5000);
    }
}

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

/**
 * Handle email login
 */
window.handleEmailLogin = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('Please enter both email and password', 'login');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Login error:', data);
            showError(data.error || 'Login failed', 'login');
            return;
        }

        // data من الـ backend يحتوي على id, name, email
        const user = {
            id: data.id,
            name: data.name,
            email: data.email,
            picture: null,
            questionsCompleted: false  // تقدر تطورها لاحقًا
        };
handleSuccessfulLogin(user);  // Sign up → اسأل الأسئلة

    } catch (error) {
        console.error('Login request error:', error);
        showError('Network error during login', 'login');
    }
};


/**
 * Handle email signup
 */
window.handleEmailSignup = async function(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('signupFirstName').value;
    const lastName = document.getElementById('signupLastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Basic validation
    if (!firstName || !lastName || !email || !password) {
        showError('Please fill in all fields', 'signup');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters', 'signup');
        return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address', 'signup');
        return;
    }

    // نرسل البيانات للـ backend بدلاً من إنشاء المستخدم محليًا فقط
    try {
        const fullName = `${firstName} ${lastName}`;
        
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: fullName,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // backend رجّع خطأ
            console.error('Signup error:', data);
            showError(data.error || 'Signup failed', 'signup');
            return;
        }

        // نبني كائن المستخدم كما يتوقعه الكود الحالي
        const user = {
            id: data.id,
            name: data.name,
            email: data.email,
            picture: null,
            questionsCompleted: false
        };

        handleSuccessfulLogin(user, { askQuestions: true });
    } catch (error) {
        console.error('Signup request error:', error);
        showError('Network error during signup', 'signup');
    }
};


// ============================================================================
// QUESTIONS MODAL
// ============================================================================

/**
 * Select budget option
 */
window.selectBudget = function(budget) {
    // Remove selection from all budget buttons
    document.querySelectorAll('.budget-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Select clicked button
    event.target.classList.add('selected');
    
    // Save answer
    questionsAnswers.budget = budget;
};

/**
 * Handle questions form submit
 */
window.handleQuestionsSubmit = function(event) {
    event.preventDefault();
    
    // Collect selected trip styles
    questionsAnswers.tripStyles = [];
    document.querySelectorAll('.trip-style-options input[type="checkbox"]:checked').forEach(checkbox => {
        questionsAnswers.tripStyles.push(checkbox.value);
    });
    
    // Save preferences
    saveUserPreferences(questionsAnswers);
    
    // Continue to saved action or home
    finishAuth();
};

/**
 * Skip questions
 */
window.skipQuestions = function() {
    finishAuth();
};

// ============================================================================
// AUTHENTICATION FLOW
// ============================================================================

// Handle successful login (from any method)
function handleSuccessfulLogin(user, options = {}) {
    // Save auth state
    saveAuthState(user);

    // Update UI
    updateAuthUI();

    // هل نريد عرض الأسئلة الآن؟
    const askQuestions = options.askQuestions === true;

    // هل هذا المستخدم أنهى الأسئلة سابقًا؟
    const currentUser = getCurrentUser();
    const alreadyCompleted =
        currentUser && currentUser.questionsCompleted === true;

    if (askQuestions && !alreadyCompleted) {
        // نظهر الأسئلة في الـ sign-up فقط
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const questionsForm = document.getElementById('questionsForm');

        if (loginForm) loginForm.style.display = 'none';
        if (signupForm) signupForm.style.display = 'none';
        if (questionsForm) questionsForm.style.display = 'block';
    } else {
        // Login عادي → لا أسئلة، نكمل مباشرة
        finishAuth();
    }
}


/**
 * Finish authentication and proceed
 */
function finishAuth() {
    // Close modal
    closeAuthModal();
        // بعد انتهاء الـ auth حاول تحديث الـ Ready Plans حسب التفضيلات
    if (typeof window.applyReadyPlanRecommendations === 'function') {
        window.applyReadyPlanRecommendations();
    }

    // Execute pending action if any (same-origin only)
    if (pendingAction) {
        const action = pendingAction;
        pendingAction = null;
        
        // Execute the action
        try {
            action();
        } catch (error) {
            console.error('Error executing pending action:', error);
            // Fallback to home if action fails
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                window.location.href = 'index.html';
            }
        }
    } else {
        // No pending action, stay on current page or go home
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            // Already on home, just reload to update UI
            window.location.reload();
        }
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        clearAuthState();
        updateAuthUI();
        
        // Redirect to home if on protected page
        const protectedPages = ['japan-custom-plan.html', 'profile.html', 'malaysia-custom-plan.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        } else {
            window.location.reload();
        }
    }
}

// ============================================================================
// ACTION GATING
// ============================================================================

/**
 * Require authentication for an action
 */
function requireAuth(callback) {
    if (isLoggedIn()) {
        // Already logged in, execute action
        callback();
    } else {
        // Not logged in, save action and show login
        pendingAction = callback;
        showLogin();
    }
}

/**
 * Gate hero inputs on Home page
 */
function gateHeroInputs() {
    const heroInputs = document.querySelectorAll('.destination-input, .duration-input, .date-input');
    
    heroInputs.forEach(input => {
        // Block focus
        input.addEventListener('focus', (e) => {
            if (!isLoggedIn()) {
                e.preventDefault();
                e.target.blur();
                
                // Store intent to continue to trip planner if values are filled
                pendingAction = () => {
                    const country = document.getElementById('country')?.value;
                    const startDate = document.getElementById('start-date')?.value;
                    const endDate = document.getElementById('end-date')?.value;
                    
                    if (country && startDate && endDate) {
                        const tripPlannerUrl = buildTripPlannerUrl(country, startDate, endDate);
                        window.location.href = tripPlannerUrl;
                    }
                    // If not all filled, just stay on home page
                };
                
                showLogin();
            }
        });
        
        // Block click
        input.addEventListener('click', (e) => {
            if (!isLoggedIn()) {
                e.preventDefault();
                
                // Store intent
                pendingAction = () => {
                    const country = document.getElementById('country')?.value;
                    const startDate = document.getElementById('start-date')?.value;
                    const endDate = document.getElementById('end-date')?.value;
                    
                    if (country && startDate && endDate) {
                        const tripPlannerUrl = buildTripPlannerUrl(country, startDate, endDate);
                        window.location.href = tripPlannerUrl;
                    }
                };
                
                showLogin();
            }
        });
        
        // Block mousedown
        input.addEventListener('mousedown', (e) => {
            if (!isLoggedIn()) {
                e.preventDefault();
                showLogin();
            }
        });
    });
}

/**
 * Calculate inclusive days between two dates
 */
function calculateInclusiveDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    return Math.floor(diffMs / 86400000) + 1;
}

/**
 * Get country label from select element
 */
function getCountryLabel(countryValue) {
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        const selectedOption = countrySelect.options[countrySelect.selectedIndex];
        return selectedOption ? selectedOption.text : countryValue;
    }
    return countryValue;
}

/**
 * Build trip planner URL with all parameters
 */
function buildTripPlannerUrl(country, startDate, endDate) {
    const countryLabel = getCountryLabel(country);
    const days = calculateInclusiveDays(startDate, endDate);
    
    const params = new URLSearchParams({
        country: country,
        countryLabel: countryLabel,
        startDate: startDate,
        endDate: endDate,
        days: days
        , mode: 'planner'
    });
    
    return `japan-custom-plan.html?${params.toString()}`;
}

/**
 * Gate Plan My Trip button
 */
function gatePlanButton() {
    const planBtn = document.getElementById('planTripBtn');
    
    if (planBtn) {
        planBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get input values
            const country = document.getElementById('country')?.value;
            const startDate = document.getElementById('start-date')?.value;
            const endDate = document.getElementById('end-date')?.value;
            
            // Validate inputs
            if (!country || !startDate || !endDate) {
                // Show validation message
                const validationMsg = document.createElement('div');
                validationMsg.className = 'validation-message';
                validationMsg.style.cssText = 'color: #c33; background: #fee; border: 1px solid #fcc; padding: 12px; border-radius: 8px; margin-top: 15px; text-align: center; animation: shake 0.3s ease;';
                validationMsg.textContent = 'Please select a destination, start date, and end date';
                
                const plannerForm = document.querySelector('.planner-form');
                if (plannerForm) {
                    // Remove any existing validation message
                    const existingMsg = plannerForm.querySelector('.validation-message');
                    if (existingMsg) existingMsg.remove();
                    
                    plannerForm.appendChild(validationMsg);
                    
                    // Remove after 5 seconds
                    setTimeout(() => validationMsg.remove(), 5000);
                }
                return;
            }
            
            // Validate date order
            if (new Date(startDate) > new Date(endDate)) {
                const validationMsg = document.createElement('div');
                validationMsg.className = 'validation-message';
                validationMsg.style.cssText = 'color: #c33; background: #fee; border: 1px solid #fcc; padding: 12px; border-radius: 8px; margin-top: 15px; text-align: center; animation: shake 0.3s ease;';
                validationMsg.textContent = 'End date must be after start date';
                
                const plannerForm = document.querySelector('.planner-form');
                if (plannerForm) {
                    const existingMsg = plannerForm.querySelector('.validation-message');
                    if (existingMsg) existingMsg.remove();
                    plannerForm.appendChild(validationMsg);
                    setTimeout(() => validationMsg.remove(), 5000);
                }
                return;
            }
            
            const tripPlannerUrl = buildTripPlannerUrl(country, startDate, endDate);
            
            if (!isLoggedIn()) {
                // Store the trip planner URL as pending action
                pendingAction = () => {
                    window.location.href = tripPlannerUrl;
                };
                showLogin();
            } else {
                // Already logged in, navigate directly
                window.location.href = tripPlannerUrl;
            }
        });
    }
}

/**
 * Gate protected actions site-wide
 */
function gateProtectedActions() {
    // View Details buttons
    document.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-trip-btn, [data-action="view-details"]');
        
        if (viewBtn && window.location.pathname.includes('.html') && !window.location.pathname.includes('index.html')) {
            if (!isLoggedIn()) {
                e.preventDefault();
                const href = viewBtn.getAttribute('href');
                if (href && href !== '#') {
                    pendingAction = () => {
                        window.location.href = href;
                    };
                }
                showLogin();
            }
        }
    });
    
    // Customize buttons
    document.addEventListener('click', (e) => {
        const customizeBtn = e.target.closest('[data-action="customize"], .customize-btn');
        
        if (customizeBtn) {
            if (!isLoggedIn()) {
                e.preventDefault();
                const href = customizeBtn.getAttribute('href');
                pendingAction = () => {
                    if (href && href !== '#') {
                        window.location.href = href;
                    }
                };
                showLogin();
            }
        }
    });
    
    // Book buttons
    document.addEventListener('click', (e) => {
        const bookBtn = e.target.closest('[data-action="book"], .book-btn, .book-now-btn');
        
        if (bookBtn) {
            if (!isLoggedIn()) {
                e.preventDefault();
                pendingAction = () => {
                    alert('Booking functionality coming soon!');
                };
                showLogin();
            }
        }
    });
}

// ============================================================================
// TRIP PLANNER FUNCTIONS
// ============================================================================

/**
 * Generate unique ID for activities
 */
function generateActivityId() {
    return 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get all unique currencies for the dropdown
 */
function getAllCurrencies() {
    const uniqueCurrencies = {};
    Object.values(countryCurrencies).forEach(curr => {
        uniqueCurrencies[curr.code] = curr;
    });
    return Object.values(uniqueCurrencies).sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Initialize from URL parameters (data passed from Home page)
 */
function initializeFromURLParams() {
    const params = new URLSearchParams(window.location.search);
    const country = params.get('country');
    const countryLabel = params.get('countryLabel');
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');
    const days = parseInt(params.get('days'));
    const name = params.get('name');

    // Set trip name
    if (name) {
        tripName = decodeURIComponent(name);
    } else if (countryLabel) {
        tripName = `${countryLabel} Trip`;
    }
    
    const tripCountryNameEl = document.getElementById('tripCountryName');
    if (tripCountryNameEl) {
        tripCountryNameEl.textContent = tripName;
    }

    // Set default currency based on country
    if (country && countryCurrencies[country]) {
        defaultCurrency = countryCurrencies[country].code;
    }

    if (country && startDate && endDate && days) {
        // Update header information
        const tripDateRangeEl = document.getElementById('tripDateRange');
        if (tripDateRangeEl) {
            tripDateRangeEl.innerHTML = `
                <i class="fas fa-calendar"></i>
                ${formatDate(startDate)} - ${formatDate(endDate)}
            `;
        }
        
        const tripDurationEl = document.getElementById('tripDuration');
        if (tripDurationEl) {
            tripDurationEl.innerHTML = `
                <i class="fas fa-clock"></i>
                Duration: ${days} ${days === 1 ? 'day' : 'days'}
            `;
        }

        // Generate empty itinerary for the number of days
        itinerary = [];
        const start = new Date(startDate);
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            itinerary.push({
                day: i + 1,
                title: `Day ${i + 1}`,
                city: '',
                date: currentDate.toISOString().split('T')[0],
                activities: [],
                lat: null,
                lng: null
            });
        }

        if (typeof renderDayList === 'function') {
            renderDayList();
        }
        
        if (typeof showNotification === 'function') {
            showNotification(`Created ${days}-day itinerary for ${tripName}`);
        }
    }
}

/**
 * Populate currency select with all available currencies
 */
function populateCurrencySelect() {
    const select = document.getElementById('activityCurrency');
    if (!select) return;

    const currencies = getAllCurrencies();
    select.innerHTML = '';
    
    currencies.forEach(curr => {
        const option = document.createElement('option');
        option.value = curr.code;
        option.textContent = `${curr.code} (${curr.symbol}) - ${curr.name}`;
        select.appendChild(option);
    });
    
    // Set default currency
    select.value = defaultCurrency;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Initialize map
 */
function initializeMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    
    const params = new URLSearchParams(window.location.search);
    const countryLabel = params.get('countryLabel') || params.get('country');
    
    let initialCoords = [20, 0]; // Default world view
    let initialZoom = 2;

    if (countryLabel && countryCoordinates[countryLabel]) {
        initialCoords = countryCoordinates[countryLabel];
        initialZoom = 5;
    }

    map = L.map('map').setView(initialCoords, initialZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
}

/**
 * Render day list in sidebar
 */
function renderDayList() {
    const container = document.getElementById('dayListContainer');
    if (!container) return;
    
    container.innerHTML = '';

    if (itinerary.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--medium-gray); padding: 2rem;">No days added yet. Click "Add Day" to start planning.</p>';
        return;
    }

    itinerary.forEach((day, dayIndex) => {
        const dayItem = createDayElement(day, dayIndex);
        container.appendChild(dayItem);
    });
}

/**
 * Create day element
 */
function createDayElement(day, dayIndex) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-item';

    // Day Header
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.innerHTML = `
        <div class="day-number">${day.day}</div>
        <div class="day-info">
            <div class="day-title">${day.title}</div>
            <div class="day-summary">${day.city || 'No location set'} • ${day.activities.length} activities</div>
        </div>
        <div class="day-actions">
            <button class="btn-day-action" onclick="editDay(${dayIndex})" title="Edit Day">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-day-action btn-delete-day" onclick="deleteDay(${dayIndex})" title="Delete Day">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Toggle day expansion
    dayHeader.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-day-action')) {
            const activityList = dayDiv.querySelector('.activity-list');
            const isExpanded = activityList.classList.contains('expanded');
            
            // Close all other days
            document.querySelectorAll('.activity-list').forEach(list => list.classList.remove('expanded'));
            document.querySelectorAll('.day-header').forEach(header => header.classList.remove('active'));
            
            if (!isExpanded) {
                activityList.classList.add('expanded');
                dayHeader.classList.add('active');
            }
        }
    });

    // Activity List
    const activityList = document.createElement('div');
    activityList.className = 'activity-list';

    day.activities.forEach((activity, activityIndex) => {
        // Ensure activity has an ID
        if (!activity.id) {
            activity.id = generateActivityId();
        }
        const activityItem = createActivityElement(activity, dayIndex, activityIndex);
        activityList.appendChild(activityItem);
    });

    // Add Activity Button
    const addSection = document.createElement('div');
    addSection.className = 'add-activity-section';
    addSection.innerHTML = `
        <button class="btn-add-activity" onclick="openActivityModal(${dayIndex})">
            <i class="fas fa-plus"></i>
            Add Activity
        </button>
    `;

    activityList.appendChild(addSection);
    dayDiv.appendChild(dayHeader);
    dayDiv.appendChild(activityList);

    return dayDiv;
}

/**
 * Get icon based on activity type
 */
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

/**
 * Create collapsible activity element
 */
function createActivityElement(activity, dayIndex, activityIndex) {
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-item collapsible-activity';
    activityDiv.dataset.activityId = activity.id;
    const isExpanded = expandedActivityId === activity.id;
    if (isExpanded) {
        activityDiv.classList.add('expanded');
    }

    // Type badge class
    const typeClass = activity.type.toLowerCase().replace(' ', '-');
    
    // Budget display with currency symbol (for collapsed view)
    let costText = 'Free';
    if (activity.budget === 'Paid') {
        const currencyInfo = Object.values(countryCurrencies).find(c => c.code === activity.currency);
        const symbol = currencyInfo ? currencyInfo.symbol : activity.currency;
        costText = `${symbol}${activity.price}`;
    }

    // Collapsed view: time, name, cost, type badge
    const collapsedContent = `
        <div class="activity-collapsed" 
             onclick="toggleActivity('${activity.id}')" 
             onkeydown="handleActivityKeydown(event, '${activity.id}')"
             tabindex="0"
             role="button"
             aria-expanded="${isExpanded}">
            <div class="activity-collapsed-left">
                <div class="activity-icon-small">
                    <i class="fas ${getIconForType(activity.type)}"></i>
                </div>
                <div class="activity-collapsed-info">
                    <div class="activity-time-small">
                        <i class="fas fa-clock"></i>
                        ${activity.startTime} - ${activity.endTime}
                    </div>
                    <div class="activity-name-large">${activity.name}</div>
                </div>
            </div>
            <div class="activity-collapsed-right">
                <span class="type-badge-small ${typeClass}">${activity.type}</span>
                <span class="activity-cost-small">${costText}</span>
                <i class="fas fa-chevron-down activity-expand-icon"></i>
            </div>
        </div>
    `;

    // Expanded view: full details with buttons
    let locationHTML = '';
    if (activity.locationLink) {
        locationHTML = `
            <div class="activity-location">
                <a href="${activity.locationLink}" target="_blank" class="activity-location-link" onclick="event.stopPropagation()">
                    <i class="fas fa-external-link-alt"></i> ${activity.location || 'View location'}
                </a>
            </div>
        `;
    } else if (activity.location) {
        locationHTML = `<div class="activity-location"><i class="fas fa-map-marker-alt"></i> ${activity.location}</div>`;
    }

    const mapLinkHTML = `
        <div class="activity-map-link">
            <a href="#" onclick="openInRoadMap(event, ${dayIndex}, ${activityIndex})" class="map-link">
                <i class="fas fa-map-marked-alt"></i> Open in the Road Map
            </a>
        </div>
    `;

    const expandedContent = `
        <div class="activity-expanded" style="display: ${isExpanded ? 'block' : 'none'}">
            ${activity.description ? `<div class="activity-description">${activity.description}</div>` : ''}
            ${locationHTML}
            ${mapLinkHTML}
            <div class="activity-actions-expanded">
                <button class="btn-activity-action-expanded" onclick="editActivity(${dayIndex}, ${activityIndex}); event.stopPropagation();" title="Edit Activity">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-activity-action-expanded btn-delete" onclick="deleteActivity(${dayIndex}, ${activityIndex}); event.stopPropagation();" title="Delete Activity">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;

    activityDiv.innerHTML = collapsedContent + expandedContent;
    return activityDiv;
}

/**
 * Toggle activity expansion (accordion: one at a time)
 */
window.toggleActivity = function(activityId) {
    const wasExpanded = expandedActivityId === activityId;
    
    // Collapse all activities
    document.querySelectorAll('.collapsible-activity').forEach(item => {
        item.classList.remove('expanded');
        const collapsed = item.querySelector('.activity-collapsed');
        const expanded = item.querySelector('.activity-expanded');
        const icon = item.querySelector('.activity-expand-icon');
        if (collapsed) collapsed.setAttribute('aria-expanded', 'false');
        if (expanded) expanded.style.display = 'none';
        if (icon) icon.classList.remove('fa-chevron-up');
        if (icon) icon.classList.add('fa-chevron-down');
    });
    
    // If it wasn't expanded, expand this one
    if (!wasExpanded) {
        expandedActivityId = activityId;
        const activityDiv = document.querySelector(`[data-activity-id="${activityId}"]`);
        if (activityDiv) {
            activityDiv.classList.add('expanded');
            const collapsed = activityDiv.querySelector('.activity-collapsed');
            const expanded = activityDiv.querySelector('.activity-expanded');
            const icon = activityDiv.querySelector('.activity-expand-icon');
            if (collapsed) collapsed.setAttribute('aria-expanded', 'true');
            if (expanded) expanded.style.display = 'block';
            if (icon) icon.classList.remove('fa-chevron-down');
            if (icon) icon.classList.add('fa-chevron-up');
        }
    } else {
        expandedActivityId = null;
    }
};

/**
 * Handle keyboard navigation for activities
 */
window.handleActivityKeydown = function(event, activityId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleActivity(activityId);
    }
};

/**
 * Open in Road Map function
 */
window.openInRoadMap = function(event, dayIndex, activityIndex) {
    event.preventDefault();
    event.stopPropagation();
    
    const activity = itinerary[dayIndex].activities[activityIndex];
    
    // Switch to map view
    const tabRouteMap = document.getElementById('tabRouteMap');
    if (tabRouteMap) {
        tabRouteMap.click();
    }
    
    // If activity has coordinates, pan and zoom to it on the map
    if (activity.lat && activity.lng && map) {
        setTimeout(() => {
            map.setView([activity.lat, activity.lng], 15, { animate: true });
            
            // Find and open the marker popup
            markers.forEach(marker => {
                const pos = marker.getLatLng();
                if (Math.abs(pos.lat - activity.lat) < 0.0001 && Math.abs(pos.lng - activity.lng) < 0.0001) {
                    marker.openPopup();
                }
            });
            
            showNotification(`Showing ${activity.name} on map`);
        }, 200);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Open Google Maps in new tab
        let mapsUrl;
        if (activity.locationLink && activity.locationLink.includes('google.com/maps')) {
            mapsUrl = activity.locationLink;
        } else if (activity.location) {
            const query = encodeURIComponent(activity.location);
            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        } else {
            showNotification('No location information available', 'error');
            return;
        }
        
        window.open(mapsUrl, '_blank');
        showNotification(`Opening ${activity.name} in Google Maps`);
    }
};

/**
 * Initialize tab switching
 */
function initializeTabSwitching() {
    const tabRouteMap = document.getElementById('tabRouteMap');
    const tabBalance = document.getElementById('tabBalance');
    const mapView = document.getElementById('mapView');
    const balanceView = document.getElementById('balanceView');

    if (!tabRouteMap || !tabBalance || !mapView || !balanceView) return;

    tabRouteMap.addEventListener('click', function() {
        // Switch to map view
        tabRouteMap.classList.add('active');
        tabBalance.classList.remove('active');
        mapView.style.display = 'block';
        balanceView.classList.remove('active');
        
        // Invalidate map size after display change
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 100);
    });

    tabBalance.addEventListener('click', function() {
        // Switch to balance view
        tabBalance.classList.add('active');
        tabRouteMap.classList.remove('active');
        mapView.style.display = 'none';
        balanceView.classList.add('active');
        
        // Render balance calculator
        renderBalanceCalculator();
    });
}

/**
 * Render balance calculator with expense breakdown
 */
function renderBalanceCalculator() {
    const container = document.getElementById('balanceContent');
    if (!container) return;
    
    // Collect all paid activities
    const paidActivities = [];
    itinerary.forEach(day => {
        day.activities.forEach(activity => {
            if (activity.budget === 'Paid' && activity.price && activity.currency) {
                paidActivities.push({
                    type: activity.type,
                    name: activity.name,
                    price: activity.price,
                    currency: activity.currency
                });
            }
        });
    });

    // If no paid activities, show empty message
    if (paidActivities.length === 0) {
        container.innerHTML = `
            <div class="balance-breakdown">
                <div class="empty-balance-message">
                    <i class="fas fa-calculator"></i>
                    <h3>No Expenses Yet</h3>
                    <p>Add paid activities to your itinerary to see your budget breakdown here.</p>
                </div>
            </div>
        `;
        return;
    }

    // Group by currency, then by type
    const byCurrency = {};
    paidActivities.forEach(activity => {
        if (!byCurrency[activity.currency]) {
            byCurrency[activity.currency] = {};
        }
        if (!byCurrency[activity.currency][activity.type]) {
            byCurrency[activity.currency][activity.type] = {
                total: 0,
                count: 0,
                items: []
            };
        }
        byCurrency[activity.currency][activity.type].total += activity.price;
        byCurrency[activity.currency][activity.type].count += 1;
        byCurrency[activity.currency][activity.type].items.push(activity);
    });

    // Build HTML
    let html = '<div class="balance-breakdown">';
    html += `
        <div class="balance-header">
            <h3>💰 Balance Calculator</h3>
        </div>
    `;

    // Render each currency section
    Object.keys(byCurrency).sort().forEach(currencyCode => {
        const currencyInfo = Object.values(countryCurrencies).find(c => c.code === currencyCode);
        const symbol = currencyInfo ? currencyInfo.symbol : currencyCode;
        const currencyName = currencyInfo ? currencyInfo.name : currencyCode;
        
        const types = byCurrency[currencyCode];
        const currencyTotal = Object.values(types).reduce((sum, typeData) => sum + typeData.total, 0);

        html += `<div class="currency-section">`;
        html += `
            <div class="currency-header">
                <div class="currency-name">${currencyName} (${currencyCode})</div>
                <div class="currency-total">${symbol}${currencyTotal.toFixed(2)}</div>
            </div>
        `;

        html += `<div class="balance-items">`;
        
        // Render each type within this currency
        Object.keys(types).sort().forEach(typeName => {
            const typeData = types[typeName];
            const typeIcon = getIconForType(typeName);
            
            html += `
                <div class="balance-item">
                    <div class="balance-item-info">
                        <div class="balance-item-icon">
                            <i class="fas ${typeIcon}"></i>
                        </div>
                        <div>
                            <h4>${typeName}</h4>
                            <p>${typeData.count} ${typeData.count === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>
                    <div class="balance-amount">${symbol}${typeData.total.toFixed(2)}</div>
                </div>
            `;
        });

        html += `</div>`; // close balance-items
        html += `</div>`; // close currency-section
    });

    // Grand total section
    html += `<div class="grand-total-section">`;
    html += `<h3>Grand Total</h3>`;
    html += `<div class="grand-total-amounts">`;
    
    Object.keys(byCurrency).sort().forEach(currencyCode => {
        const currencyInfo = Object.values(countryCurrencies).find(c => c.code === currencyCode);
        const symbol = currencyInfo ? currencyInfo.symbol : currencyCode;
        const types = byCurrency[currencyCode];
        const total = Object.values(types).reduce((sum, typeData) => sum + typeData.total, 0);
        
        html += `
            <div class="grand-total-item">
                <div class="grand-total-currency">${currencyCode}</div>
                <div class="grand-total-amount">${symbol}${total.toFixed(2)}</div>
            </div>
        `;
    });
    
    html += `</div>`; // close grand-total-amounts
    html += `</div>`; // close grand-total-section

    html += `<p class="balance-note">Note: Totals are shown per currency. No currency conversion applied.</p>`;
    html += `</div>`; // close balance-breakdown

    container.innerHTML = html;
}

/**
 * Initialize modal handlers
 */
function initializeModalHandlers() {
    // Day modal
    const btnAddDay = document.getElementById('btnAddDay');
    const btnCancelDay = document.getElementById('btnCancelDay');
    const formDay = document.getElementById('formDay');
    
    if (btnAddDay) btnAddDay.addEventListener('click', openDayModal);
    if (btnCancelDay) btnCancelDay.addEventListener('click', closeDayModal);
    if (formDay) formDay.addEventListener('submit', saveDayHandler);

    // Activity modal
    const btnCancelActivity = document.getElementById('btnCancelActivity');
    const formActivity = document.getElementById('formActivity');
    
    if (btnCancelActivity) btnCancelActivity.addEventListener('click', closeActivityModal);
    if (formActivity) formActivity.addEventListener('submit', saveActivityHandler);

    // Budget radio buttons - show/hide price fields
    const budgetRadios = document.querySelectorAll('input[name="budget"]');
    budgetRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const paidFields = document.getElementById('paidFields');
            if (paidFields) {
                paidFields.style.display = this.value === 'Paid' ? 'block' : 'none';
            }
        });
    });

    // Real-time validation for activity form
    const activityType = document.getElementById('activityType');
    const activityName = document.getElementById('activityName');
    const activityLink = document.getElementById('activityLink');
    const activityStartTime = document.getElementById('activityStartTime');
    const activityEndTime = document.getElementById('activityEndTime');

    if (activityType) activityType.addEventListener('change', validateActivityForm);
    if (activityName) activityName.addEventListener('input', validateActivityForm);
    if (activityLink) activityLink.addEventListener('input', validateActivityForm);
    if (activityStartTime) activityStartTime.addEventListener('input', validateActivityForm);
    if (activityEndTime) activityEndTime.addEventListener('input', validateActivityForm);

    // Save plan button
    const btnSavePlan = document.getElementById('btnSavePlan');
    if (btnSavePlan) {
        btnSavePlan.addEventListener('click', function() {
            savePlan();
            // If balance view is active, refresh it
            const balanceView = document.getElementById('balanceView');
            if (balanceView && balanceView.classList.contains('active')) {
                renderBalanceCalculator();
            }
        });
    }

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

/**
 * Initialize keyboard support
 */
function initializeKeyboardSupport() {
    document.addEventListener('keydown', function(e) {
        // ESC to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.remove('active');
            });
        }
        
        // Enter to submit forms (when valid)
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                const saveBtn = activeModal.querySelector('.btn-modal-primary');
                if (saveBtn && !saveBtn.disabled) {
                    e.preventDefault();
                    saveBtn.click();
                }
            }
        }
    });
}

/**
 * Validate activity form and enable/disable save button
 */
function validateActivityForm() {
    const type = document.getElementById('activityType')?.value.trim();
    const name = document.getElementById('activityName')?.value.trim();
    const link = document.getElementById('activityLink')?.value.trim();
    const startTime = document.getElementById('activityStartTime')?.value;
    const endTime = document.getElementById('activityEndTime')?.value;
    const saveBtn = document.getElementById('btnSaveActivity');

    let isValid = true;

    // Clear all errors
    const errorType = document.getElementById('errorType');
    const errorName = document.getElementById('errorName');
    const errorLink = document.getElementById('errorLink');
    const errorStartTime = document.getElementById('errorStartTime');
    const errorEndTime = document.getElementById('errorEndTime');
    
    if (errorType) errorType.textContent = '';
    if (errorName) errorName.textContent = '';
    if (errorLink) errorLink.textContent = '';
    if (errorStartTime) errorStartTime.textContent = '';
    if (errorEndTime) errorEndTime.textContent = '';

    // Validate Type
    if (!type) {
        if (errorType) errorType.textContent = 'Please select a type';
        isValid = false;
    }

    // Validate Name
    if (!name) {
        if (errorName) errorName.textContent = 'Activity name is required';
        isValid = false;
    }

    // Validate Link (if provided)
    if (link) {
        try {
            new URL(link);
        } catch (e) {
            if (errorLink) errorLink.textContent = 'Please enter a valid URL';
            isValid = false;
        }
    }

    // Validate Start Time
    if (!startTime) {
        if (errorStartTime) errorStartTime.textContent = 'Start time is required';
        isValid = false;
    }

    // Validate End Time
    if (!endTime) {
        if (errorEndTime) errorEndTime.textContent = 'End time is required';
        isValid = false;
    }

    // Validate End >= Start
    if (startTime && endTime && endTime < startTime) {
        if (errorEndTime) errorEndTime.textContent = 'End time must be after start time';
        isValid = false;
    }

    // Enable/disable save button
    if (saveBtn) {
        saveBtn.disabled = !isValid;
    }
    return isValid;
}

/**
 * Open Day Modal
 */
window.openDayModal = function() {
    const modalDayTitle = document.getElementById('modalDayTitle');
    const formDay = document.getElementById('formDay');
    const modalDay = document.getElementById('modalDay');
    
    if (modalDayTitle) modalDayTitle.textContent = 'Add New Day';
    if (formDay) formDay.reset();
    currentDayIndex = null;
    if (modalDay) modalDay.classList.add('active');
};

/**
 * Close Day Modal
 */
window.closeDayModal = function() {
    const modalDay = document.getElementById('modalDay');
    if (modalDay) modalDay.classList.remove('active');
};

/**
 * Edit Day
 */
window.editDay = function(dayIndex) {
    const day = itinerary[dayIndex];
    const modalDayTitle = document.getElementById('modalDayTitle');
    const dayTitle = document.getElementById('dayTitle');
    const dayCity = document.getElementById('dayCity');
    const dayDate = document.getElementById('dayDate');
    const modalDay = document.getElementById('modalDay');
    
    if (modalDayTitle) modalDayTitle.textContent = 'Edit Day';
    if (dayTitle) dayTitle.value = day.title;
    if (dayCity) dayCity.value = day.city;
    if (dayDate) dayDate.value = day.date;
    currentDayIndex = dayIndex;
    if (modalDay) modalDay.classList.add('active');
};

/**
 * Delete Day
 */
window.deleteDay = function(dayIndex) {
    if (confirm('Are you sure you want to delete this day?')) {
        itinerary.splice(dayIndex, 1);
        // Renumber remaining days
        itinerary.forEach((day, index) => {
            day.day = index + 1;
        });
        renderDayList();
        updateMapMarkers();
        
        // Update balance calculator if visible
        const balanceView = document.getElementById('balanceView');
        if (balanceView && balanceView.classList.contains('active')) {
            renderBalanceCalculator();
        }
        
        showNotification('Day deleted successfully');
    }
};

/**
 * Save Day Handler
 */
function saveDayHandler(e) {
    e.preventDefault();
    
    const title = document.getElementById('dayTitle')?.value.trim();
    const city = document.getElementById('dayCity')?.value.trim();
    const date = document.getElementById('dayDate')?.value;

    if (currentDayIndex !== null) {
        // Edit existing day
        itinerary[currentDayIndex].title = title;
        itinerary[currentDayIndex].city = city;
        itinerary[currentDayIndex].date = date;
        showNotification('Day updated successfully');
    } else {
        // Add new day
        itinerary.push({
            day: itinerary.length + 1,
            title: title,
            city: city,
            date: date,
            activities: [],
            lat: null,
            lng: null
        });
        showNotification('Day added successfully');
    }

    renderDayList();
    closeDayModal();
}

/**
 * Open Activity Modal
 */
window.openActivityModal = function(dayIndex) {
    currentDayIndex = dayIndex;
    currentActivityIndex = null;
    isEditMode = false;
    
    const modalActivityTitle = document.getElementById('modalActivityTitle');
    const formActivity = document.getElementById('formActivity');
    const paidFields = document.getElementById('paidFields');
    const btnSaveActivity = document.getElementById('btnSaveActivity');
    const activityCurrency = document.getElementById('activityCurrency');
    
    if (modalActivityTitle) modalActivityTitle.textContent = 'Add Activity';
    if (formActivity) formActivity.reset();
    if (paidFields) paidFields.style.display = 'none';
    if (btnSaveActivity) btnSaveActivity.disabled = true;
    
    // Set default currency
    if (activityCurrency) activityCurrency.value = defaultCurrency;
    
    // Clear all error messages
    const errorType = document.getElementById('errorType');
    const errorName = document.getElementById('errorName');
    const errorLink = document.getElementById('errorLink');
    const errorStartTime = document.getElementById('errorStartTime');
    const errorEndTime = document.getElementById('errorEndTime');
    
    if (errorType) errorType.textContent = '';
    if (errorName) errorName.textContent = '';
    if (errorLink) errorLink.textContent = '';
    if (errorStartTime) errorStartTime.textContent = '';
    if (errorEndTime) errorEndTime.textContent = '';
    
    const modalActivity = document.getElementById('modalActivity');
    if (modalActivity) modalActivity.classList.add('active');
};

/**
 * Close Activity Modal
 */
window.closeActivityModal = function() {
    const modalActivity = document.getElementById('modalActivity');
    if (modalActivity) modalActivity.classList.remove('active');
};

/**
 * Edit Activity
 */
window.editActivity = function(dayIndex, activityIndex) {
    const activity = itinerary[dayIndex].activities[activityIndex];
    
    currentDayIndex = dayIndex;
    currentActivityIndex = activityIndex;
    isEditMode = true;
    
    const modalActivityTitle = document.getElementById('modalActivityTitle');
    const activityType = document.getElementById('activityType');
    const activityName = document.getElementById('activityName');
    const activityLocation = document.getElementById('activityLocation');
    const activityLink = document.getElementById('activityLink');
    const activityDescription = document.getElementById('activityDescription');
    const activityStartTime = document.getElementById('activityStartTime');
    const activityEndTime = document.getElementById('activityEndTime');
    const activityPrice = document.getElementById('activityPrice');
    const activityCurrency = document.getElementById('activityCurrency');
    
    if (modalActivityTitle) modalActivityTitle.textContent = 'Edit Activity';
    if (activityType) activityType.value = activity.type;
    if (activityName) activityName.value = activity.name;
    if (activityLocation) activityLocation.value = activity.location || '';
    if (activityLink) activityLink.value = activity.locationLink || '';
    if (activityDescription) activityDescription.value = activity.description || '';
    if (activityStartTime) activityStartTime.value = activity.startTime;
    if (activityEndTime) activityEndTime.value = activity.endTime;
    
    // Set budget radio
    const budgetRadio = document.querySelector(`input[name="budget"][value="${activity.budget}"]`);
    if (budgetRadio) budgetRadio.checked = true;
    
    // Show/hide paid fields
    const paidFields = document.getElementById('paidFields');
    if (activity.budget === 'Paid') {
        if (paidFields) paidFields.style.display = 'block';
        if (activityPrice) activityPrice.value = activity.price || '';
        if (activityCurrency) activityCurrency.value = activity.currency || defaultCurrency;
    } else {
        if (paidFields) paidFields.style.display = 'none';
    }
    
    validateActivityForm();
    
    const modalActivity = document.getElementById('modalActivity');
    if (modalActivity) modalActivity.classList.add('active');
};

/**
 * Delete Activity
 */
window.deleteActivity = function(dayIndex, activityIndex) {
    if (confirm('Are you sure you want to delete this activity?')) {
        itinerary[dayIndex].activities.splice(activityIndex, 1);
        renderDayList();
        updateMapMarkers();
        
        // Update balance calculator if visible
        const balanceView = document.getElementById('balanceView');
        if (balanceView && balanceView.classList.contains('active')) {
            renderBalanceCalculator();
        }
        
        showNotification('Activity deleted successfully');
    }
};

/**
 * Geocode location to get coordinates
 */
async function geocodeLocation(location) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
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

/**
 * Save Activity Handler
 */
async function saveActivityHandler(e) {
    e.preventDefault();
    
    if (!validateActivityForm()) {
        return;
    }

    const type = document.getElementById('activityType')?.value;
    const name = document.getElementById('activityName')?.value.trim();
    const location = document.getElementById('activityLocation')?.value.trim();
    const locationLink = document.getElementById('activityLink')?.value.trim();
    const description = document.getElementById('activityDescription')?.value.trim();
    const startTime = document.getElementById('activityStartTime')?.value;
    const endTime = document.getElementById('activityEndTime')?.value;
    const budget = document.querySelector('input[name="budget"]:checked')?.value;
    const price = document.getElementById('activityPrice')?.value;
    const currency = document.getElementById('activityCurrency')?.value;

    // Try to geocode location
    let coords = null;
    if (location) {
        coords = await geocodeLocation(location);
    }

    const activityData = {
        id: isEditMode && currentActivityIndex !== null 
            ? itinerary[currentDayIndex].activities[currentActivityIndex].id 
            : generateActivityId(),
        type: type,
        name: name,
        location: location,
        locationLink: locationLink,
        description: description,
        startTime: startTime,
        endTime: endTime,
        budget: budget,
        price: budget === 'Paid' ? parseFloat(price) : null,
        currency: budget === 'Paid' ? currency : null,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null
    };

    if (isEditMode && currentActivityIndex !== null) {
        // Edit existing activity
        itinerary[currentDayIndex].activities[currentActivityIndex] = activityData;
        showNotification('Activity updated successfully');
    } else {
        // Add new activity
        itinerary[currentDayIndex].activities.push(activityData);
        showNotification('Activity added successfully');
    }

    renderDayList();
    updateMapMarkers();
    
    // Update balance calculator if visible
    const balanceView = document.getElementById('balanceView');
    if (balanceView && balanceView.classList.contains('active')) {
        renderBalanceCalculator();
    }
    
    closeActivityModal();
}

/**
 * Update map markers
 */
function updateMapMarkers() {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add markers for activities with coordinates
    itinerary.forEach((day, dayIndex) => {
        day.activities.forEach((activity, activityIndex) => {
            if (activity.lat && activity.lng) {
                const marker = L.marker([activity.lat, activity.lng]).addTo(map);
                const currencyInfo = Object.values(countryCurrencies).find(c => c.code === activity.currency);
                const symbol = currencyInfo ? currencyInfo.symbol : (activity.currency || '');
                const priceText = activity.budget === 'Paid' ? `<br><strong>Price:</strong> ${symbol}${activity.price}` : '<br><strong>Free</strong>';
                
                marker.bindPopup(`
                    <div style="min-width: 200px;">
                        <h4 style="margin: 0 0 8px 0;">${activity.name}</h4>
                        <p style="margin: 4px 0;"><strong>Type:</strong> ${activity.type}</p>
                        <p style="margin: 4px 0;"><strong>Time:</strong> ${activity.startTime} - ${activity.endTime}</p>
                        ${activity.location ? `<p style="margin: 4px 0;"><strong>Location:</strong> ${activity.location}</p>` : ''}
                        ${priceText}
                    </div>
                `);
                markers.push(marker);
            }
        });
    });
}

/**
 * Save plan to localStorage
 */
function savePlan() {
    try {
        localStorage.setItem('tripPlan', JSON.stringify(itinerary));
        showNotification('Trip plan saved successfully!');
    } catch (e) {
        showNotification('Error saving plan. Please try again.');
    }
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

/**
 * Mobile menu toggle
 */
function initializeMobileMenu() {
    const btnMobileMenu = document.getElementById('btnMobileMenu');
    const plannerSidebar = document.getElementById('plannerSidebar');

    if (btnMobileMenu && plannerSidebar) {
        btnMobileMenu.addEventListener('click', function() {
            plannerSidebar.classList.toggle('mobile-open');
        });
    }
}

/**
 * Check if mobile view
 */
function checkMobileView() {
    const btnMobileMenu = document.getElementById('btnMobileMenu');
    const plannerSidebar = document.getElementById('plannerSidebar');
    
    if (btnMobileMenu && plannerSidebar) {
        if (window.innerWidth <= 768) {
            btnMobileMenu.style.display = 'flex';
        } else {
            btnMobileMenu.style.display = 'none';
            plannerSidebar.classList.remove('mobile-open');
        }
    }
}

// ============================================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================================

/**
 * Initialize authentication system
 */
function initAuth() {
    // Update UI based on current state
    updateAuthUI();
    
    // Initialize Google Sign-In
    if (USE_REAL_GOOGLE) {
        loadGoogleScript()
            .then(initRealGoogleSignIn)
            .catch(err => {
                console.warn('Failed to load Google Sign-In:', err);
            });
    }
    
    // Gate hero inputs (only on home page)
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        gateHeroInputs();
        gatePlanButton();
    }
    
    // Gate protected actions site-wide
    gateProtectedActions();
    
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', showLogin);
    }
    
    // Signup button
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', showSignup);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
        // زر اسم المستخدم في الهيدر – يفتح صفحة البروفايل
    const navUserBtn = document.getElementById('navUserBtn');
    if (navUserBtn) {
        navUserBtn.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    // CTA button
    const ctaBtn = document.getElementById('ctaBtn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            if (!isLoggedIn()) {
                showSignup();
            } else {
                const country = document.getElementById('country')?.value || 'japan';
                const startDate = document.getElementById('start-date')?.value || '';
                const endDate = document.getElementById('end-date')?.value || '';
                const url = buildTripPlannerUrl(country, startDate, endDate);
                window.location.href = url;
            }
        });
    }
}

/**
 * Initialize trip planner (only on japan-custom-plan.html page)
 */
function initTripPlanner() {
    // Check if we're on the trip planner page
    if (!window.location.pathname.includes('japan-custom-plan.html')) {
        return;
    }
    
    // Normal trip-planner setup
    initializeFromURLParams();
    initializeMap();
    renderDayList();
    initializeModalHandlers();
    initializeKeyboardSupport();
    initializeTabSwitching();
    populateCurrencySelect();
    initializeMobileMenu();

    // 🔹 NEW: if there is ?tripId=... in the URL (coming from profile),
    // load that saved trip from localStorage
    if (typeof initializeSavedTrip === 'function') {
        initializeSavedTrip();   // this will call loadSavedTrip(tripId)
    }
    
    // Add resize listener
    window.addEventListener('resize', checkMobileView);
    checkMobileView();
}


// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initAuth();
        initTripPlanner();
    });
} else {
    initAuth();
    initTripPlanner();
}
