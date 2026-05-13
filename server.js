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
  { id: 1, name: 'Fuyunghai Ayam Saus Asam Manis', price: 35000, description: 'Telur dadar tebal ala Chinese dengan daging ayam cincang, sayuran, disiram saus asam manis spesial.', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'Sapo Tahu Seafood', price: 45000, description: 'Tahu sutra lembut dimasak dalam hot plate dengan udang, cumi, jamur, dan sayuran.', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Mie Goreng Ulang Tahun', price: 38000, description: 'Mie goreng khas Chinese Food dengan telur puyuh, ayam, udang, dan sayuran. Melambangkan umur panjang.', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400' },
  { id: 4, name: 'Ayam Koloke (Asam Manis)', price: 40000, description: 'Potongan ayam filet goreng tepung renyah yang dimasak dengan saus asam manis pedas nanas.', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=400' },
  { id: 5, name: 'Nasi Goreng Yang Chow (Halal)', price: 35000, description: 'Nasi goreng putih ala Hong Kong tanpa kecap, dengan udang, kacang polong, dan telur.', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=400' },
  { id: 6, name: 'Sapi Lada Hitam (Black Pepper)', price: 55000, description: 'Irisan daging sapi empuk ditumis dengan paprika dan saus lada hitam khas oriental.', image: 'https://images.unsplash.com/photo-1544025162-811114210bfa?auto=format&fit=crop&q=80&w=400' },
  { id: 7, name: 'Capcay Goreng Seafood', price: 38000, description: 'Tumis 10 macam sayuran segar dipadukan dengan bakso ikan, udang, dan kekian halal.', image: 'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&q=80&w=400' },
  { id: 8, name: 'Dimsum Ayam Udang (Isi 4)', price: 25000, description: 'Dimsum siomay kukus hangat dan lembut, terbuat dari olahan ayam dan udang cincang.', image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400' },
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
app.use('/admin', express.static(path.join(__dirname, 'dist/admin')));
app.use('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/admin', 'index.html'));
});

// 2. Serve Buyer App Static Files (Catch-all for root)
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Only listen if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
