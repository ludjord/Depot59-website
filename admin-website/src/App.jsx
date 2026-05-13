import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Clock, Lock, LogOut, TrendingUp, Edit } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'orders', or 'sales'
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Menu Item Form State
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const fetchMenu = () => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error(err));
  };

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        // Sort newest first
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'menu') {
        fetchMenu();
      } else {
        fetchOrders();
      }
    }
  }, [activeTab, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
          setIsAuthenticated(true);
          setLoginError('');
        } else {
          setLoginError(data.error || 'Login gagal');
        }
      })
      .catch(err => {
        console.error(err);
        setLoginError('Terjadi kesalahan pada server.');
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const openAddModal = () => {
    setEditMode(false);
    setEditId(null);
    setName('');
    setPrice('');
    setDescription('');
    setImage('');
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditMode(true);
    setEditId(item.id);
    setName(item.name);
    setPrice(item.price);
    setDescription(item.description);
    setImage(item.image);
    setIsModalOpen(true);
  };

  const handleSaveMenu = (e) => {
    e.preventDefault();
    
    const url = editMode ? `/api/menu/${editId}` : '/api/menu';
    const method = editMode ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, description, image })
    })
      .then(res => res.json())
      .then(() => {
        setIsModalOpen(false);
        setName('');
        setPrice('');
        setDescription('');
        setImage('');
        fetchMenu();
      })
      .catch(err => console.error(err));
  };

  const handleDeleteMenu = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
      fetch(`/api/menu/${id}`, { method: 'DELETE' })
        .then(() => fetchMenu())
        .catch(err => console.error(err));
    }
  };

  const handleUpdateOrderStatus = (id, status) => {
    fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(() => fetchOrders())
      .catch(err => console.error(err));
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Lock size={40} color="var(--primary)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
            <h2>Login Admin</h2>
            <p style={{ fontSize: '0.875rem' }}>Gunakan <b>admin@umkm.com</b> dan <b>admin123</b></p>
          </div>
          
          {loginError && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}>
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Sales History Aggregation ---
  const completedOrders = orders.filter(o => o.status === 'Selesai');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Group by date for daily sales (simple grouping)
  const salesByDate = completedOrders.reduce((acc, order) => {
    const dateStr = new Date(order.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = 0;
    acc[dateStr] += order.totalAmount;
    return acc;
  }, {});

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Panel Admin Depot 59</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--card-bg)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', overflowX: 'auto' }}>
            <button 
              className={`btn ${activeTab === 'menu' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('menu')}
              style={{ padding: '0.5rem 1rem' }}
            >
              Kelola Menu
            </button>
            <button 
              className={`btn ${activeTab === 'orders' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('orders')}
              style={{ padding: '0.5rem 1rem' }}
            >
              Daftar Pesanan
            </button>
            <button 
              className={`btn ${activeTab === 'sales' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('sales')}
              style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
            >
              <TrendingUp size={16} /> Riwayat Penjualan
            </button>
          </div>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleLogout}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </div>

      {activeTab === 'menu' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Daftar Menu</h2>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Tambah Menu Baru
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Gambar</th>
                  <th>Nama Menu</th>
                  <th>Harga</th>
                  <th>Deskripsi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                    </td>
                    <td style={{ fontWeight: '600' }}>{item.name}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: '600' }}>Rp {item.price.toLocaleString('id-ID')}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--text-dark)', borderColor: 'var(--border)' }} onClick={() => handleEditClick(item)} title="Edit Menu">
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDeleteMenu(item.id)} title="Hapus Menu">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {menuItems.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Belum ada menu yang ditambahkan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>Daftar Pesanan</h2>
          
          <div className="grid lg:grid-cols-2 grid-cols-1">
            {orders.map(order => (
              <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{order.customerName}</h3>
                    <p style={{ fontSize: '0.875rem' }}>Meja: {order.tableNumber} • ID: #{order.id}</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{new Date(order.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    {order.status === 'Pending' ? (
                      <span className="badge badge-pending" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> Menunggu
                      </span>
                    ) : (
                      <span className="badge badge-completed" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle size={12} /> Selesai
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Detail Pesanan:</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {order.items.map((item, index) => (
                      <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                        <span>{item.quantity}x {item.name}</span>
                        <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', fontWeight: '700', fontSize: '1.125rem' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary)' }}>Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {order.status === 'Pending' && (
                  <button 
                    className="btn btn-outline" 
                    style={{ width: '100%', borderColor: 'var(--success)', color: 'var(--success)' }}
                    onClick={() => handleUpdateOrderStatus(order.id, 'Selesai')}
                  >
                    Tandai Selesai
                  </button>
                )}
              </div>
            ))}
            {orders.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-light)', backgroundColor: 'var(--card-bg)', borderRadius: '1rem' }}>
                Belum ada pesanan masuk.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>Ringkasan Penjualan</h2>

          <div className="grid md:grid-cols-2 grid-cols-1" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--primary)', color: 'white' }}>
              <span style={{ fontSize: '1.125rem', marginBottom: '0.5rem', opacity: 0.9 }}>Total Pendapatan (Keseluruhan)</span>
              <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>Rp {totalRevenue.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Pendapatan Harian</h3>
              {Object.keys(salesByDate).length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {Object.entries(salesByDate).map(([date, amount]) => (
                    <li key={date} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: '500' }}>{date}</span>
                      <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Rp {amount.toLocaleString('id-ID')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-light)' }}>Belum ada data penjualan selesai.</p>
              )}
            </div>
          </div>

          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Daftar Pesanan Selesai</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>ID Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Total Tagihan</th>
                </tr>
              </thead>
              <tbody>
                {completedOrders.map(order => (
                  <tr key={order.id}>
                    <td>{new Date(order.createdAt).toLocaleString('id-ID')}</td>
                    <td>#{order.id}</td>
                    <td style={{ fontWeight: '600' }}>{order.customerName}</td>
                    <td style={{ color: 'var(--success)', fontWeight: '700' }}>Rp {order.totalAmount.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {completedOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Belum ada pesanan yang selesai.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Menu Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editMode ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveMenu}>
              <div className="form-group">
                <label className="form-label">Nama Menu *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Harga (Rp) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL Gambar</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://example.com/image.jpg"
                  value={image} 
                  onChange={e => setImage(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{editMode ? 'Simpan Perubahan' : 'Simpan Menu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
