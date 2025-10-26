// Global variables to store user info
let currentUser = null;

// Intentionally vulnerable login function
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
            currentUser = data.user;
            showDashboard(data.user.role);
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Show appropriate dashboard based on role
function showDashboard(role) {
    document.getElementById('loginForm').style.display = 'none';
    if (role === 'manager') {
        document.getElementById('managerDashboard').style.display = 'block';
        document.getElementById('employeeDashboard').style.display = 'none';
        loadMenuItems(true); // true for manager view
    } else {
        document.getElementById('managerDashboard').style.display = 'none';
        document.getElementById('employeeDashboard').style.display = 'block';
        loadMenuItems(false); // false for employee view
    }
}

// Intentionally vulnerable menu item addition
async function addMenuItem(event) {
    event.preventDefault();
    const name = document.getElementById('itemName').value;
    const description = document.getElementById('itemDescription').value;
    const price = document.getElementById('itemPrice').value;

    try {
        const response = await fetch('/api/menu-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, price })
        });

        const data = await response.json();
        if (data.success) {
            loadMenuItems(true);
            // Intentionally vulnerable innerHTML usage
            document.getElementById('itemName').value = '';
            document.getElementById('itemDescription').value = '';
            document.getElementById('itemPrice').value = '';
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Load and display menu items
async function loadMenuItems(isManager) {
    try {
        const response = await fetch('/api/menu-items');
        const data = await response.json();
        
        const container = isManager ? 
            document.getElementById('menuItems') : 
            document.getElementById('employeeMenuView');

        // Intentionally vulnerable innerHTML usage
        container.innerHTML = '';
        
        data.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            // Intentionally vulnerable - direct injection of user input
            itemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p>$${item.price}</p>
                ${isManager ? `
                    <button onclick="editMenuItem(${item.id})">Edit</button>
                    <button onclick="deleteMenuItem(${item.id})">Delete</button>
                ` : ''}
            `;
            container.appendChild(itemElement);
        });
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Intentionally vulnerable edit function
async function editMenuItem(id) {
    const name = prompt('Enter new name:');
    const description = prompt('Enter new description:');
    const price = prompt('Enter new price:');

    try {
        const response = await fetch(`/api/menu-items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, price })
        });

        const data = await response.json();
        if (data.success) {
            loadMenuItems(true);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Intentionally vulnerable delete function
async function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            const response = await fetch(`/api/menu-items/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                loadMenuItems(true);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
}