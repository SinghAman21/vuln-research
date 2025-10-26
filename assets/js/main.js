// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close');
const menuCategories = document.querySelectorAll('.menu-category');
const menuItems = document.getElementById('menuItems');
const reservationForm = document.getElementById('reservationForm');

// Sample menu items data
const menuData = {
    starters: [
        {
            name: 'French Onion Soup',
            description: 'Classic soup with caramelized onions, beef broth, and melted Gruyère cheese',
            price: 12.99,
            image: 'assets/images/french-onion-soup.jpg'
        },
        {
            name: 'Escargots de Bourgogne',
            description: 'Burgundy snails in garlic-herb butter',
            price: 16.99,
            image: 'assets/images/escargots.jpg'
        }
    ],
    'main-courses': [
        {
            name: 'Coq au Vin',
            description: 'Braised chicken in red wine with mushrooms and pearl onions',
            price: 28.99,
            image: 'assets/images/coq-au-vin.jpg'
        },
        {
            name: 'Beef Bourguignon',
            description: 'Classic French beef stew with red wine, mushrooms, and pearl onions',
            price: 32.99,
            image: 'assets/images/beef-bourguignon.jpg'
        }
    ],
    desserts: [
        {
            name: 'Crème Brûlée',
            description: 'Classic vanilla custard with caramelized sugar top',
            price: 10.99,
            image: 'assets/images/creme-brulee.jpg'
        },
        {
            name: 'Chocolate Soufflé',
            description: 'Light and airy chocolate dessert served with vanilla ice cream',
            price: 12.99,
            image: 'assets/images/chocolate-souffle.jpg'
        }
    ],
    drinks: [
        {
            name: 'French Red Wine',
            description: 'Selection of premium French red wines',
            price: 14.99,
            image: 'assets/images/red-wine.jpg'
        },
        {
            name: 'Champagne',
            description: 'Fine French champagne',
            price: 18.99,
            image: 'assets/images/champagne.jpg'
        }
    ]
};

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Modal handlers
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == loginModal) {
        loginModal.style.display = 'none';
    }
});

// Menu category selection
menuCategories.forEach(category => {
    category.addEventListener('click', () => {
        // Remove active class from all categories
        menuCategories.forEach(cat => cat.classList.remove('active'));
        // Add active class to clicked category
        category.classList.add('active');
        // Load menu items for selected category
        loadMenuItems(category.dataset.category);
    });
});

// Load menu items function
function loadMenuItems(category) {
    const items = menuData[category];
    let html = '';

    items.forEach(item => {
        html += `
            <div class="menu-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-item-content">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <p>${item.description}</p>
                    <p class="menu-item-price">$${item.price.toFixed(2)}</p>
                </div>
            </div>
        `;
    });

    menuItems.innerHTML = html;
}

// Initialize menu with starters
loadMenuItems('starters');

// Intentionally vulnerable reservation form submission
// No input validation or sanitization
reservationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(reservationForm);
    const reservationData = {};
    formData.forEach((value, key) => {
        reservationData[key] = value;
    });

    try {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservationData)
        });

        const data = await response.json();
        if (data.success) {
            alert('Thank you for your reservation! We will contact you shortly to confirm.');
            reservationForm.reset();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Login form handler
async function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (data.success) {
            loginModal.style.display = 'none';
            alert('Login successful!');
            // Handle successful login (e.g., show admin panel)
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Intentionally vulnerable newsletter form handler
// No email validation or sanitization
document.querySelector('.newsletter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    try {
        const response = await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (data.success) {
            alert('Thank you for subscribing to our newsletter!');
            e.target.reset();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});