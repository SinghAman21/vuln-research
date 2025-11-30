
const users = [
    { id: 1, username: "admin", password: "admin123", role: "manager" },
    { id: 2, username: "demo", password: "password", role: "customer" }
];

const menuItems = [
    { id: 1, name: "Truffle Risotto", description: "Creamy arborio rice with black truffle and parmesan", price: 25.00 },
    { id: 2, name: "Lobster Bisque", description: "Rich and creamy soup with fresh lobster chunks", price: 18.00 },
    { id: 3, name: "Beef Wellington", description: "Tender beef fillet wrapped in puff pastry with mushroom duxelles", price: 35.00 },
    { id: 4, name: "Crème Brûlée", description: "Classic French dessert with a caramelized sugar crust", price: 12.00 },
    { id: 5, name: "Coq au Vin", description: "Chicken braised with wine, lardons, mushrooms, and garlic", price: 22.00 }
];

const orders = [
    { id: 1, user_id: 2, item_id: 1, quantity: 2, created_at: new Date().toISOString() },
    { id: 2, user_id: 2, item_id: 4, quantity: 1, created_at: new Date().toISOString() }
];

// Helper to simulate auto-increment ID
const getNextId = (collection) => {
    return collection.length > 0 ? Math.max(...collection.map(i => i.id)) + 1 : 1;
};

// export const fakeData = {
exports.fakeData = {
    users: {
        find: (username, password) => {
            // VULNERABILITY: Simulate SQL Injection bypass
            // If username contains specific SQL injection patterns, return admin user
            if (username.includes("' OR '1'='1") || username.includes("' OR 1=1")) {
                return users.find(u => u.username === 'admin');
            }
            return users.find(u => u.username === username && u.password === password);
        },
        findById: (id) => users.find(u => u.id === parseInt(id)),
        getAll: () => users,
        create: (username, password, role) => {
            const newUser = {
                id: getNextId(users),
                username,
                password,
                role: role || 'customer',
                created_at: new Date().toISOString()
            };
            users.push(newUser);
            return newUser;
        }
    },
    menu: {
        getAll: () => menuItems,
        getById: (id) => menuItems.find(i => i.id === parseInt(id)),
        search: (term) => menuItems.filter(i => 
            i.name.toLowerCase().includes(term.toLowerCase()) || 
            i.description.toLowerCase().includes(term.toLowerCase())
        ),
        add: (item) => {
            const newItem = { id: getNextId(menuItems), ...item, price: parseFloat(item.price) };
            menuItems.push(newItem);
            return newItem;
        },
        update: (id, updates) => {
            const index = menuItems.findIndex(i => i.id === parseInt(id));
            if (index !== -1) {
                menuItems[index] = { ...menuItems[index], ...updates, price: parseFloat(updates.price) };
                return true;
            }
            return false;
        },
        delete: (id) => {
            const index = menuItems.findIndex(i => i.id === parseInt(id));
            if (index !== -1) {
                menuItems.splice(index, 1);
                return true;
            }
            return false;
        }
    },
    orders: {
        getAll: () => {
            return orders.map(o => {
                const item = menuItems.find(i => i.id === o.item_id);
                const user = users.find(u => u.id === o.user_id);
                return {
                    ...o,
                    item_name: item ? item.name : 'Unknown Item',
                    username: user ? user.username : 'Unknown User'
                };
            });
        },
        findById: (id) => {
            const order = orders.find(o => o.id === parseInt(id));
            if (!order) return null;
            const item = menuItems.find(i => i.id === order.item_id);
            const user = users.find(u => u.id === order.user_id);
            return {
                ...order,
                item_name: item ? item.name : 'Unknown Item',
                username: user ? user.username : 'Unknown User'
            };
        },
        getById: (id) => {
            return orders.find(o => o.id === parseInt(id));
        },
        getByUser: (userId) => {
            return orders
                .filter(o => o.user_id === parseInt(userId))
                .map(o => {
                    const item = menuItems.find(i => i.id === o.item_id);
                    return {
                        ...o,
                        item_name: item ? item.name : 'Unknown Item'
                    };
                });
        },
        add: (order) => {
            const newOrder = { 
                id: getNextId(orders), 
                ...order, 
                created_at: new Date().toISOString() 
            };
            orders.push(newOrder);
            return newOrder;
        },
        delete: (id) => {
            const index = orders.findIndex(o => o.id === parseInt(id));
            if (index !== -1) {
                orders.splice(index, 1);
                return true;
            }
            return false;
        }
    }
};
