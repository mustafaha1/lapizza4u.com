
// put your code here...
// Enhanced Security and Authentication System
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('pizzaShopUsers')) || {};
        this.currentUser = JSON.parse(localStorage.getItem('pizzaShopCurrentUser')) || null;
        this.sessionToken = localStorage.getItem('pizzaShopSessionToken') || null;
        this.sessionExpiry = localStorage.getItem('pizzaShopSessionExpiry') || null;
        
        // Initialize default admin user if none exists
        if (Object.keys(this.users).length === 0) {
            this.createUser('admin', 'admin@pizzashop.com', 'admin123');
        }
    }
    
    // Hash password using simple SHA-256 (for demo purposes)
    async hashPassword(password) {
        // In a real application, use a proper backend with bcrypt
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'pizzaShopSalt'); // Add salt
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Generate session token
    generateSessionToken() {
        return 'pizza_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    }
    
    // Create new user
    async createUser(username, email, password) {
        if (this.users[username]) {
            throw new Error('Username already exists');
        }
        
        const hashedPassword = await this.hashPassword(password);
        this.users[username] = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        this.saveUsers();
        return true;
    }
    
    // Login user
    async login(username, password) {
        const user = this.users[username];
        if (!user) {
            throw new Error('Invalid username or password');
        }
        
        const hashedPassword = await this.hashPassword(password);
        if (user.password !== hashedPassword) {
            throw new Error('Invalid username or password');
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();
        
        // Create session
        this.currentUser = user;
        this.sessionToken = this.generateSessionToken();
        this.sessionExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
        localStorage.setItem('pizzaShopCurrentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('pizzaShopSessionToken', this.sessionToken);
        localStorage.setItem('pizzaShopSessionExpiry', this.sessionExpiry);
        
        return true;
    }
    
    // Logout user
    logout() {
        this.currentUser = null;
        this.sessionToken = null;
        this.sessionExpiry = null;
        
        localStorage.removeItem('pizzaShopCurrentUser');
        localStorage.removeItem('pizzaShopSessionToken');
        localStorage.removeItem('pizzaShopSessionExpiry');
        
        this.updateUI();
    }
    
    // Check if user is logged in
    isLoggedIn() {
        if (!this.currentUser || !this.sessionToken || !this.sessionExpiry) {
            return false;
        }
        
        if (Date.now() > this.sessionExpiry) {
            this.logout();
            return false;
        }
        
        return true;
    }
    
    // Check if user is admin
    isAdmin() {
        return this.isLoggedIn() && this.currentUser.username === 'admin';
    }
    
    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('pizzaShopUsers', JSON.stringify(this.users));
    }
    
    // Update UI based on login status
    updateUI() {
        const adminLink = document.getElementById('admin-link');
        const loginLink = document.getElementById('login-link');
        const logoutLink = document.getElementById('logout-link');
        
        if (this.isLoggedIn()) {
            adminLink.style.display = 'block';
            loginLink.style.display = 'none';
            logoutLink.style.display = 'block';
            
            // Only show admin panel if user is admin
            if (!this.isAdmin()) {
                adminLink.style.display = 'none';
            }
        } else {
            adminLink.style.display = 'none';
            loginLink.style.display = 'block';
            logoutLink.style.display = 'none';
        }
    }
}

// Initialize authentication system
const auth = new AuthSystem();

// Enhanced Delivery Address System
class DeliveryAddressSystem {
    constructor() {
        this.selectedAddress = null;
        this.manualAddress = null;
    }
    
    // Mock postcode lookup - in a real app, you would use a service like Postcodes.io
    async lookupPostcode(postcode) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock addresses for demonstration
        const mockAddresses = {
            'SW1A1AA': [
                '10 Downing Street, London, SW1A 1AA',
                '11 Downing Street, London, SW1A 1AA',
                '12 Downing Street, London, SW1A 1AA'
            ],
            'W1A1AA': [
                '221B Baker Street, London, W1A 1AA',
                '222 Baker Street, London, W1A 1AA',
                '223 Baker Street, London, W1A 1AA'
            ],
            'EH11AA': [
                '1 Princes Street, Edinburgh, EH1 1AA',
                '2 Princes Street, Edinburgh, EH1 1AA',
                '3 Princes Street, Edinburgh, EH1 1AA'
            ]
        };
        
        const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
        
        if (mockAddresses[normalizedPostcode]) {
            return {
                success: true,
                addresses: mockAddresses[normalizedPostcode]
            };
        } else {
            return {
                success: false,
                message: 'No addresses found for this postcode'
            };
        }
    }
    
    // Validate UK postcode format
    validatePostcode(postcode) {
        const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
        return postcodeRegex.test(postcode);
    }
    
    // Show address selection
    showAddressSelection(addresses) {
        const addressSelection = document.getElementById('address-selection');
        const addressDropdown = document.getElementById('address-dropdown');
        
        // Clear previous options
        addressDropdown.innerHTML = '<option value="">Select an address</option>';
        
        // Add new addresses
        addresses.forEach((address, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = address;
            addressDropdown.appendChild(option);
        });
        
        addressSelection.style.display = 'block';
    }
    
    // Show manual address form
    showManualAddressForm() {
        document.getElementById('address-selection').style.display = 'none';
        document.getElementById('manual-address-form').style.display = 'block';
    }
    
    // Hide manual address form
    hideManualAddressForm() {
        document.getElementById('manual-address-form').style.display = 'none';
        document.getElementById('address-selection').style.display = 'block';
    }
    
    // Save manual address
    saveManualAddress() {
        const line1 = document.getElementById('manual-address-line1').value.trim();
        const line2 = document.getElementById('manual-address-line2').value.trim();
        const city = document.getElementById('manual-address-city').value.trim();
        const postcode = document.getElementById('manual-address-postcode').value.trim();
        
        if (!line1 || !city || !postcode) {
            alert('Please fill in all required fields');
            return false;
        }
        
        if (!this.validatePostcode(postcode)) {
            alert('Please enter a valid UK postcode');
            return false;
        }
        
        this.manualAddress = {
            line1,
            line2,
            city,
            postcode,
            fullAddress: `${line1}${line2 ? ', ' + line2 : ''}, ${city}, ${postcode}`
        };
        
        this.selectedAddress = this.manualAddress.fullAddress;
        this.updateCartDeliveryAddress();
        
        // Hide manual form and show success
        document.getElementById('manual-address-form').style.display = 'none';
        document.getElementById('postcode-result').innerHTML = 
            '<p class="postcode-result available">Manual address saved successfully!</p>';
        
        return true;
    }
    
    // Update cart with delivery address
    updateCartDeliveryAddress() {
        const cartAddressElement = document.getElementById('cart-delivery-address');
        if (this.selectedAddress && cartAddressElement) {
            cartAddressElement.textContent = this.selectedAddress;
        }
    }
    
    // Calculate distance for delivery charge (mock function)
    calculateDistance() {
        // In a real app, you would use geolocation API to calculate actual distance
        // For demo, we'll return a random distance between 0.5 and 5 miles
        return (Math.random() * 4.5 + 0.5).toFixed(1);
    }
}

// Initialize delivery address system
const deliverySystem = new DeliveryAddressSystem();

// Update the existing store settings management with authentication checks
function initializeStoreSettings() {
    loadStoreSettings();
    
    // Only allow saving if user is admin
    document.getElementById('save-contact-details').addEventListener('click', function() {
        if (!auth.isAdmin()) {
            showNotification('Access denied. Admin privileges required.');
            return;
        }
        
        storeSettings.contactDetails = {
            address: document.getElementById('store-address').value,
            phone: document.getElementById('store-phone').value,
            email: document.getElementById('store-email').value
        };
        saveStoreSettings();
        updateContactSection();
        showNotification('Contact details updated successfully!');
    });
    
    document.getElementById('save-delivery-settings').addEventListener('click', function() {
        if (!auth.isAdmin()) {
            showNotification('Access denied. Admin privileges required.');
            return;
        }
        
        storeSettings.deliverySettings = {
            radius: parseFloat(document.getElementById('delivery-radius-setting').value),
            chargeThreshold: parseFloat(document.getElementById('delivery-threshold').value),
            chargeAmount: parseFloat(document.getElementById('delivery-charge').value)
        };
        saveStoreSettings();
        updateDeliveryInfo();
        showNotification('Delivery settings updated successfully!');
    });
    
    document.getElementById('save-opening-hours').addEventListener('click', function() {
        if (!auth.isAdmin()) {
            showNotification('Access denied. Admin privileges required.');
            return;
        }
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
            const openCheckbox = document.getElementById(`${day}-open`);
            const openTime = document.getElementById(`${day}-open-time`).value;
            const closeTime = document.getElementById(`${day}-close-time`).value;
            
            storeSettings.openingHours[day] = {
                open: openCheckbox.checked,
                openTime: openTime,
                closeTime: closeTime
            };
        });
        
        saveStoreSettings();
        updateContactSection();
        updateStoreStatus();
        showNotification('Opening hours updated successfully!');
    });
    
    // Enhanced postcode check with address lookup
    document.getElementById('check-postcode').addEventListener('click', async function() {
        const postcodeInput = document.getElementById('postcode-input');
        const resultDiv = document.getElementById('postcode-result');
        const postcode = postcodeInput.value.trim();
        
        if (!postcode) {
            resultDiv.innerHTML = '<p class="postcode-result unavailable">Please enter a postcode</p>';
            return;
        }
        
        if (!deliverySystem.validatePostcode(postcode)) {
            resultDiv.innerHTML = '<p class="postcode-result unavailable">Please enter a valid UK postcode</p>';
            return;
        }
        
        // Show loading
        resultDiv.innerHTML = '<p class="postcode-result">Looking up addresses...</p>';
        this.disabled = true;
        this.textContent = 'Searching...';
        
        try {
            const result = await deliverySystem.lookupPostcode(postcode);
            
            if (result.success) {
                resultDiv.innerHTML = '<p class="postcode-result available">Addresses found! Please select your address below.</p>';
                deliverySystem.showAddressSelection(result.addresses);
            } else {
                resultDiv.innerHTML = `<p class="postcode-result unavailable">${result.message}. Please try manual entry.</p>`;
                deliverySystem.showManualAddressForm();
            }
        } catch (error) {
            resultDiv.innerHTML = '<p class="postcode-result unavailable">Error looking up address. Please try manual entry.</p>';
            deliverySystem.showManualAddressForm();
        } finally {
            this.disabled = false;
            this.textContent = 'Find Address';
        }
    });
    
    // Address dropdown selection
    document.getElementById('address-dropdown').addEventListener('change', function() {
        if (this.value !== '') {
            const addresses = Array.from(this.options).map(opt => opt.textContent).slice(1);
            deliverySystem.selectedAddress = addresses[this.value];
            deliverySystem.updateCartDeliveryAddress();
            
            document.getElementById('postcode-result').innerHTML = 
                '<p class="postcode-result available">Address selected successfully!</p>';
        }
    });
    
    // Manual address link
    document.getElementById('manual-address-link').addEventListener('click', function(e) {
        e.preventDefault();
        deliverySystem.showManualAddressForm();
    });
    
    // Back to lookup
    document.getElementById('back-to-lookup').addEventListener('click', function() {
        deliverySystem.hideManualAddressForm();
    });
    
    // Save manual address
    document.getElementById('save-manual-address').addEventListener('click', function() {
        deliverySystem.saveManualAddress();
    });
    
    // Other existing event listeners...
}

// Initialize authentication UI and event listeners
function initializeAuthentication() {
    const loginModal = document.getElementById('login-modal');
    const closeLogin = document.getElementById('close-login');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTabs = document.querySelectorAll('.login-tab');
    
    // Show login modal
    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'flex';
    });
    
    // Close login modal
    closeLogin.addEventListener('click', function() {
        loginModal.style.display = 'none';
    });
    
    // Switch between login and register tabs
    loginTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab
            loginTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show correct form
            document.querySelectorAll('.login-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(`${tabName}-form`).classList.add('active');
            
            // Clear errors
            document.getElementById(`${tabName}-error`).classList.remove('show');
        });
    });
    
    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error');
        
        try {
            await auth.login(username, password);
            auth.updateUI();
            loginModal.style.display = 'none';
            loginForm.reset();
            errorElement.classList.remove('show');
            showNotification('Login successful!');
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.classList.add('show');
        }
    });
    
    // Register form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        const errorElement = document.getElementById('register-error');
        
        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.classList.add('show');
            return;
        }
        
        try {
            await auth.createUser(username, email, password);
            errorElement.classList.remove('show');
            
            // Switch to login tab
            loginTabs.forEach(t => t.classList.remove('active'));
            document.querySelector('.login-tab[data-tab="login"]').classList.add('active');
            
            document.querySelectorAll('.login-form').forEach(form => {
                form.classList.remove('active');
            });
            loginForm.classList.add('active');
            
            registerForm.reset();
            
            showNotification('Registration successful! Please login.');
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.classList.add('show');
        }
    });
    
    // Logout
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        auth.logout();
        showNotification('Logged out successfully');
    });
    
    // Close modal when clicking outside
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // Update UI on load
    auth.updateUI();
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    loadMenuItems('pizza');
    setupEventListeners();
    renderAdminItems();
    initializeSearch();
    initializeStoreSettings();
    initializeAuthentication(); // Add this line
    
    // Update cart summary when cart changes
    const originalUpdateCart = updateCart;
    updateCart = function() {
        originalUpdateCart();
        updateCartSummary();
    };
    
    // Check admin access for admin panel
    const adminSection = document.getElementById('admin');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (adminSection.style.display !== 'none' && !auth.isAdmin()) {
                    adminSection.innerHTML = `
                        <div class="container">
                            <div class="admin-panel">
                                <h2>Access Denied</h2>
                                <p>You need administrator privileges to access this section.</p>
                                <p>Please contact the system administrator or login with an admin account.</p>
                            </div>
                        </div>
                    `;
                }
            }
        });
    });
    
    observer.observe(adminSection, { attributes: true });
});

// Enhanced checkout with delivery address validation
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const orderType = document.querySelector('input[name="cartOrderType"]:checked').value;
    
    if (orderType === 'delivery') {
        if (!deliverySystem.selectedAddress) {
            alert('Please select a delivery address before checkout');
            return;
        }
        
        // Calculate delivery distance and charge
        const distance = deliverySystem.calculateDistance();
        let deliveryMessage = `Delivery to: ${deliverySystem.selectedAddress}\nDistance: ${distance} miles`;
        
        if (distance > storeSettings.deliverySettings.radius) {
            alert(`Sorry, we don't deliver to addresses ${distance} miles away. Our delivery radius is ${storeSettings.deliverySettings.radius} miles.`);
            return;
        }
        
        if (distance > storeSettings.deliverySettings.chargeThreshold) {
            deliveryMessage += `\nDelivery charge: £${storeSettings.deliverySettings.chargeAmount}`;
        }
        
        alert(`Thank you for your order!\n${deliveryMessage}\nWe will contact you shortly to confirm details.`);
    } else {
        alert('Thank you for your order! Your collection reference is #' + Math.random().toString(36).substr(2, 9).toUpperCase());
    }
    
    cart = [];
    updateCart();
    closeCartModal();
    
    // Reset delivery address for next order
    deliverySystem.selectedAddress = null;
    deliverySystem.manualAddress = null;
    document.getElementById('cart-delivery-address').textContent = '';
}

// Rest of your existing JavaScript code remains the same...
// [Include all the existing JavaScript code from the previous implementation here]
// This includes menuData, globalOptions, storeSettings, and all the existing functions


// put your code here...
// Enhanced menu data with all requested features
let menuData = {
    pizza: [
        { 
            id: 1, 
            name: "Margherita Pizza", 
            basePrice: 8.99, 
            description: "Classic pizza with tomato sauce, mozzarella, and fresh basil", 
            image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "7\" Personal", inches: 7, price: 0 },
                    { name: "10\" Small", inches: 10, price: 2.50 },
                    { name: "12\" Medium", inches: 12, price: 4.50 },
                    { name: "14\" Large", inches: 14, price: 6.50 }
                ],
                crust: [
                    { name: "Regular Crust", price: 0 },
                    { name: "Stuffed Crust", price: 1.50, sizeBased: true, sizePrices: {7: 1.00, 10: 1.50, 12: 2.00, 14: 2.50} }
                ],
                toppings: [],
                comment: [
                    { name: "Special Instructions", price: 0, isTextInput: true }
                ]
            }
        },
        { 
            id: 2, 
            name: "Create Your Own Pizza", 
            basePrice: 7.99, 
            description: "Build your perfect pizza with your choice of toppings", 
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "7\" Personal", inches: 7, price: 0 },
                    { name: "10\" Small", inches: 10, price: 2.50 },
                    { name: "12\" Medium", inches: 12, price: 4.50 },
                    { name: "14\" Large", inches: 14, price: 6.50 }
                ],
                crust: [
                    { name: "Regular Crust", price: 0 },
                    { name: "Stuffed Crust", price: 1.50, sizeBased: true, sizePrices: {7: 1.00, 10: 1.50, 12: 2.00, 14: 2.50} }
                ],
                toppings: [],
                comment: [
                    { name: "Special Instructions", price: 0, isTextInput: true }
                ]
            }
        }
    ],
    burgers: [
        { 
            id: 3, 
            name: "Classic Cheeseburger", 
            basePrice: 8.99, 
            description: "Beef patty, cheese, lettuce, tomato, and special sauce", 
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                portion: [
                    { name: "1/4 lb", weight: 0.25, price: 0 },
                    { name: "1/2 lb", weight: 0.5, price: 2.50 }
                ],
                combo: [
                    { name: "Burger Only", price: 0 },
                    { name: "Meal Deal", price: 4.00 }
                ],
                salad: [],
                sauce: [],
                drink: []
            }
        },
        { 
            id: 4, 
            name: "Hot Dog", 
            basePrice: 4.99, 
            description: "Classic beef hot dog in a soft bun", 
            image: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                toppings: []
            }
        }
    ],
    kebabs: [
        { 
            id: 5, 
            name: "Chicken Doner Kebab", 
            basePrice: 9.99, 
            description: "Succulent chicken doner meat with fresh salad", 
            image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                salad: [],
                sauce: []
            }
        }
    ],
    combobox: [
        { 
            id: 6, 
            name: "Kebab Tray Combo", 
            basePrice: 12.99, 
            description: "Doner meat tray with salad and sauce", 
            image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                salad: [],
                sauce: []
            }
        }
    ],
    garlicbread: [
        { 
            id: 19, 
            name: "Garlic Bread", 
            basePrice: 4.99, 
            description: "Freshly baked garlic bread with herbs", 
            image: "https://images.unsplash.com/photo-1573140247632-f2fd2b5d18e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "10\"", inches: 10, price: 0 },
                    { name: "12\"", inches: 12, price: 1.50 },
                    { name: "14\"", inches: 14, price: 2.50 }
                ],
                cheese: [
                    { name: "Add Cheese", price: 1.00 }
                ]
            }
        },
        { 
            id: 20, 
            name: "Garlic Bread with Cheese", 
            basePrice: 5.99, 
            description: "Garlic bread topped with melted cheese", 
            image: "https://images.unsplash.com/photo-1573140247632-f2fd2b5d18e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "10\"", inches: 10, price: 0 },
                    { name: "12\"", inches: 12, price: 1.50 },
                    { name: "14\"", inches: 14, price: 2.50 }
                ]
            }
        }
    ],
    calzone: [
        { 
            id: 7, 
            name: "Classic Calzone", 
            basePrice: 11.99, 
            description: "Folded pizza with your choice of fillings", 
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "10\" Small", inches: 10, price: 0 },
                    { name: "12\" Medium", inches: 12, price: 2.00 },
                    { name: "14\" Large", inches: 14, price: 4.00 }
                ],
                toppings: [],
                comment: [
                    { name: "Special Instructions", price: 0, isTextInput: true }
                ]
            }
        },
        { 
            id: 15, 
            name: "Create Your Own Calzone", 
            basePrice: 10.99, 
            description: "Build your perfect calzone with your choice of fillings - first 4 toppings free!", 
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "10\" Small", inches: 10, price: 0 },
                    { name: "12\" Medium", inches: 12, price: 2.00 },
                    { name: "14\" Large", inches: 14, price: 4.00 }
                ],
                toppings: [],
                comment: [
                    { name: "Special Instructions", price: 0, isTextInput: true }
                ]
            }
        }
    ],
    sides: [
        { 
            id: 16, 
            name: "French Fries", 
            basePrice: 2.99, 
            description: "Crispy golden fries", 
            image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "Small", price: 0 },
                    { name: "Medium", price: 1.00 },
                    { name: "Large", price: 2.00 },
                    { name: "Family Size", price: 4.00 }
                ],
                seasoning: [
                    { name: "Regular Salt", price: 0 },
                    { name: "Cajun Spice", price: 0.50 },
                    { name: "Cheese Dust", price: 0.75 }
                ]
            }
        },
        { 
            id: 17, 
            name: "Onion Rings", 
            basePrice: 3.99, 
            description: "Crispy battered onion rings", 
            image: "https://images.unsplash.com/photo-1632773533125-45d30da85349?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "6 pieces", price: 0 },
                    { name: "12 pieces", price: 2.00 },
                    { name: "18 pieces", price: 3.50 }
                ],
                sauce: [
                    { name: "BBQ", price: 0 },
                    { name: "Garlic Mayo", price: 0.30 },
                    { name: "Sweet Chilli", price: 0.30 }
                ]
            }
        },
        { 
            id: 18, 
            name: "Mozzarella Sticks", 
            basePrice: 4.99, 
            description: "Breaded mozzarella cheese sticks", 
            image: "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "4 pieces", price: 0 },
                    { name: "8 pieces", price: 2.50 },
                    { name: "12 pieces", price: 4.00 }
                ],
                sauce: [
                    { name: "Marinara", price: 0 },
                    { name: "Garlic Dip", price: 0.30 },
                    { name: "Ranch", price: 0.30 }
                ]
            }
        }
    ],
    appetizers: [
        { 
            id: 9, 
            name: "Chicken Wings", 
            basePrice: 6.99, 
            description: "Crispy chicken wings", 
            image: "https://images.unsplash.com/photo-1567620832903-9e6bff2cce0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {}
        }
    ],
    drinks: [
        { 
            id: 10, 
            name: "Coca-Cola", 
            basePrice: 1.80, 
            description: "330ml can", 
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "330ml Can", price: 0 },
                    { name: "1.5L Bottle", price: 2.00 }
                ]
            }
        },
        { 
            id: 13, 
            name: "Fanta", 
            basePrice: 1.80, 
            description: "330ml can", 
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "330ml Can", price: 0 },
                    { name: "1.5L Bottle", price: 2.00 }
                ]
            }
        },
        { 
            id: 14, 
            name: "Sprite", 
            basePrice: 1.80, 
            description: "330ml can", 
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                size: [
                    { name: "330ml Can", price: 0 },
                    { name: "1.5L Bottle", price: 2.00 }
                ]
            }
        }
    ],
    deals: [
        { 
            id: 11, 
            name: "Pizza Meal Deal 1", 
            basePrice: 19.99, 
            description: "Any 2 x 10\" pizzas, 1 x 10\" garlic bread with cheese, and 1 bottle drink", 
            image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            dealConfig: {
                type: "pizza",
                allowedPizzaSizes: ["10\""],
                pizzaCount: 2,
                allowedGarlicBreadSizes: ["10\""],
                garlicBreadCount: 1,
                garlicBreadWithCheese: true,
                drinkCount: 1,
                drinkBottleOnly: true
            },
            options: {
                pizzas: [],
                garlicBreads: [],
                drinks: []
            }
        },
        { 
            id: 21, 
            name: "Pizza Meal Deal 2", 
            basePrice: 24.99, 
            description: "Any 2 x 12\" pizzas, 1 x 12\" garlic bread with cheese, and 1 bottle drink", 
            image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            dealConfig: {
                type: "pizza",
                allowedPizzaSizes: ["12\""],
                pizzaCount: 2,
                allowedGarlicBreadSizes: ["12\""],
                garlicBreadCount: 1,
                garlicBreadWithCheese: true,
                drinkCount: 1,
                drinkBottleOnly: true
            },
            options: {
                pizzas: [],
                garlicBreads: [],
                drinks: []
            }
        },
        { 
            id: 22, 
            name: "Pizza Meal Deal 3", 
            basePrice: 29.99, 
            description: "Any 2 x 14\" pizzas, 1 x 14\" garlic bread with cheese, and 2 bottle drinks", 
            image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            dealConfig: {
                type: "pizza",
                allowedPizzaSizes: ["14\""],
                pizzaCount: 2,
                allowedGarlicBreadSizes: ["14\""],
                garlicBreadCount: 1,
                garlicBreadWithCheese: true,
                drinkCount: 2,
                drinkBottleOnly: true
            },
            options: {
                pizzas: [],
                garlicBreads: [],
                drinks: []
            }
        },
        { 
            id: 12, 
            name: "Burger Meal Deal", 
            basePrice: 14.99, 
            description: "Burger, fries, and drink", 
            image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            options: {
                burger: [],
                fries: [
                    { name: "Small Fries", price: 0 },
                    { name: "Large Fries", price: 1.50 }
                ],
                drink: []
            }
        }
    ]
};

// Global available options for admin management
const globalOptions = {
    pizzaToppings: [
        { name: "Extra Cheese", prices: {7: 0.50, 10: 1.00, 12: 1.50, 14: 2.00} },
        { name: "Pepperoni", prices: {7: 0.75, 10: 1.50, 12: 2.00, 14: 2.50} },
        { name: "Mushrooms", prices: {7: 0.50, 10: 1.00, 12: 1.50, 14: 2.00} },
        { name: "Olives", prices: {7: 0.50, 10: 1.00, 12: 1.50, 14: 2.00} },
        { name: "Jalapenos", prices: {7: 0.50, 10: 1.00, 12: 1.50, 14: 2.00} },
        { name: "Onions", prices: {7: 0.25, 10: 0.75, 12: 1.00, 14: 1.50} },
        { name: "Bell Peppers", prices: {7: 0.50, 10: 1.00, 12: 1.50, 14: 2.00} }
    ],
    burgerSalad: [
        { name: "Lettuce", price: 0 },
        { name: "Tomato", price: 0 },
        { name: "Onion", price: 0 },
        { name: "Pickles", price: 0 },
        { name: "Extra Cheese", price: 0.50 },
        { name: "Bacon", price: 1.00 }
    ],
    burgerSauce: [
        { name: "Ketchup", price: 0 },
        { name: "Mayonnaise", price: 0 },
        { name: "BBQ Sauce", price: 0 },
        { name: "Burger Sauce", price: 0 },
        { name: "Hot Sauce", price: 0.25 },
        { name: "Garlic Mayo", price: 0.30 }
    ],
    kebabSalad: ["Lettuce", "Tomato", "Onion", "Cabbage"],
    kebabSauce: ["Garlic Sauce", "Chilli Sauce", "Mint Yogurt"],
    hotDogToppings: ["Ketchup", "Mustard", "Relish", "Onions", "Chili"],
    calzoneToppings: ["Ham", "Mushrooms", "Pepperoni", "Cheese", "Olives", "Bell Peppers", "Onions", "Jalapenos", "Pineapple", "Chicken", "Beef", "Sausage"],
    sideSizes: [
        { name: "Small", price: 0 },
        { name: "Medium", price: 1.00 },
        { name: "Large", price: 2.00 },
        { name: "Family Size", price: 4.00 }
    ],
    sidePieces: [
        { name: "4 pieces", price: 0 },
        { name: "6 pieces", price: 1.50 },
        { name: "8 pieces", price: 2.50 },
        { name: "12 pieces", price: 3.50 },
        { name: "18 pieces", price: 5.00 }
    ],
    sideSeasonings: [
        { name: "Regular Salt", price: 0 },
        { name: "Cajun Spice", price: 0.50 },
        { name: "Cheese Dust", price: 0.75 },
        { name: "Barbecue Seasoning", price: 0.60 },
        { name: "Garlic Herb", price: 0.55 }
    ],
    sideSauces: [
        { name: "BBQ", price: 0 },
        { name: "Garlic Mayo", price: 0.30 },
        { name: "Sweet Chilli", price: 0.30 },
        { name: "Marinara", price: 0 },
        { name: "Ranch", price: 0.30 },
        { name: "Hot Sauce", price: 0.25 },
        { name: "Honey Mustard", price: 0.35 }
    ]
};

// Store Settings Management
let storeSettings = {
    contactDetails: {
        address: "123 Food Street, London, UK, W1 1AB",
        phone: "020 7123 4567",
        email: "info@pizzaburgerhouse.co.uk"
    },
    deliverySettings: {
        radius: 3,
        chargeThreshold: 2.5,
        chargeAmount: 2.5
    },
    openingHours: {
        monday: { open: true, openTime: "10:00", closeTime: "23:00" },
        tuesday: { open: true, openTime: "10:00", closeTime: "23:00" },
        wednesday: { open: true, openTime: "10:00", closeTime: "23:00" },
        thursday: { open: true, openTime: "10:00", closeTime: "23:00" },
        friday: { open: true, openTime: "10:00", closeTime: "23:00" },
        saturday: { open: true, openTime: "10:00", closeTime: "23:00" },
        sunday: { open: true, openTime: "10:00", closeTime: "23:00" }
    }
};

// Initialize options for all items
function initializeAllOptions() {
    // Update pizza toppings
    menuData.pizza.forEach(pizza => {
        if (pizza.options.toppings) {
            pizza.options.toppings = globalOptions.pizzaToppings.map(topping => ({
                name: topping.name,
                prices: topping.prices
            }));
        }
    });

    // Update burger options
    menuData.burgers.forEach(burger => {
        if (burger.options.salad) {
            burger.options.salad = globalOptions.burgerSalad.map(salad => ({
                name: salad.name,
                price: salad.price
            }));
        }
        if (burger.options.sauce) {
            burger.options.sauce = globalOptions.burgerSauce.map(sauce => ({
                name: sauce.name,
                price: sauce.price
            }));
        }
        
        // Add drink options to burgers with meal deal
        if (burger.options.drink) {
            const allDrinks = menuData.drinks.map(drink => ({
                name: drink.name,
                price: 0
            }));
            burger.options.drink = allDrinks;
        }
    });

    // Update kebab options
    menuData.kebabs.forEach(kebab => {
        if (kebab.options.salad) {
            kebab.options.salad = globalOptions.kebabSalad.map(salad => ({
                name: salad,
                price: 0
            }));
        }
        if (kebab.options.sauce) {
            kebab.options.sauce = globalOptions.kebabSauce.map(sauce => ({
                name: sauce,
                price: 0
            }));
        }
    });

    // Update hot dog options
    const hotDog = menuData.burgers.find(item => item.name === "Hot Dog");
    if (hotDog && hotDog.options.toppings) {
        hotDog.options.toppings = globalOptions.hotDogToppings.map(topping => ({
            name: topping,
            price: topping === "Chili" ? 1.50 : 0
        }));
    }

    // Update calzone options - FIXED: Added empty prices object to prevent JSON parsing errors
    menuData.calzone.forEach(calzone => {
        if (calzone.options.toppings) {
            calzone.options.toppings = globalOptions.calzoneToppings.map(topping => ({
                name: topping,
                price: 0.50,
                prices: {}
            }));
        }
    });

    // Update sides with global options
    menuData.sides.forEach(side => {
        if (side.name === "French Fries") {
            side.options.size = globalOptions.sideSizes;
            side.options.seasoning = globalOptions.sideSeasonings;
        } else if (side.name === "Onion Rings") {
            side.options.size = globalOptions.sidePieces.filter(piece => 
                piece.name === "6 pieces" || piece.name === "12 pieces" || piece.name === "18 pieces"
            );
            side.options.sauce = globalOptions.sideSauces;
        } else if (side.name === "Mozzarella Sticks") {
            side.options.size = globalOptions.sidePieces.filter(piece => 
                piece.name === "4 pieces" || piece.name === "8 pieces" || piece.name === "12 pieces"
            );
            side.options.sauce = globalOptions.sideSauces.filter(sauce => 
                sauce.name === "Marinara" || sauce.name === "Garlic Dip" || sauce.name === "Ranch"
            );
        }
    });

    // Update meal deal options
    updateMealDealOptions();
}

function updateMealDealOptions() {
    // Get all pizzas for pizza deals
    const allPizzas = menuData.pizza.map(pizza => ({
        name: pizza.name,
        price: 0,
        isCustom: pizza.name === "Create Your Own Pizza"
    }));
    
    // Get all garlic breads
    const allGarlicBreads = menuData.garlicbread.map(item => ({
        name: item.name,
        price: 0
    }));
    
    // Get all drinks
    const allDrinks = menuData.drinks.map(drink => ({
        name: drink.name,
        price: 0
    }));
    
    // Get all burgers for burger deals
    const allBurgers = menuData.burgers.filter(burger => !burger.name.includes("Hot Dog")).map(burger => ({
        name: burger.name,
        price: 0
    }));

    // Update pizza deal options
    menuData.deals.forEach(deal => {
        if (deal.dealConfig && deal.dealConfig.type === "pizza") {
            deal.options.pizzas = allPizzas;
            deal.options.garlicBreads = allGarlicBreads;
            deal.options.drinks = allDrinks;
        }
    });
    
    // Update burger deal options
    const burgerDeal = menuData.deals.find(deal => deal.name === "Burger Meal Deal");
    if (burgerDeal) {
        burgerDeal.options.burger = allBurgers;
        burgerDeal.options.drink = allDrinks;
    }
}

// Call this function after menuData is defined
initializeAllOptions();

// Cart functionality
let cart = [];
let editingItemId = null;

// DOM elements
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.querySelector('.cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
let categoryTabs = document.querySelectorAll('.category-tab');
const menuItemsContainer = document.getElementById('menu-items');
const adminForm = document.getElementById('admin-form');
const addItemBtn = document.getElementById('add-item');
const updateItemBtn = document.getElementById('update-item');
const cancelEditBtn = document.getElementById('cancel-edit');
const adminItemsContainer = document.getElementById('admin-items');
const adminLink = document.getElementById('admin-link');
const searchInput = document.getElementById('menu-search');

// Store Settings Management Functions

// Load store settings from localStorage
function loadStoreSettings() {
    const savedSettings = localStorage.getItem('storeSettings');
    if (savedSettings) {
        storeSettings = JSON.parse(savedSettings);
    }
    updateContactSection();
    updateDeliveryInfo();
    renderOpeningHoursAdmin();
    updateStoreStatus();
}

// Save store settings to localStorage
function saveStoreSettings() {
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
}

// Update contact section with dynamic data
function updateContactSection() {
    document.getElementById('dynamic-address').textContent = storeSettings.contactDetails.address;
    document.getElementById('dynamic-phone').textContent = storeSettings.contactDetails.phone;
    document.getElementById('dynamic-email').textContent = storeSettings.contactDetails.email;
    
    // Update opening hours
    const openingHoursContainer = document.getElementById('dynamic-opening-hours');
    openingHoursContainer.innerHTML = '';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        const dayData = storeSettings.openingHours[day];
        const dayElement = document.createElement('p');
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        dayElement.innerHTML = `<strong>${dayName}:</strong> ${
            dayData.open ? `${dayData.openTime} - ${dayData.closeTime}` : 'Closed'
        }`;
        openingHoursContainer.appendChild(dayElement);
    });
}

// Update delivery information
function updateDeliveryInfo() {
    document.getElementById('delivery-radius').textContent = storeSettings.deliverySettings.radius;
    document.getElementById('delivery-charge-info').textContent = 
        `£${storeSettings.deliverySettings.chargeAmount.toFixed(2)} for orders over ${storeSettings.deliverySettings.chargeThreshold} miles`;
    document.getElementById('cart-delivery-threshold').textContent = storeSettings.deliverySettings.chargeThreshold;
}

// Render opening hours admin form
function renderOpeningHoursAdmin() {
    const container = document.getElementById('opening-hours-admin');
    container.innerHTML = '';
    
    const days = [
        { key: 'monday', name: 'Monday' },
        { key: 'tuesday', name: 'Tuesday' },
        { key: 'wednesday', name: 'Wednesday' },
        { key: 'thursday', name: 'Thursday' },
        { key: 'friday', name: 'Friday' },
        { key: 'saturday', name: 'Saturday' },
        { key: 'sunday', name: 'Sunday' }
    ];
    
    days.forEach(day => {
        const dayData = storeSettings.openingHours[day.key];
        const dayElement = document.createElement('div');
        dayElement.className = 'opening-hour-day';
        dayElement.innerHTML = `
            <h5>${day.name}</h5>
            <div class="day-checkbox">
                <input type="checkbox" id="${day.key}-open" ${dayData.open ? 'checked' : ''}>
                <label for="${day.key}-open">Open</label>
            </div>
            <div class="time-inputs">
                <input type="time" id="${day.key}-open-time" value="${dayData.openTime}" ${!dayData.open ? 'disabled' : ''}>
                <span>to</span>
                <input type="time" id="${day.key}-close-time" value="${dayData.closeTime}" ${!dayData.open ? 'disabled' : ''}>
            </div>
        `;
        container.appendChild(dayElement);
        
        // Add event listener to enable/disable time inputs
        const checkbox = document.getElementById(`${day.key}-open`);
        checkbox.addEventListener('change', function() {
            const openTime = document.getElementById(`${day.key}-open-time`);
            const closeTime = document.getElementById(`${day.key}-close-time`);
            openTime.disabled = !this.checked;
            closeTime.disabled = !this.checked;
        });
    });
}

// Update store status based on current time and opening hours
function updateStoreStatus() {
    const now = new Date();
    const currentDay = now.toLocaleString('en-gb', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const daySettings = storeSettings.openingHours[currentDay];
    
    if (daySettings && daySettings.open) {
        const openTime = daySettings.openTime;
        const closeTime = daySettings.closeTime;
        
        if (currentTime >= openTime && currentTime <= closeTime) {
            document.querySelector('.status-open').style.display = 'inline';
            document.querySelector('.status-closed').style.display = 'none';
        } else {
            document.querySelector('.status-open').style.display = 'none';
            document.querySelector('.status-closed').style.display = 'inline';
        }
    } else {
        document.querySelector('.status-open').style.display = 'none';
        document.querySelector('.status-closed').style.display = 'inline';
    }
}

// Check postcode for delivery
function checkPostcode() {
    const postcodeInput = document.getElementById('postcode-input');
    const resultDiv = document.getElementById('postcode-result');
    const postcode = postcodeInput.value.trim().toUpperCase();
    
    if (!postcode) {
        resultDiv.innerHTML = '<p class="postcode-result unavailable">Please enter a postcode</p>';
        return;
    }
    
    // Simulate postcode validation and distance calculation
    // In a real application, you would use a geocoding API here
    const isValidPostcode = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(postcode);
    
    if (!isValidPostcode) {
        resultDiv.innerHTML = '<p class="postcode-result unavailable">Please enter a valid UK postcode</p>';
        return;
    }
    
    // Simulate distance calculation (random between 0.5 and 5 miles)
    const distance = (Math.random() * 4.5 + 0.5).toFixed(1);
    
    if (distance <= storeSettings.deliverySettings.radius) {
        let message = `Delivery available! Your distance: ${distance} miles`;
        if (distance > storeSettings.deliverySettings.chargeThreshold) {
            message += ` - Delivery charge: £${storeSettings.deliverySettings.chargeAmount}`;
        }
        resultDiv.innerHTML = `<p class="postcode-result available">${message}</p>`;
    } else {
        resultDiv.innerHTML = `<p class="postcode-result unavailable">Sorry, we don't deliver to ${postcode}. You're ${distance} miles away (max: ${storeSettings.deliverySettings.radius} miles)</p>`;
    }
}

// Calculate delivery charge based on order type and distance
function calculateDeliveryCharge(orderType, distance = null) {
    if (orderType !== 'delivery') {
        return 0;
    }
    
    // If no distance provided, assume it's within charge threshold
    if (!distance || distance <= storeSettings.deliverySettings.chargeThreshold) {
        return 0;
    }
    
    return storeSettings.deliverySettings.chargeAmount;
}

// Update cart summary with delivery charge
function updateCartSummary() {
    const orderType = document.querySelector('input[name="cartOrderType"]:checked').value;
    const subtotal = cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
    
    let deliveryCharge = 0;
    if (orderType === 'delivery') {
        // In a real app, you would calculate actual distance here
        // For demo, we'll use a random distance over threshold 50% of the time
        const simulatedDistance = Math.random() > 0.5 ? 
            (storeSettings.deliverySettings.chargeThreshold + 1) : 
            (storeSettings.deliverySettings.chargeThreshold - 1);
        
        deliveryCharge = calculateDeliveryCharge(orderType, simulatedDistance);
    }
    
    const total = subtotal + deliveryCharge;
    
    document.getElementById('cart-subtotal').textContent = `£${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `£${total.toFixed(2)}`;
    
    const deliveryRow = document.querySelector('.delivery-charge-row');
    const deliveryChargeElement = document.getElementById('cart-delivery-charge');
    
    if (orderType === 'delivery' && deliveryCharge > 0) {
        deliveryRow.style.display = 'flex';
        deliveryChargeElement.textContent = `£${deliveryCharge.toFixed(2)}`;
    } else {
        deliveryRow.style.display = 'none';
    }
}

// Initialize store settings functionality
function initializeStoreSettings() {
    loadStoreSettings();
    
    // Contact details save
    document.getElementById('save-contact-details').addEventListener('click', function() {
        storeSettings.contactDetails = {
            address: document.getElementById('store-address').value,
            phone: document.getElementById('store-phone').value,
            email: document.getElementById('store-email').value
        };
        saveStoreSettings();
        updateContactSection();
        showNotification('Contact details updated successfully!');
    });
    
    // Delivery settings save
    document.getElementById('save-delivery-settings').addEventListener('click', function() {
        storeSettings.deliverySettings = {
            radius: parseFloat(document.getElementById('delivery-radius-setting').value),
            chargeThreshold: parseFloat(document.getElementById('delivery-threshold').value),
            chargeAmount: parseFloat(document.getElementById('delivery-charge').value)
        };
        saveStoreSettings();
        updateDeliveryInfo();
        showNotification('Delivery settings updated successfully!');
    });
    
    // Opening hours save
    document.getElementById('save-opening-hours').addEventListener('click', function() {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
            const openCheckbox = document.getElementById(`${day}-open`);
            const openTime = document.getElementById(`${day}-open-time`).value;
            const closeTime = document.getElementById(`${day}-close-time`).value;
            
            storeSettings.openingHours[day] = {
                open: openCheckbox.checked,
                openTime: openTime,
                closeTime: closeTime
            };
        });
        
        saveStoreSettings();
        updateContactSection();
        updateStoreStatus();
        showNotification('Opening hours updated successfully!');
    });
    
    // Order type toggle
    document.querySelectorAll('input[name="orderType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const deliveryInfo = document.getElementById('delivery-info');
            const collectionInfo = document.getElementById('collection-info');
            
            if (this.value === 'delivery') {
                deliveryInfo.style.display = 'block';
                collectionInfo.style.display = 'none';
            } else {
                deliveryInfo.style.display = 'none';
                collectionInfo.style.display = 'block';
            }
        });
    });
    
    // Cart order type toggle
    document.querySelectorAll('input[name="cartOrderType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const deliveryDetails = document.getElementById('delivery-details-cart');
            
            if (this.value === 'delivery') {
                deliveryDetails.style.display = 'block';
            } else {
                deliveryDetails.style.display = 'none';
            }
            
            updateCartSummary();
        });
    });
    
    // Postcode check
    document.getElementById('check-postcode').addEventListener('click', checkPostcode);
    
    // Update store status every minute
    setInterval(updateStoreStatus, 60000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadMenuItems('pizza');
    setupEventListeners();
    renderAdminItems();
    initializeSearch();
    initializeStoreSettings();
    
    // Update cart summary when cart changes
    const originalUpdateCart = updateCart;
    updateCart = function() {
        originalUpdateCart();
        updateCartSummary();
    };
});

// Add garlic bread category tab
function addGarlicBreadCategoryTab() {
    const categoriesContainer = document.querySelector('.categories');
    if (categoriesContainer && !document.querySelector('.category-tab[data-category="garlicbread"]')) {
        const garlicBreadTab = document.createElement('button');
        garlicBreadTab.className = 'category-tab';
        garlicBreadTab.setAttribute('data-category', 'garlicbread');
        garlicBreadTab.textContent = 'Garlic Bread';
        categoriesContainer.appendChild(garlicBreadTab);
        
        garlicBreadTab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            loadMenuItems(category);
        });
        
        categoryTabs = document.querySelectorAll('.category-tab');
    }
}

// Set up event listeners
function setupEventListeners() {
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            loadMenuItems(category);
        });
    });

    cartIcon.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartModal);
    checkoutBtn.addEventListener('click', checkout);

    adminForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (editingItemId) {
            updateMenuItem();
        } else {
            addMenuItem();
        }
    });

    updateItemBtn.addEventListener('click', updateMenuItem);
    cancelEditBtn.addEventListener('click', cancelEdit);

    adminLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('admin').scrollIntoView({ behavior: 'smooth' });
    });
}

// Search functionality
function initializeSearch() {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        if (searchTerm) {
            searchMenuItems(searchTerm);
        } else {
            const activeCategory = document.querySelector('.category-tab.active').getAttribute('data-category');
            loadMenuItems(activeCategory);
        }
    });
}

function searchMenuItems(searchTerm) {
    menuItemsContainer.innerHTML = '';
    
    const allItems = [];
    for (const category in menuData) {
        menuData[category].forEach(item => {
            allItems.push({...item, category});
        });
    }
    
    const filteredItems = allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.description.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
    
    if (filteredItems.length === 0) {
        menuItemsContainer.innerHTML = '<p class="empty-state">No items found matching your search.</p>';
        return;
    }
    
    filteredItems.forEach(item => {
        createMenuItemElement(item);
    });
    
    attachEventListenersToMenuItems();
}

// Load menu items for a category
function loadMenuItems(category) {
    menuItemsContainer.innerHTML = '';
    
    if (menuData[category] && menuData[category].length > 0) {
        menuData[category].forEach(item => {
            createMenuItemElement(item);
        });
    } else {
        menuItemsContainer.innerHTML = '<p class="empty-state">No items available in this category yet.</p>';
    }
    
    attachEventListenersToMenuItems();
}

function createMenuItemElement(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    
    let optionsHTML = '';
    if (Object.keys(item.options).length > 0) {
        optionsHTML = '<div class="item-options">';
        
        for (const optionType in item.options) {
            if (item.options[optionType].length === 0) continue;
            
            const isCheckboxOption = ['salad', 'sauce', 'cheese', 'toppings', 'seasoning'].includes(optionType);
            const isSelectOption = ['pizzas', 'garlicBreads', 'drinks', 'burger', 'fries', 'drink'].includes(optionType);
            const isTextInput = optionType === 'comment' && item.options[optionType][0].isTextInput;
            const isButtonOption = ['size', 'portion', 'combo', 'crust'].includes(optionType);
            
            if (isTextInput) {
                optionsHTML += `
                    <div class="option-group">
                        <label class="option-label">${optionType.charAt(0).toUpperCase() + optionType.slice(1)}:</label>
                        <input type="text" class="comment-input" placeholder="Add any special instructions...">
                    </div>
                `;
            } else if (isSelectOption) {
                const shouldHideDrink = optionType === 'drink' && 
                                      item.category === 'burgers';
                
                if (optionType === 'pizzas' && item.dealConfig && item.dealConfig.pizzaCount > 1) {
                    for (let i = 1; i <= item.dealConfig.pizzaCount; i++) {
                        optionsHTML += `
                            <div class="option-group">
                                <label class="option-label">Pizza ${i}:</label>
                                <select class="select-option" data-type="pizzas" data-index="${i}">
                                    <option value="">Select Pizza ${i}</option>
                        `;
                        
                        item.options[optionType].forEach((option, index) => {
                            let priceText = option.price > 0 ? ` (+£${option.price.toFixed(2)})` : '';
                            optionsHTML += `<option value="${option.name}" data-price="${option.price}" data-custom="${option.isCustom || false}">${option.name}${priceText}</option>`;
                        });
                        
                        optionsHTML += `</select></div>`;
                        
                        // Add custom pizza options container (initially hidden)
                        optionsHTML += `
                            <div class="custom-pizza-options" id="custom-pizza-${i}" style="display: none;">
                                <!-- Custom pizza options will be loaded here when needed -->
                            </div>
                        `;
                    }
                } else {
                    optionsHTML += `
                        <div class="option-group" ${shouldHideDrink ? 'style="display: none;"' : ''}>
                            <label class="option-label">${optionType.charAt(0).toUpperCase() + optionType.slice(1)}:</label>
                            <select class="select-option" data-type="${optionType}">
                                <option value="">Select ${optionType}</option>
                    `;
                    
                    item.options[optionType].forEach((option, index) => {
                        let priceText = option.price > 0 ? ` (+£${option.price.toFixed(2)})` : '';
                        optionsHTML += `<option value="${option.name}" data-price="${option.price}">${option.name}${priceText}</option>`;
                    });
                    
                    optionsHTML += `</select></div>`;
                }
            } else if (isCheckboxOption && optionType === 'toppings') {
                optionsHTML += `
                    <div class="option-group">
                        <label class="option-label">${optionType.charAt(0).toUpperCase() + optionType.slice(1)}:</label>
                        <div class="toppings-toggle" data-item-id="${item.id}">Show Toppings</div>
                        <div class="toppings-container" id="toppings-${item.id}" style="display: none;">
                `;
                
                let toppingCounterHTML = '';
                if (item.name === "Create Your Own Pizza" || item.name === "Create Your Own Calzone") {
                    const freeToppings = 4;
                    toppingCounterHTML = `<div class="topping-counter">First ${freeToppings} toppings are free, additional toppings are charged</div>`;
                }
                
                item.options[optionType].forEach((option, index) => {
                    let priceText = '';
                    
                    if (item.category === 'calzone') {
                        if (item.name === "Create Your Own Calzone") {
                            priceText = ' (First 4 free, then +£0.50 each)';
                        } else {
                            priceText = ` (+£${option.price.toFixed(2)})`;
                        }
                    } else {
                        priceText = ' (Price varies by size)';
                    }
                    
                    optionsHTML += `
                        <div class="checkbox-option">
                            <input type="checkbox" id="${item.id}-${optionType}-${index}" 
                                   data-type="${optionType}" 
                                   data-name="${option.name}" 
                                   data-prices='${item.category === 'calzone' ? '{}' : JSON.stringify(option.prices)}'
                                   data-price="${option.price}">
                            <label for="${item.id}-${optionType}-${index}">${option.name}${priceText}</label>
                        </div>
                    `;
                });
                
                optionsHTML += toppingCounterHTML;
                optionsHTML += `</div></div>`;
            } else if (isCheckboxOption) {
                optionsHTML += `
                    <div class="option-group">
                        <label class="option-label">${optionType.charAt(0).toUpperCase() + optionType.slice(1)}:</label>
                `;
                
                item.options[optionType].forEach((option, index) => {
                    let priceText = option.price > 0 ? ` (+£${option.price.toFixed(2)})` : '';
                    
                    optionsHTML += `
                        <div class="checkbox-option">
                            <input type="checkbox" id="${item.id}-${optionType}-${index}" 
                                   data-type="${optionType}" 
                                   data-name="${option.name}" 
                                   data-price="${option.price}">
                            <label for="${item.id}-${optionType}-${index}">${option.name}${priceText}</label>
                        </div>
                    `;
                });
                
                optionsHTML += `</div>`;
            } else if (isButtonOption) {
                optionsHTML += `
                    <div class="option-group">
                        <label class="option-label">${optionType.charAt(0).toUpperCase() + optionType.slice(1)}:</label>
                        <div class="option-buttons">
                `;
                
                item.options[optionType].forEach((option, index) => {
                    let priceText = '';
                    if (option.sizeBased && option.sizePrices) {
                        priceText = ` (+£${option.sizePrices[7].toFixed(2)} for 7", +£${option.sizePrices[10].toFixed(2)} for 10", +£${option.sizePrices[12].toFixed(2)} for 12", +£${option.sizePrices[14].toFixed(2)} for 14")`;
                    } else if (option.sizeBased) {
                        priceText = ` (+£${option.price.toFixed(2)} for 7", +£${(option.price + 0.5).toFixed(2)} for 10", +£${(option.price + 1).toFixed(2)} for 12", +£${(option.price + 1.5).toFixed(2)} for 14")`;
                    } else if (option.price > 0) {
                        priceText = ` (+£${option.price.toFixed(2)})`;
                    } else if (option.price < 0) {
                        priceText = ` (£${option.price.toFixed(2)})`;
                    }
                    
                    const isSelected = false;
                    
                    optionsHTML += `
                        <button type="button" class="option-btn ${isSelected ? 'selected' : ''}" 
                                data-type="${optionType}" 
                                data-name="${option.name}" 
                                data-price="${option.price}"
                                data-size-based="${option.sizeBased || false}"
                                ${option.sizePrices ? `data-size-prices='${JSON.stringify(option.sizePrices)}'` : ''}>
                            ${option.name}${priceText}
                        </button>
                    `;
                });
                
                optionsHTML += `
                        </div>
                    </div>
                `;
            }
        }
        
        optionsHTML += '</div>';
    }
    
    let initialPrice = item.basePrice;
    
    menuItem.innerHTML = `
        <div class="item-image" style="background-image: url('${item.image}')"></div>
        <div class="item-details">
            <h3 class="item-title">${item.name}</h3>
            <p class="item-description">${item.description}</p>
            ${optionsHTML}
            <div class="item-price">£${initialPrice.toFixed(2)}</div>
            <button class="add-to-cart" data-id="${item.id}">Add to Cart</button>
        </div>
    `;
    menuItemsContainer.appendChild(menuItem);
}

function attachEventListenersToMenuItems() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            addToCart(itemId, this.closest('.menu-item'));
        });
    });
    
    document.querySelectorAll('.option-btn').forEach(button => {
        button.addEventListener('click', function() {
            const optionGroup = this.closest('.option-group');
            optionGroup.querySelectorAll('.option-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.classList.add('selected');
            
            const menuItem = this.closest('.menu-item');
            updateItemPrice(menuItem);
            
            if (this.getAttribute('data-type') === 'size') {
                const itemId = parseInt(menuItem.querySelector('.add-to-cart').getAttribute('data-id'));
                let item = null;
                for (const category in menuData) {
                    item = menuData[category].find(i => i.id === itemId);
                    if (item) break;
                }
                if (item && item.category === 'pizza') {
                    updateToppingPrices(menuItem);
                }
            }
            
            if (this.getAttribute('data-type') === 'combo') {
                const menuItem = this.closest('.menu-item');
                const drinkSelect = menuItem.querySelector('select[data-type="drink"]');
                if (drinkSelect) {
                    if (this.getAttribute('data-name') === "Meal Deal") {
                        drinkSelect.closest('.option-group').style.display = 'block';
                    } else {
                        drinkSelect.closest('.option-group').style.display = 'none';
                        drinkSelect.value = '';
                    }
                    updateItemPrice(menuItem);
                }
            }
        });
    });
    
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const menuItem = this.closest('.menu-item');
            updateItemPrice(menuItem);
        });
    });
    
    document.querySelectorAll('.select-option').forEach(select => {
        select.addEventListener('change', function() {
            const menuItem = this.closest('.menu-item');
            updateItemPrice(menuItem);
            
            // Handle custom pizza selection in meal deals
            if (this.getAttribute('data-type') === 'pizzas') {
                const selectedOption = this.options[this.selectedIndex];
                const isCustom = selectedOption.getAttribute('data-custom') === 'true';
                const pizzaIndex = this.getAttribute('data-index');
                const customContainer = document.getElementById(`custom-pizza-${pizzaIndex}`);
                
                if (customContainer) {
                    if (isCustom && selectedOption.value) {
                        // Load custom pizza options
                        loadCustomPizzaOptions(customContainer, pizzaIndex);
                        customContainer.style.display = 'block';
                    } else {
                        customContainer.style.display = 'none';
                        customContainer.innerHTML = '';
                    }
                }
            }
        });
    });
    
    document.querySelectorAll('.comment-input').forEach(input => {
        input.addEventListener('input', function() {
            const menuItem = this.closest('.menu-item');
            updateItemPrice(menuItem);
        });
    });
    
    document.querySelectorAll('.toppings-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            const toppingsContainer = document.getElementById(`toppings-${itemId}`);
            
            if (toppingsContainer.style.display === 'none') {
                const menuItem = this.closest('.menu-item');
                const itemId = parseInt(menuItem.querySelector('.add-to-cart').getAttribute('data-id'));
                let item = null;
                for (const category in menuData) {
                    item = menuData[category].find(i => i.id === itemId);
                    if (item) break;
                }
                
                if (item && item.category === 'pizza') {
                    const selectedSize = menuItem.querySelector('.option-btn[data-type="size"].selected');
                    if (!selectedSize) {
                        alert('Please select a pizza size first');
                        return;
                    }
                    updateToppingPrices(menuItem);
                }
                
                toppingsContainer.style.display = 'block';
                this.textContent = 'Hide Toppings';
            } else {
                toppingsContainer.style.display = 'none';
                this.textContent = 'Show Toppings';
            }
        });
    });
}

function loadCustomPizzaOptions(container, pizzaIndex) {
    const customPizza = menuData.pizza.find(pizza => pizza.name === "Create Your Own Pizza");
    if (!customPizza) return;
    
    let optionsHTML = `
        <div class="custom-pizza-section">
            <h4>Customize Pizza ${pizzaIndex}</h4>
            <div class="option-group">
                <label class="option-label">Size:</label>
                <div class="option-buttons">
    `;
    
    customPizza.options.size.forEach(size => {
        const priceText = size.price > 0 ? ` (+£${size.price.toFixed(2)})` : '';
        optionsHTML += `
            <button type="button" class="option-btn custom-size-btn" 
                    data-pizza-index="${pizzaIndex}"
                    data-type="custom-size" 
                    data-name="${size.name}" 
                    data-price="${size.price}"
                    data-inches="${size.inches}">
                ${size.name}${priceText}
            </button>
        `;
    });
    
    optionsHTML += `
                </div>
            </div>
            <div class="option-group">
                <label class="option-label">Crust:</label>
                <div class="option-buttons">
    `;
    
    customPizza.options.crust.forEach(crust => {
        let priceText = '';
        if (crust.sizeBased && crust.sizePrices) {
            priceText = ` (+£${crust.sizePrices[7].toFixed(2)} for 7", +£${crust.sizePrices[10].toFixed(2)} for 10", +£${crust.sizePrices[12].toFixed(2)} for 12", +£${crust.sizePrices[14].toFixed(2)} for 14")`;
        } else if (crust.price > 0) {
            priceText = ` (+£${crust.price.toFixed(2)})`;
        }
        
        optionsHTML += `
            <button type="button" class="option-btn custom-crust-btn" 
                    data-pizza-index="${pizzaIndex}"
                    data-type="custom-crust" 
                    data-name="${crust.name}" 
                    data-price="${crust.price}"
                    data-size-based="${crust.sizeBased || false}"
                    ${crust.sizePrices ? `data-size-prices='${JSON.stringify(crust.sizePrices)}'` : ''}>
                ${crust.name}${priceText}
            </button>
        `;
    });
    
    optionsHTML += `
                </div>
            </div>
            <div class="option-group">
                <label class="option-label">Toppings:</label>
                <div class="toppings-toggle" data-pizza-index="${pizzaIndex}">Show Toppings</div>
                <div class="toppings-container" id="custom-toppings-${pizzaIndex}" style="display: none;">
                    <div class="topping-counter">First 4 toppings are free, additional toppings are charged per size</div>
    `;
    
    customPizza.options.toppings.forEach((topping, index) => {
        optionsHTML += `
            <div class="checkbox-option">
                <input type="checkbox" id="custom-topping-${pizzaIndex}-${index}" 
                       data-pizza-index="${pizzaIndex}"
                       data-type="custom-topping" 
                       data-name="${topping.name}" 
                       data-prices='${JSON.stringify(topping.prices)}'
                       data-price="0">
                <label for="custom-topping-${pizzaIndex}-${index}">${topping.name} (Price varies by size)</label>
            </div>
        `;
    });
    
    optionsHTML += `
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = optionsHTML;
    
    // Add event listeners for custom pizza options
    container.querySelectorAll('.custom-size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const pizzaIndex = this.getAttribute('data-pizza-index');
            const container = this.closest('.custom-pizza-section');
            container.querySelectorAll('.custom-size-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            updateCustomPizzaPrice(pizzaIndex);
        });
    });
    
    container.querySelectorAll('.custom-crust-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const pizzaIndex = this.getAttribute('data-pizza-index');
            const container = this.closest('.custom-pizza-section');
            container.querySelectorAll('.custom-crust-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            updateCustomPizzaPrice(pizzaIndex);
        });
    });
    
    container.querySelectorAll('input[data-type="custom-topping"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const pizzaIndex = this.getAttribute('data-pizza-index');
            updateCustomPizzaPrice(pizzaIndex);
        });
    });
    
    container.querySelectorAll('.toppings-toggle[data-pizza-index]').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const pizzaIndex = this.getAttribute('data-pizza-index');
            const toppingsContainer = document.getElementById(`custom-toppings-${pizzaIndex}`);
            
            if (toppingsContainer.style.display === 'none') {
                toppingsContainer.style.display = 'block';
                this.textContent = 'Hide Toppings';
            } else {
                toppingsContainer.style.display = 'none';
                this.textContent = 'Show Toppings';
            }
        });
    });
}

function updateCustomPizzaPrice(pizzaIndex) {
    // This function would calculate and update the price for custom pizza in meal deals
    // Implementation would be similar to updateItemPrice but for custom pizza sections
}

function updateToppingPrices(menuItem) {
    const selectedSize = menuItem.querySelector('.option-btn[data-type="size"].selected');
    if (!selectedSize) return;
    
    const sizeName = selectedSize.getAttribute('data-name');
    let sizeInches = 10;
    
    if (sizeName.includes('7"')) sizeInches = 7;
    else if (sizeName.includes('10"')) sizeInches = 10;
    else if (sizeName.includes('12"')) sizeInches = 12;
    else if (sizeName.includes('14"')) sizeInches = 14;
    
    const toppingCheckboxes = menuItem.querySelectorAll('input[data-type="toppings"]');
    toppingCheckboxes.forEach(checkbox => {
        const pricesData = checkbox.getAttribute('data-prices');
        if (pricesData && pricesData !== '{}') {
            try {
                const prices = JSON.parse(pricesData);
                const price = prices[sizeInches] || 0;
                const label = checkbox.nextElementSibling;
                const toppingName = label.textContent.split(' (')[0];
                label.textContent = `${toppingName} (+£${price.toFixed(2)})`;
            } catch (e) {
                console.error('Error parsing topping prices:', e);
            }
        }
    });
}

function updateItemPrice(menuItem) {
    const itemId = parseInt(menuItem.querySelector('.add-to-cart').getAttribute('data-id'));
    
    let item = null;
    for (const category in menuData) {
        item = menuData[category].find(i => i.id === itemId);
        if (item) break;
    }
    
    if (item) {
        let finalPrice = item.basePrice;
        let selectedSize = null;
        let selectedToppingsCount = 0;
        
        const optionGroups = menuItem.querySelectorAll('.option-group');
        
        optionGroups.forEach(group => {
            const selectedOption = group.querySelector('.option-btn.selected');
            if (selectedOption) {
                const optionType = selectedOption.getAttribute('data-type');
                let optionPrice = parseFloat(selectedOption.getAttribute('data-price')) || 0;
                const isSizeBased = selectedOption.getAttribute('data-size-based') === 'true';
                const sizePrices = selectedOption.getAttribute('data-size-prices');
                
                if (optionType === 'size') {
                    selectedSize = selectedOption.getAttribute('data-name');
                }
                
                if (optionType === 'crust' && isSizeBased && selectedSize) {
                    if (sizePrices) {
                        try {
                            const prices = JSON.parse(sizePrices);
                            if (selectedSize.includes('7"')) optionPrice = prices[7] || 0;
                            else if (selectedSize.includes('10"')) optionPrice = prices[10] || 0;
                            else if (selectedSize.includes('12"')) optionPrice = prices[12] || 0;
                            else if (selectedSize.includes('14"')) optionPrice = prices[14] || 0;
                        } catch (e) {
                            console.error('Error parsing crust prices:', e);
                        }
                    }
                }
                
                finalPrice += optionPrice;
            }
            
            const checkboxes = group.querySelectorAll('input[type="checkbox"]:checked');
            checkboxes.forEach(checkbox => {
                const optionType = checkbox.getAttribute('data-type');
                
                if (optionType === 'toppings') {
                    const pricesData = checkbox.getAttribute('data-prices');
                    const fixedPrice = parseFloat(checkbox.getAttribute('data-price')) || 0;
                    
                    if (pricesData && pricesData !== '{}') {
                        try {
                            const prices = JSON.parse(pricesData);
                            let toppingPrice = 0;
                            let sizeInches = 10;
                            
                            if (selectedSize) {
                                if (selectedSize.includes('7"')) sizeInches = 7;
                                else if (selectedSize.includes('10"')) sizeInches = 10;
                                else if (selectedSize.includes('12"')) sizeInches = 12;
                                else if (selectedSize.includes('14"')) sizeInches = 14;
                            }
                            
                            toppingPrice = prices[sizeInches] || 0;
                            
                            if (item.name === "Create Your Own Pizza") {
                                selectedToppingsCount++;
                                if (selectedToppingsCount > 4) {
                                    finalPrice += toppingPrice;
                                }
                            } else {
                                finalPrice += toppingPrice;
                            }
                        } catch (e) {
                            console.error('Error parsing topping prices:', e);
                        }
                    } else {
                        if (item.name === "Create Your Own Calzone") {
                            selectedToppingsCount++;
                            if (selectedToppingsCount > 4) {
                                finalPrice += fixedPrice;
                            }
                        } else {
                            finalPrice += fixedPrice;
                        }
                    }
                } else {
                    const optionPrice = parseFloat(checkbox.getAttribute('data-price')) || 0;
                    finalPrice += optionPrice;
                }
            });
            
            const selects = group.querySelectorAll('.select-option');
            selects.forEach(select => {
                if (select.value) {
                    const optionPrice = parseFloat(select.selectedOptions[0].getAttribute('data-price')) || 0;
                    finalPrice += optionPrice;
                }
            });
        });
        
        menuItem.querySelector('.item-price').textContent = `£${finalPrice.toFixed(2)}`;
    }
}

function resetMenuItemForm(menuItemElement) {
    if (!menuItemElement) return;
    
    const checkboxes = menuItemElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    const commentInputs = menuItemElement.querySelectorAll('.comment-input');
    commentInputs.forEach(input => {
        input.value = '';
    });
    
    const selects = menuItemElement.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });
    
    const optionGroups = menuItemElement.querySelectorAll('.option-group');
    optionGroups.forEach(group => {
        const optionButtons = group.querySelectorAll('.option-btn');
        if (optionButtons.length > 0) {
            optionButtons.forEach(btn => btn.classList.remove('selected'));
        }
    });
    
    const toppingsContainers = menuItemElement.querySelectorAll('.toppings-container');
    toppingsContainers.forEach(container => {
        container.style.display = 'none';
    });
    
    const toppingsToggles = menuItemElement.querySelectorAll('.toppings-toggle');
    toppingsToggles.forEach(toggle => {
        toggle.textContent = 'Show Toppings';
    });
    
    const customPizzaContainers = menuItemElement.querySelectorAll('.custom-pizza-options');
    customPizzaContainers.forEach(container => {
        container.style.display = 'none';
        container.innerHTML = '';
    });
    
    const itemId = parseInt(menuItemElement.querySelector('.add-to-cart').getAttribute('data-id'));
    let item = null;
    for (const category in menuData) {
        item = menuData[category].find(i => i.id === itemId);
        if (item) break;
    }
    if (item) {
        menuItemElement.querySelector('.item-price').textContent = `£${item.basePrice.toFixed(2)}`;
    }
}

function addToCart(itemId, menuItemElement) {
    let item = null;
    for (const category in menuData) {
        item = menuData[category].find(i => i.id === itemId);
        if (item) break;
    }
    
    if (item) {
        if (item.category === 'burgers') {
            const selectedPortion = menuItemElement.querySelector('.option-btn[data-type="portion"].selected');
            const selectedCombo = menuItemElement.querySelector('.option-btn[data-type="combo"].selected');
            
            if (!selectedPortion) {
                alert('Please select a burger size (1/4 lb or 1/2 lb)');
                return;
            }
            
            if (!selectedCombo) {
                alert('Please select burger option (Burger Only or Meal Deal)');
                return;
            }
            
            if (selectedCombo.getAttribute('data-name') === "Meal Deal") {
                const drinkSelect = menuItemElement.querySelector('select[data-type="drink"]');
                if (drinkSelect && !drinkSelect.value) {
                    alert('Please select a drink for your Meal Deal');
                    return;
                }
            }
        }
        
        const selectedOptions = {};
        let additionalPrice = 0;
        let selectedSize = null;
        let selectedToppingsCount = 0;
        
        if (menuItemElement) {
            const optionGroups = menuItemElement.querySelectorAll('.option-group');
            
            optionGroups.forEach(group => {
                const selectedOption = group.querySelector('.option-btn.selected');
                if (selectedOption) {
                    const optionType = selectedOption.getAttribute('data-type');
                    const optionName = selectedOption.getAttribute('data-name');
                    let optionPrice = parseFloat(selectedOption.getAttribute('data-price')) || 0;
                    const isSizeBased = selectedOption.getAttribute('data-size-based') === 'true';
                    const sizePrices = selectedOption.getAttribute('data-size-prices');
                    
                    if (optionType === 'size') {
                        selectedSize = optionName;
                    }
                    
                    if (optionType === 'crust' && isSizeBased && selectedSize) {
                        if (sizePrices) {
                            try {
                                const prices = JSON.parse(sizePrices);
                                if (selectedSize.includes('7"')) optionPrice = prices[7] || 0;
                                else if (selectedSize.includes('10"')) optionPrice = prices[10] || 0;
                                else if (selectedSize.includes('12"')) optionPrice = prices[12] || 0;
                                else if (selectedSize.includes('14"')) optionPrice = prices[14] || 0;
                            } catch (e) {
                                console.error('Error parsing crust prices:', e);
                            }
                        }
                    }
                    
                    let displayName = optionName;
                    if (optionType === 'portion') {
                        displayName = optionName;
                    } else if (optionType === 'combo') {
                        displayName = optionName;
                    }
                    
                    selectedOptions[optionType] = displayName;
                    additionalPrice += optionPrice;
                }
                
                const checkboxes = group.querySelectorAll('input[type="checkbox"]:checked');
                if (checkboxes.length > 0) {
                    checkboxes.forEach(checkbox => {
                        const optionType = checkbox.getAttribute('data-type');
                        const optionName = checkbox.getAttribute('data-name');
                        
                        if (!selectedOptions[optionType]) {
                            selectedOptions[optionType] = [];
                        }
                        
                        if (optionType === 'toppings') {
                            const pricesData = checkbox.getAttribute('data-prices');
                            const fixedPrice = parseFloat(checkbox.getAttribute('data-price')) || 0;
                            
                            if (pricesData && pricesData !== '{}') {
                                try {
                                    const prices = JSON.parse(pricesData);
                                    let toppingPrice = 0;
                                    let sizeInches = 10;
                                    
                                    if (selectedSize) {
                                        if (selectedSize.includes('7"')) sizeInches = 7;
                                        else if (selectedSize.includes('10"')) sizeInches = 10;
                                        else if (selectedSize.includes('12"')) sizeInches = 12;
                                        else if (selectedSize.includes('14"')) sizeInches = 14;
                                    }
                                    
                                    toppingPrice = prices[sizeInches] || 0;
                                    
                                    if (item.name === "Create Your Own Pizza") {
                                        selectedToppingsCount++;
                                        if (selectedToppingsCount > 4) {
                                            selectedOptions[optionType].push(optionName);
                                            additionalPrice += toppingPrice;
                                        } else {
                                            selectedOptions[optionType].push(optionName);
                                        }
                                    } else {
                                        selectedOptions[optionType].push(optionName);
                                        additionalPrice += toppingPrice;
                                    }
                                } catch (e) {
                                    console.error('Error parsing topping prices:', e);
                                }
                            } else {
                                if (item.name === "Create Your Own Calzone") {
                                    selectedToppingsCount++;
                                    if (selectedToppingsCount > 4) {
                                        selectedOptions[optionType].push(optionName);
                                        additionalPrice += fixedPrice;
                                    } else {
                                        selectedOptions[optionType].push(optionName);
                                    }
                                } else {
                                    selectedOptions[optionType].push(optionName);
                                    additionalPrice += fixedPrice;
                                }
                            }
                        } else {
                            const optionPrice = parseFloat(checkbox.getAttribute('data-price')) || 0;
                            selectedOptions[optionType].push(optionName);
                            additionalPrice += optionPrice;
                        }
                    });
                }
                
                const selects = group.querySelectorAll('.select-option');
                selects.forEach(select => {
                    if (select.value) {
                        const optionType = select.getAttribute('data-type');
                        const optionName = select.value;
                        const optionPrice = parseFloat(select.selectedOptions[0].getAttribute('data-price')) || 0;
                        
                        if (optionType === 'drink' && item.category === 'burgers') {
                            const selectedCombo = menuItemElement.querySelector('.option-btn[data-type="combo"].selected');
                            if (selectedCombo && selectedCombo.getAttribute('data-name') === "Burger Only") {
                                return;
                            }
                        }
                        
                        if (!selectedOptions[optionType]) {
                            selectedOptions[optionType] = [];
                        }
                        selectedOptions[optionType].push(optionName);
                        additionalPrice += optionPrice;
                    }
                });
                
                const commentInput = group.querySelector('.comment-input');
                if (commentInput && commentInput.value.trim()) {
                    selectedOptions['comment'] = commentInput.value.trim();
                }
            });
        }
        
        const finalPrice = item.basePrice + additionalPrice;
        
        const cartItemKey = JSON.stringify({
            id: item.id,
            options: selectedOptions
        });
        
        const existingItemIndex = cart.findIndex(cartItem => 
            JSON.stringify({
                id: cartItem.id,
                options: cartItem.options
            }) === cartItemKey
        );
        
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                basePrice: item.basePrice,
                finalPrice: finalPrice,
                options: selectedOptions,
                quantity: 1
            });
        }
        
        updateCart();
        showNotification(`${item.name} added to cart!`);
        
        resetMenuItemForm(menuItemElement);
    }
}

function updateCart() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
    } else {
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            let optionsText = '';
            if (Object.keys(item.options).length > 0) {
                optionsText = '<div class="item-options-text">';
                for (const optionType in item.options) {
                    if (Array.isArray(item.options[optionType])) {
                        if (item.options[optionType].length > 0) {
                            if (optionType === 'salad' || optionType === 'sauce' || optionType === 'toppings' || optionType === 'seasoning') {
                                optionsText += `${item.options[optionType].join(', ')}, `;
                            } else {
                                optionsText += `${optionType}: ${item.options[optionType].join(', ')}, `;
                            }
                        }
                    } else {
                        if (optionType === 'portion') {
                            optionsText += `${item.options[optionType]}, `;
                        } else if (optionType === 'combo') {
                            optionsText += `${item.options[optionType]}, `;
                        } else if (optionType === 'size') {
                            optionsText += `${item.options[optionType]}, `;
                        } else if (optionType === 'crust' && item.options[optionType] !== "Regular Crust") {
                            optionsText += `${item.options[optionType]}, `;
                        } else if (optionType === 'comment') {
                            optionsText += `Instructions: ${item.options[optionType]}, `;
                        } else if (optionType !== 'crust') {
                            optionsText += `${optionType}: ${item.options[optionType]}, `;
                        }
                    }
                }
                if (optionsText.endsWith(', ')) {
                    optionsText = optionsText.slice(0, -2);
                }
                optionsText += '</div>';
            }
            
            cartItem.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    ${optionsText}
                    <div class="item-quantity">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                </div>
                <div class="item-total">£${(item.finalPrice * item.quantity).toFixed(2)}</div>
                <button class="remove-item" data-index="${index}">Remove</button>
            `;
            cartItems.appendChild(cartItem);
        });
        
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', function() {
                const itemIndex = parseInt(this.getAttribute('data-index'));
                updateQuantity(itemIndex, -1);
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', function() {
                const itemIndex = parseInt(this.getAttribute('data-index'));
                updateQuantity(itemIndex, 1);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const itemIndex = parseInt(this.getAttribute('data-index'));
                removeFromCart(itemIndex);
            });
        });
    }
    
    const total = cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
    cartTotal.textContent = `£${total.toFixed(2)}`;
}

function updateQuantity(itemIndex, change) {
    if (cart[itemIndex]) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            removeFromCart(itemIndex);
        } else {
            updateCart();
        }
    }
}

function removeFromCart(itemIndex) {
    cart.splice(itemIndex, 1);
    updateCart();
}

function openCart() {
    cartModal.style.display = 'flex';
}

function closeCartModal() {
    cartModal.style.display = 'none';
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    alert('Thank you for your order! We will contact you shortly to confirm details.');
    cart = [];
    updateCart();
    closeCartModal();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--success)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Enhanced Admin functions with size-based topping pricing
function renderAdminItems() {
    adminItemsContainer.innerHTML = '';
    
    // Global Options Management Section
    const globalOptionsSection = document.createElement('div');
    globalOptionsSection.className = 'admin-item';
    globalOptionsSection.innerHTML = `
        <h4>Global Options Management</h4>
        <div class="option-management">
            <h5>Pizza Toppings (Size-Based Pricing)</h5>
            <div class="option-input-group">
                <input type="text" class="option-input" id="new-pizza-topping" placeholder="New pizza topping">
                <button class="add-option-btn" id="add-pizza-topping">Add Topping</button>
            </div>
            <div class="option-list" id="pizza-toppings-list">
                ${globalOptions.pizzaToppings.map((topping, index) => `
                    <div class="option-list-item">
                        <span>${topping.name}</span>
                        <button class="remove-option-btn" data-type="pizzaToppings" data-index="${index}">Remove</button>
                    </div>
                    <table class="topping-prices-table">
                        <tr>
                            <th>7" Price</th>
                            <th>10" Price</th>
                            <th>12" Price</th>
                            <th>14" Price</th>
                        </tr>
                        <tr>
                            <td><input type="number" class="price-input topping-price-input" data-topping="${index}" data-size="7" value="${topping.prices[7]}" step="0.01" min="0"></td>
                            <td><input type="number" class="price-input topping-price-input" data-topping="${index}" data-size="10" value="${topping.prices[10]}" step="0.01" min="0"></td>
                            <td><input type="number" class="price-input topping-price-input" data-topping="${index}" data-size="12" value="${topping.prices[12]}" step="0.01" min="0"></td>
                            <td><input type="number" class="price-input topping-price-input" data-topping="${index}" data-size="14" value="${topping.prices[14]}" step="0.01" min="0"></td>
                        </tr>
                    </table>
                `).join('')}
            </div>
            
            <h5>Calzone Toppings</h5>
            <div class="option-input-group">
                <input type="text" class="option-input" id="new-calzone-topping" placeholder="New calzone topping">
                <button class="add-option-btn" id="add-calzone-topping">Add Topping</button>
            </div>
            <div class="option-list" id="calzone-toppings-list">
                ${globalOptions.calzoneToppings.map((topping, index) => `
                    <div class="option-list-item">
                        <span>${topping}</span>
                        <button class="remove-option-btn" data-type="calzoneToppings" data-index="${index}">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <h5>Side Order Options</h5>
            
            <h6>Side Sizes</h6>
            <div class="option-input-group">
                <input type="text" class="option-input" id="new-side-size" placeholder="New side size">
                <input type="number" class="price-input" id="new-side-size-price" placeholder="Price" step="0.01" min="0">
                <button class="add-option-btn" id="add-side-size">Add Size</button>
            </div>
            <div class="option-list" id="side-sizes-list">
                ${globalOptions.sideSizes.map((size, index) => `
                    <div class="option-list-item">
                        <span>${size.name}</span>
                        <input type="number" class="price-input" value="${size.price}" step="0.01" min="0" data-type="sideSizes" data-index="${index}">
                        <button class="remove-option-btn" data-type="sideSizes" data-index="${index}">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <h6>Side Pieces</h6>
            <div class="option-input-group">
                <input type="text" class="option-input" id="new-side-piece" placeholder="New side piece option">
                <input type="number" class="price-input" id="new-side-piece-price" placeholder="Price" step="0.01" min="0">
                <button class="add-option-btn" id="add-side-piece">Add Piece Option</button>
            </div>
            <div class="option-list" id="side-pieces-list">
                ${globalOptions.sidePieces.map((piece, index) => `
                    <div class="option-list-item">
                        <span>${piece.name}</span>
                        <input type="number" class="price-input" value="${piece.price}" step="0.01" min="0" data-type="sidePieces" data-index="${index}">
                        <button class="remove-option-btn" data-type="sidePieces" data-index="${index}">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <h6>Side Seasonings</h6>
            <div class="option-input-group">
                <input type="text" class="option-input" id="new-side-seasoning" placeholder="New side seasoning">
                <input type="number" class="price-input" id="new-side-seasoning-price" placeholder="Price" step="0.01" min="0">
                <button class="add-option-btn" id="add-side-seasoning">Add Seasoning</button>
            </div>
            <div class="option-list" id="side-seasonings-list">
                ${globalOptions.sideSeasonings.map((seasoning, index) => `
                    <div class="option-list-item">
                        <span>${seasoning.name}</span>
                        <input type="number" class="price-input" value="${seasoning.price}" step="0.01" min="0" data-type="sideSeasonings" data-index="${index}">
                        <button class="remove-option-btn" data-type="sideSeasonings" data-index="${index}">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <h6>Side Sauces</h6>
            <div class="option-input-group">
                <input type="text" class="option-input" id="new-side-sauce" placeholder="New side sauce">
                <input type="number" class="price-input" id="new-side-sauce-price" placeholder="Price" step="0.01" min="0">
                <button class="add-option-btn" id="add-side-sauce">Add Sauce</button>
            </div>
            <div class="option-list" id="side-sauces-list">
                ${globalOptions.sideSauces.map((sauce, index) => `
                    <div class="option-list-item">
                        <span>${sauce.name}</span>
                        <input type="number" class="price-input" value="${sauce.price}" step="0.01" min="0" data-type="sideSauces" data-index="${index}">
                        <button class="remove-option-btn" data-type="sideSauces" data-index="${index}">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <h5>Stuffed Crust Pricing</h5>
            <table class="topping-prices-table">
                <tr>
                    <th>7" Price</th>
                    <th>10" Price</th>
                    <th>12" Price</th>
                    <th>14" Price</th>
                </tr>
                <tr>
                    <td><input type="number" class="price-input" id="crust-price-7" value="1.00" step="0.01" min="0"></td>
                    <td><input type="number" class="price-input" id="crust-price-10" value="1.50" step="0.01" min="0"></td>
                    <td><input type="number" class="price-input" id="crust-price-12" value="2.00" step="0.01" min="0"></td>
                    <td><input type="number" class="price-input" id="crust-price-14" value="2.50" step="0.01" min="0"></td>
                </tr>
            </table>
            
            <h5>Burger Salad Options</h5>
            <div class="option-input-group">
                <input type="text" class="option-input" id="new-burger-salad" placeholder="New burger salad">
                <button class="add-option-btn" id="add-burger-salad">Add Salad</button>
            </div>
            <div class="option-list" id="burger-salad-list">
                ${globalOptions.burgerSalad.map((salad, index) => `
                    <div class="option-list-item">
                        <span>${salad.name}</span>
                        <input type="number" class="price-input" value="${salad.price}" step="0.01" min="0" data-type="burgerSalad" data-index="${index}">
                        <button class="remove-option-btn" data-type="burgerSalad" data-index="${index}">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <h5>Burger Sauce Options</h5>
            <div class="option-input-group">
                <input type="text" class="option-input" id="new-burger-sauce" placeholder="New burger sauce">
                <button class="add-option-btn" id="add-burger-sauce">Add Sauce</button>
            </div>
            <div class="option-list" id="burger-sauce-list">
                ${globalOptions.burgerSauce.map((sauce, index) => `
                    <div class="option-list-item">
                        <span>${sauce.name}</span>
                        <input type="number" class="price-input" value="${sauce.price}" step="0.01" min="0" data-type="burgerSauce" data-index="${index}">
                        <button class="remove-option-btn" data-type="burgerSauce" data-index="${index}">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <h5>Kebab Salad Options</h5>
            <div class="option-input-group">
                <input type="text" class="option-input" id="new-kebab-salad" placeholder="New kebab salad">
                <button class="add-option-btn" id="add-kebab-salad">Add Salad</button>
            </div>
            <div class="option-list" id="kebab-salad-list">
                ${globalOptions.kebabSalad.map((salad, index) => `
                    <div class="option-list-item">
                        <span>${salad}</span>
                        <button class="remove-option-btn" data-type="kebabSalad" data-index="${index}">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <h5>Kebab Sauce Options</h5>
            <div class="option-input-group">
                <input type="text" class="option-input" id="new-kebab-sauce" placeholder="New kebab sauce">
                <button class="add-option-btn" id="add-kebab-sauce">Add Sauce</button>
            </div>
            <div class="option-list" id="kebab-sauce-list">
                ${globalOptions.kebabSauce.map((sauce, index) => `
                    <div class="option-list-item">
                        <span>${sauce}</span>
                        <button class="remove-option-btn" data-type="kebabSauce" data-index="${index}">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <h5>Deal Configuration</h5>
            <div class="deal-config">
                <h6>Family Pizza Deal Settings</h6>
                <div class="deal-config-item">
                    <input type="number" id="max-pizzas" value="2" min="1" max="10" class="price-input">
                    <label>Maximum Pizzas</label>
                </div>
                <div class="deal-config-item">
                    <input type="number" id="max-garlic-breads" value="1" min="0" max="5" class="price-input">
                    <label>Maximum Garlic Breads</label>
                </div>
                <div class="deal-config-item">
                    <input type="number" id="max-drinks" value="1" min="0" max="5" class="price-input">
                    <label>Maximum Drinks</label>
                </div>
                <button class="save-price-btn" id="save-deal-config">Save Deal Configuration</button>
            </div>
        </div>
    `;
    adminItemsContainer.appendChild(globalOptionsSection);

    // Add event listeners for global options
    document.getElementById('add-pizza-topping').addEventListener('click', function() {
        const input = document.getElementById('new-pizza-topping');
        const toppingName = input.value.trim();
        if (toppingName && !globalOptions.pizzaToppings.find(t => t.name === toppingName)) {
            globalOptions.pizzaToppings.push({
                name: toppingName,
                prices: {7: 0.50, 10: 1.00, 12: 1.50, 14: 2.00}
            });
            initializeAllOptions();
            renderAdminItems();
            loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
            input.value = '';
        }
    });

    document.getElementById('add-calzone-topping').addEventListener('click', function() {
        const input = document.getElementById('new-calzone-topping');
        const toppingName = input.value.trim();
        if (toppingName && !globalOptions.calzoneToppings.includes(toppingName)) {
            globalOptions.calzoneToppings.push(toppingName);
            initializeAllOptions();
            renderAdminItems();
            loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
            input.value = '';
        }
    });

    document.getElementById('add-side-size').addEventListener('click', function() {
        const nameInput = document.getElementById('new-side-size');
        const priceInput = document.getElementById('new-side-size-price');
        const sizeName = nameInput.value.trim();
        const sizePrice = parseFloat(priceInput.value) || 0;
        
        if (sizeName && !globalOptions.sideSizes.find(s => s.name === sizeName)) {
            globalOptions.sideSizes.push({
                name: sizeName,
                price: sizePrice
            });
            initializeAllOptions();
            renderAdminItems();
            loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
            nameInput.value = '';
            priceInput.value = '';
        }
    });

    document.getElementById('add-side-piece').addEventListener('click', function() {
        const nameInput = document.getElementById('new-side-piece');
        const priceInput = document.getElementById('new-side-piece-price');
        const pieceName = nameInput.value.trim();
        const piecePrice = parseFloat(priceInput.value) || 0;
        
        if (pieceName && !globalOptions.sidePieces.find(p => p.name === pieceName)) {
            globalOptions.sidePieces.push({
                name: pieceName,
                price: piecePrice
            });
            initializeAllOptions();
            renderAdminItems();
            loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
            nameInput.value = '';
            priceInput.value = '';
        }
    });

    document.getElementById('add-side-seasoning').addEventListener('click', function() {
        const nameInput = document.getElementById('new-side-seasoning');
        const priceInput = document.getElementById('new-side-seasoning-price');
        const seasoningName = nameInput.value.trim();
        const seasoningPrice = parseFloat(priceInput.value) || 0;
        
        if (seasoningName && !globalOptions.sideSeasonings.find(s => s.name === seasoningName)) {
            globalOptions.sideSeasonings.push({
                name: seasoningName,
                price: seasoningPrice
            });
            initializeAllOptions();
            renderAdminItems();
            loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
            nameInput.value = '';
            priceInput.value = '';
        }
    });

    document.getElementById('add-side-sauce').addEventListener('click', function() {
        const nameInput = document.getElementById('new-side-sauce');
        const priceInput = document.getElementById('new-side-sauce-price');
        const sauceName = nameInput.value.trim();
        const saucePrice = parseFloat(priceInput.value) || 0;
        
        if (sauceName && !globalOptions.sideSauces.find(s => s.name === sauceName)) {
            globalOptions.sideSauces.push({
                name: sauceName,
                price: saucePrice
            });
            initializeAllOptions();
            renderAdminItems();
            loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
            nameInput.value = '';
            priceInput.value = '';
        }
    });

    document.getElementById('add-burger-salad').addEventListener('click', function() {
        const input = document.getElementById('new-burger-salad');
        const saladName = input.value.trim();
        if (saladName && !globalOptions.burgerSalad.find(s => s.name === saladName)) {
            globalOptions.burgerSalad.push({
                name: saladName,
                price: 0
            });
            initializeAllOptions();
            renderAdminItems();
            loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
            input.value = '';
        }
    });

    document.getElementById('add-burger-sauce').addEventListener('click', function() {
        const input = document.getElementById('new-burger-sauce');
        const sauceName = input.value.trim();
        if (sauceName && !globalOptions.burgerSauce.find(s => s.name === sauceName)) {
            globalOptions.burgerSauce.push({
                name: sauceName,
                price: 0
            });
            initializeAllOptions();
            renderAdminItems();
            loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
            input.value = '';
        }
    });

    document.getElementById('add-kebab-salad').addEventListener('click', function() {
        addGlobalOption('kebabSalad', 'new-kebab-salad');
    });

    document.getElementById('add-kebab-sauce').addEventListener('click', function() {
        addGlobalOption('kebabSauce', 'new-kebab-sauce');
    });

    document.getElementById('save-deal-config').addEventListener('click', function() {
        saveDealConfiguration();
    });

    // Add event listeners for topping price changes
    document.querySelectorAll('.topping-price-input').forEach(input => {
        input.addEventListener('change', function() {
            const toppingIndex = parseInt(this.getAttribute('data-topping'));
            const size = parseInt(this.getAttribute('data-size'));
            const price = parseFloat(this.value);
            
            if (globalOptions.pizzaToppings[toppingIndex]) {
                globalOptions.pizzaToppings[toppingIndex].prices[size] = price;
                initializeAllOptions();
            }
        });
    });

    // Add event listeners for side option price changes
    document.querySelectorAll('.price-input[data-type="sideSizes"]').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const price = parseFloat(this.value);
            
            if (globalOptions.sideSizes[index]) {
                globalOptions.sideSizes[index].price = price;
                initializeAllOptions();
            }
        });
    });

    document.querySelectorAll('.price-input[data-type="sidePieces"]').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const price = parseFloat(this.value);
            
            if (globalOptions.sidePieces[index]) {
                globalOptions.sidePieces[index].price = price;
                initializeAllOptions();
            }
        });
    });

    document.querySelectorAll('.price-input[data-type="sideSeasonings"]').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const price = parseFloat(this.value);
            
            if (globalOptions.sideSeasonings[index]) {
                globalOptions.sideSeasonings[index].price = price;
                initializeAllOptions();
            }
        });
    });

    document.querySelectorAll('.price-input[data-type="sideSauces"]').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const price = parseFloat(this.value);
            
            if (globalOptions.sideSauces[index]) {
                globalOptions.sideSauces[index].price = price;
                initializeAllOptions();
            }
        });
    });

    // Add event listeners for burger option price changes
    document.querySelectorAll('.price-input[data-type="burgerSalad"]').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const price = parseFloat(this.value);
            
            if (globalOptions.burgerSalad[index]) {
                globalOptions.burgerSalad[index].price = price;
                initializeAllOptions();
            }
        });
    });

    document.querySelectorAll('.price-input[data-type="burgerSauce"]').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const price = parseFloat(this.value);
            
            if (globalOptions.burgerSauce[index]) {
                globalOptions.burgerSauce[index].price = price;
                initializeAllOptions();
            }
        });
    });

    // Add event listeners for crust price changes
    document.getElementById('crust-price-7').addEventListener('change', function() {
        updateCrustPrices();
    });
    document.getElementById('crust-price-10').addEventListener('change', function() {
        updateCrustPrices();
    });
    document.getElementById('crust-price-12').addEventListener('change', function() {
        updateCrustPrices();
    });
    document.getElementById('crust-price-14').addEventListener('change', function() {
        updateCrustPrices();
    });

    function updateCrustPrices() {
        const crustPrices = {
            7: parseFloat(document.getElementById('crust-price-7').value),
            10: parseFloat(document.getElementById('crust-price-10').value),
            12: parseFloat(document.getElementById('crust-price-12').value),
            14: parseFloat(document.getElementById('crust-price-14').value)
        };
        
        // Update all pizza crust options
        menuData.pizza.forEach(pizza => {
            const crustOption = pizza.options.crust.find(c => c.name === "Stuffed Crust");
            if (crustOption) {
                crustOption.sizePrices = crustPrices;
            }
        });
        
        showNotification('Crust prices updated!');
    }

    function addGlobalOption(optionType, inputId) {
        const input = document.getElementById(inputId);
        const value = input.value.trim();
        if (value && !globalOptions[optionType].includes(value)) {
            globalOptions[optionType].push(value);
            initializeAllOptions();
            renderAdminItems();
            loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
            input.value = '';
            showNotification('Option added successfully!');
        }
    }

    function saveDealConfiguration() {
        const pizzaDeal = menuData.deals.find(deal => deal.name === "Family Pizza Deal");
        if (pizzaDeal && pizzaDeal.dealConfig) {
            pizzaDeal.dealConfig.maxPizzas = parseInt(document.getElementById('max-pizzas').value);
            pizzaDeal.dealConfig.maxGarlicBreads = parseInt(document.getElementById('max-garlic-breads').value);
            pizzaDeal.dealConfig.maxDrinks = parseInt(document.getElementById('max-drinks').value);
        }
        showNotification('Deal configuration updated!');
    }

    // Regular menu items display
    const allItems = [];
    for (const category in menuData) {
        menuData[category].forEach(item => {
            allItems.push({...item, category});
        });
    }
    
    allItems.sort((a, b) => a.id - b.id);
    
    allItems.forEach(item => {
        const adminItem = document.createElement('div');
        adminItem.className = 'admin-item';
        
        let optionsHTML = '';
        if (Object.keys(item.options).length > 0) {
            optionsHTML = '<div class="price-edit-form">';
            optionsHTML += '<p><strong>Option Prices:</strong></p>';
            
            for (const optionType in item.options) {
                if (item.options[optionType].length === 0) continue;
                
                optionsHTML += `<p style="margin-top: 0.5rem; font-weight: 500;">${optionType.charAt(0).toUpperCase() + optionType.slice(1)}:</p>`;
                
                item.options[optionType].forEach((option, index) => {
                    // Don't show regular crust in admin
                    if (optionType === 'crust' && option.name === "Regular Crust") return;
                    
                    optionsHTML += `
                        <div class="price-input-group">
                            <label>${option.name}:</label>
                            <input type="number" class="price-input" value="${option.price}" step="0.01" min="0" 
                                   data-category="${item.category}" data-id="${item.id}" data-option-type="${optionType}" data-option-index="${index}">
                        </div>
                    `;
                });
            }
            
            optionsHTML += `<button class="save-price-btn" data-category="${item.category}" data-id="${item.id}">Save Option Prices</button>`;
            optionsHTML += '</div>';
        }
        
        adminItem.innerHTML = `
            <h4>${item.name}</h4>
            <p><strong>Category:</strong> ${item.category}</p>
            <div class="price-input-group">
                <label><strong>Base Price:</strong></label>
                <input type="number" class="price-input" value="${item.basePrice}" step="0.01" min="0" 
                       data-category="${item.category}" data-id="${item.id}" data-type="base">
            </div>
            <p>${item.description}</p>
            ${optionsHTML}
            <div class="admin-item-actions">
                <button class="btn-edit" data-id="${item.id}">Edit Item</button>
                <button class="btn-delete" data-id="${item.id}">Delete Item</button>
            </div>
        `;
        adminItemsContainer.appendChild(adminItem);
    });
}

// Admin functions
function addMenuItem() {
    const name = document.getElementById('item-name').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    const image = document.getElementById('item-image').value;
    const description = document.getElementById('item-description').value;
    
    const newId = Math.max(...Object.values(menuData).flat().map(item => item.id)) + 1;
    
    const newItem = {
        id: newId,
        name: name,
        basePrice: price,
        description: description,
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        options: {}
    };
    
    // Initialize basic options based on category
    if (category === 'pizza') {
        newItem.options = {
            size: [
                { name: "7\" Personal", inches: 7, price: 0 },
                { name: "10\" Small", inches: 10, price: 2.50 },
                { name: "12\" Medium", inches: 12, price: 4.50 },
                { name: "14\" Large", inches: 14, price: 6.50 }
            ],
            crust: [
                { name: "Regular Crust", price: 0 },
                { name: "Stuffed Crust", price: 1.50, sizeBased: true, sizePrices: {7: 1.00, 10: 1.50, 12: 2.00, 14: 2.50} }
            ],
            toppings: [],
            comment: [
                { name: "Special Instructions", price: 0, isTextInput: true }
            ]
        };
    } else if (category === 'burgers') {
        newItem.options = {
            portion: [
                { name: "1/4 lb", weight: 0.25, price: 0 },
                { name: "1/2 lb", weight: 0.5, price: 2.50 }
            ],
            combo: [
                { name: "Burger Only", price: 0 },
                { name: "Meal Deal", price: 4.00 }
            ],
            salad: [],
            sauce: [],
            drink: []
        };
    } else if (category === 'kebabs') {
        newItem.options = {
            salad: [],
            sauce: []
        };
    } else if (category === 'calzone') {
        newItem.options = {
            size: [
                { name: "10\" Small", inches: 10, price: 0 },
                { name: "12\" Medium", inches: 12, price: 2.00 },
                { name: "14\" Large", inches: 14, price: 4.00 }
            ],
            toppings: [],
            comment: [
                { name: "Special Instructions", price: 0, isTextInput: true }
            ]
        };
    } else if (category === 'garlicbread') {
        newItem.options = {
            size: [
                { name: "10\"", inches: 10, price: 0 },
                { name: "12\"", inches: 12, price: 1.50 },
                { name: "14\"", inches: 14, price: 2.50 }
            ]
        };
    } else if (category === 'sides') {
        newItem.options = {
            size: globalOptions.sideSizes,
            seasoning: globalOptions.sideSeasonings,
            sauce: globalOptions.sideSauces
        };
    } else if (category === 'appetizers') {
        newItem.options = {};
    } else if (category === 'drinks') {
        newItem.options = {
            size: [
                { name: "330ml Can", price: 0 },
                { name: "1.5L Bottle", price: 2.00 }
            ]
        };
    } else if (category === 'deals') {
        newItem.options = {
            pizzas: [],
            garlicBreads: [],
            drinks: []
        };
        newItem.dealConfig = {
            type: "pizza",
            allowedPizzaSizes: ["10\""],
            pizzaCount: 2,
            allowedGarlicBreadSizes: ["10\""],
            garlicBreadCount: 1,
            garlicBreadWithCheese: true,
            drinkCount: 1,
            drinkBottleOnly: true
        };
    }
    
    menuData[category].push(newItem);
    initializeAllOptions();
    renderAdminItems();
    loadMenuItems(category);
    adminForm.reset();
    showNotification('Item added successfully!');
}

function updateMenuItem() {
    if (!editingItemId) return;
    
    const name = document.getElementById('item-name').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    const image = document.getElementById('item-image').value;
    const description = document.getElementById('item-description').value;
    
    // Find and update the item
    for (const cat in menuData) {
        const itemIndex = menuData[cat].findIndex(item => item.id === editingItemId);
        if (itemIndex !== -1) {
            menuData[cat][itemIndex].name = name;
            menuData[cat][itemIndex].basePrice = price;
            menuData[cat][itemIndex].description = description;
            if (image) menuData[cat][itemIndex].image = image;
            break;
        }
    }
    
    renderAdminItems();
    loadMenuItems(category);
    cancelEdit();
    showNotification('Item updated successfully!');
}

function cancelEdit() {
    editingItemId = null;
    addItemBtn.style.display = 'inline-block';
    updateItemBtn.style.display = 'none';
    cancelEditBtn.style.display = 'none';
    adminForm.reset();
}

// Add event listeners for admin actions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-edit')) {
        const itemId = parseInt(e.target.getAttribute('data-id'));
        editMenuItem(itemId);
    }
    
    if (e.target.classList.contains('btn-delete')) {
        const itemId = parseInt(e.target.getAttribute('data-id'));
        deleteMenuItem(itemId);
    }
    
    if (e.target.classList.contains('save-price-btn')) {
        const category = e.target.getAttribute('data-category');
        const itemId = parseInt(e.target.getAttribute('data-id'));
        saveOptionPrices(category, itemId);
    }
    
    if (e.target.classList.contains('remove-option-btn')) {
        const optionType = e.target.getAttribute('data-type');
        const index = parseInt(e.target.getAttribute('data-index'));
        removeGlobalOption(optionType, index);
    }
});

function editMenuItem(itemId) {
    for (const category in menuData) {
        const item = menuData[category].find(item => item.id === itemId);
        if (item) {
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-price').value = item.basePrice;
            document.getElementById('item-category').value = category;
            document.getElementById('item-image').value = item.image;
            document.getElementById('item-description').value = item.description;
            
            editingItemId = itemId;
            addItemBtn.style.display = 'none';
            updateItemBtn.style.display = 'inline-block';
            cancelEditBtn.style.display = 'inline-block';
            break;
        }
    }
}

function deleteMenuItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        for (const category in menuData) {
            const itemIndex = menuData[category].findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                menuData[category].splice(itemIndex, 1);
                break;
            }
        }
        renderAdminItems();
        loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
        showNotification('Item deleted successfully!');
    }
}

function saveOptionPrices(category, itemId) {
    const item = menuData[category].find(item => item.id === itemId);
    if (!item) return;
    
    // Update base price
    const basePriceInput = document.querySelector(`.price-input[data-category="${category}"][data-id="${itemId}"][data-type="base"]`);
    if (basePriceInput) {
        item.basePrice = parseFloat(basePriceInput.value);
    }
    
    // Update option prices
    const optionInputs = document.querySelectorAll(`.price-input[data-category="${category}"][data-id="${itemId}"]:not([data-type="base"])`);
    optionInputs.forEach(input => {
        const optionType = input.getAttribute('data-option-type');
        const optionIndex = parseInt(input.getAttribute('data-option-index'));
        
        if (item.options[optionType] && item.options[optionType][optionIndex]) {
            item.options[optionType][optionIndex].price = parseFloat(input.value);
        }
    });
    
    showNotification('Prices updated successfully!');
}

function removeGlobalOption(optionType, index) {
    if (confirm('Are you sure you want to remove this option?')) {
        globalOptions[optionType].splice(index, 1);
        initializeAllOptions();
        renderAdminItems();
        loadMenuItems(document.querySelector('.category-tab.active').getAttribute('data-category'));
        showNotification('Option removed successfully!');
    }
}
