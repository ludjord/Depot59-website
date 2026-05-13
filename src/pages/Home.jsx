import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Search, Utensils } from 'lucide-react';

export default function Home() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState(null); // null, 'loading', 'success'

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error(err));
  }, []);

  const filteredMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing.quantity === 1) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0 || !customerName) return;

    setCheckoutStatus('loading');
    
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        customerName,
        tableNumber,
        totalAmount
      })
    })
      .then(res => res.json())
      .then(() => {
        setCheckoutStatus('success');
        setCart([]);
        setCustomerName('');
        setTableNumber('');
        setTimeout(() => setCheckoutStatus(null), 3000);
      })
      .catch(err => {
        console.error(err);
        setCheckoutStatus(null);
      });
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>Depot 59</h1>
        <p>100% Halal No Pork Chinese Food. Nikmati kelezatan masakan khas Chinese yang otentik, dijamin halal dan menggugah selera!</p>
      </div>

      <div className="shop-layout">
        {/* Menu Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Utensils /> Menu Tersedia
            </h2>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', width: '1.25rem', height: '1.25rem' }} />
              <input 
                type="text" 
                placeholder="Cari makanan..." 
                className="form-control"
                style={{ paddingLeft: '2.5rem', width: '250px' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
            {filteredMenu.map(item => (
              <div key={item.id} className="card">
                <img src={item.image} alt={item.name} className="card-image" />
                <div className="card-content">
                  <h3 className="card-title">{item.name}</h3>
                  <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="card-price">Rp {item.price.toLocaleString('id-ID')}</span>
                    <button className="btn btn-primary" onClick={() => addToCart(item)} style={{ padding: '0.5rem 1rem' }}>
                      <Plus size={16} /> Tambah
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredMenu.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                Tidak ada menu yang sesuai dengan pencarian Anda.
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div>
          <div className="cart-sidebar">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <ShoppingCart /> Keranjang
            </h2>

            {cart.length === 0 ? (
              <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem 0' }}>Keranjang masih kosong.</p>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">Rp {item.price.toLocaleString('id-ID')}</div>
                      </div>
                      <div className="cart-item-actions">
                        <button className="cart-btn" onClick={() => removeFromCart(item.id)}><Minus size={14} /></button>
                        <span style={{ width: '20px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                        <button className="cart-btn" onClick={() => addToCart(item)}><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Total:</span>
                  <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nama Pelanggan *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Masukkan nama Anda"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Meja</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Opsional"
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
                    disabled={!customerName || checkoutStatus === 'loading'}
                    onClick={handleCheckout}
                  >
                    {checkoutStatus === 'loading' ? 'Memproses...' : 'Pesan Sekarang'}
                  </button>
                  
                  {checkoutStatus === 'success' && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#d1fae5', color: '#059669', borderRadius: '0.5rem', textAlign: 'center' }}>
                      Pesanan berhasil dibuat!
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
