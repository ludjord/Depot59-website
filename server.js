import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, 'dist')));

// In-memory data store for the UMKM application
let menuItems = [
  { id: 1, name: 'Nasi Goreng Spesial', price: 25000, description: 'Nasi goreng dengan telur, ayam, dan sayuran.', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'Mie Goreng Seafood', price: 30000, description: 'Mie goreng dengan udang, cumi, dan bumbu rempah.', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Es Teh Manis', price: 5000, description: 'Es teh manis segar pelepas dahaga.', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400' },
];

let orders = [];

// GET all menu items
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

// POST a new menu item
app.post('/api/menu', (req, res) => {
  const { name, price, description, image } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const newItem = {
    id: menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1,
    name,
    price: Number(price),
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'
  };

  menuItems.push(newItem);
  res.status(201).json(newItem);
});

// DELETE a menu item
app.delete('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  menuItems = menuItems.filter(item => item.id !== id);
  res.status(200).json({ message: 'Menu item deleted successfully' });
});

// UPDATE a menu item
app.put('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, description, image } = req.body;
  
  const itemIndex = menuItems.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  menuItems[itemIndex] = {
    ...menuItems[itemIndex],
    name,
    price: Number(price),
    description: description || '',
    image: image || menuItems[itemIndex].image
  };

  res.json(menuItems[itemIndex]);
});

// POST a new order
app.post('/api/orders', (req, res) => {
  const { items, customerName, tableNumber, totalAmount } = req.body;

  if (!items || items.length === 0 || !customerName) {
    return res.status(400).json({ error: 'Items and customerName are required' });
  }

  const newOrder = {
    id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
    items,
    customerName,
    tableNumber: tableNumber || '-',
    totalAmount,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// GET all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.status = status;
  res.json(order);
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // Default hardcoded credentials for demo
  if (email === 'admin@umkm.com' && password === 'admin123') {
    res.json({ token: 'admin-token-123' });
  } else {
    res.status(401).json({ error: 'Email atau password salah' });
  }
});

// --- Deployment Configuration ---

// 1. Serve Admin App Static Files
app.use('/admin', express.static(path.join(__dirname, 'admin-website/dist')));
app.use('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-website/dist', 'index.html'));
});

// 2. Serve Buyer App Static Files (Catch-all for root)
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
