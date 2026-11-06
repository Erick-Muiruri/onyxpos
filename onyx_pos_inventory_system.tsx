import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, Scissors, Monitor, IceCream, LayoutDashboard, Package, 
  Receipt, TrendingUp, DollarSign, Users, Settings, LogOut, Download, 
  Upload, Plus, Trash2, Edit, Check, AlertTriangle, RefreshCw, Search, 
  Printer, Globe, Lock, Shield, Eye, FileText, CheckCircle2, ChevronRight,
  Sparkles, Calendar, Tag, CreditCard, ArrowUpRight, ArrowDownRight, Database
} from 'lucide-react';

// ==========================================
// 1. NATIVE BROWSER INDEXEDDB WRAPPER
// ==========================================
const DB_NAME = 'OnyxPosDB';
const DB_VERSION = 1;

const openNativeDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('products')) db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('services')) db.createObjectStore('services', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('sales')) db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('expenses')) db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('staff')) db.createObjectStore('staff', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

const dbOp = {
  async getAll(storeName) {
    const db = await openNativeDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },
  async add(storeName, item) {
    const db = await openNativeDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.add(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async bulkAdd(storeName, items) {
    const db = await openNativeDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach(item => store.add(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  async update(storeName, item) {
    const db = await openNativeDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async delete(storeName, id) {
    const db = await openNativeDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
  async count(storeName) {
    const items = await this.getAll(storeName);
    return items.length;
  }
};

// ==========================================
// 2. DICTIONARY & TRANSLATIONS (EN / SW)
// ==========================================
const translations = {
  EN: {
    dashboard: "Dashboard",
    pos: "POS Sales",
    inventory: "Stock & Services",
    pnl: "Profit & Loss",
    expenses: "Expenses",
    backup: "Backup & Data",
    login: "Login",
    logout: "Logout",
    todaySales: "Today's Sales",
    weeklySales: "This Week",
    monthlySales: "This Month",
    totalProfit: "Net Profit",
    lowStock: "Low Stock Items",
    cosmetics: "Cosmetics Shop",
    salon: "Salon & Nails",
    cyber: "Cyber Cafe",
    icecream: "Ice Cream & Pops",
    selectSubShop: "Select Sub-Shop",
    cart: "Current Cart",
    total: "Total",
    checkout: "Complete Sale",
    cash: "Cash",
    mpesa: "M-Pesa",
    credit: "Store Credit",
    staff: "Staff Member",
    discount: "Discount",
    receiptTitle: "Sales Receipt",
    printReceipt: "Print Thermal Receipt",
    downloadReceipt: "Download PDF",
    addStock: "Add New Item",
    buyingPrice: "Buying Price (KES)",
    sellingPrice: "Selling Price (KES)",
    quantity: "Quantity",
    barcode: "Barcode/SKU",
    expiryDate: "Expiry Date",
    supplier: "Supplier",
    expensesTitle: "Track Expenses",
    addExpense: "Add Expense",
    category: "Category",
    amount: "Amount (KES)",
    backupTitle: "Database Backup & Restore",
    exportJSON: "Export Backup (JSON)",
    importJSON: "Restore Backup (JSON)",
    exportCSV: "Export Sales (CSV)",
    cloudSyncTitle: "Cloud Database Auto-Sync",
    cloudEndpoint: "Cloud API / Supabase / Webhook URL",
    apiKeyLabel: "API Key / Bearer Token",
    syncNow: "Sync Now to Cloud",
    syncing: "Syncing...",
    clearData: "Reset All System Data",
    adminOnly: "Admin Access Required",
    enterPin: "Enter Your Security PIN",
    pinError: "Invalid Security PIN",
    switchLanguage: "Swahili",
    allShops: "All Combined Shops",
    searchPlaceholder: "Search items or barcode...",
    noItemsCart: "Cart is empty. Click items to add.",
    saleSuccess: "Sale saved successfully!",
    lowStockAlert: "Items need immediate restocking!",
    expiredAlert: "Expired products detected!",
  },
  SW: {
    dashboard: "Eneo Kuu",
    pos: "Mauzo (POS)",
    inventory: "Akiba & Huduma",
    pnl: "Faida & Hasara",
    expenses: "Matumizi",
    backup: "Hifadhi ya Data",
    login: "Ingia",
    logout: "Toka",
    todaySales: "Mauzo ya Leo",
    weeklySales: "Wiki Hii",
    monthlySales: "Mwezi Huu",
    totalProfit: "Faida Halisi",
    lowStock: "Bidhaa Chache",
    cosmetics: "Duka la Vipodozi",
    salon: "Saluni & Kucha",
    cyber: "Cyber Cafe",
    icecream: "Iskrim & Pops",
    selectSubShop: "Chagua Duka",
    cart: "Kikapu cha Mauzo",
    total: "Jumla",
    checkout: "Kamilisha Mauzo",
    cash: "Pesa Taslimu",
    mpesa: "M-Pesa",
    credit: "Kopo / Mkopo",
    staff: "Mhudumu",
    discount: "Punguzo",
    receiptTitle: "Stakabadhi ya Mauzo",
    printReceipt: "Chapisha Stakabadhi",
    downloadReceipt: "Pakua PDF",
    addStock: "Ongeza Bidhaa",
    buyingPrice: "Bei ya Kununua (KES)",
    sellingPrice: "Bei ya Kuuza (KES)",
    quantity: "Idadi / Kiasi",
    barcode: "Nambari ya Pau (Barcode)",
    expiryDate: "Tarehe ya Kuisha",
    supplier: "Muuzaji",
    expensesTitle: "Nyaraka za Matumizi",
    addExpense: "Weka Matumizi",
    category: "Kipengele",
    amount: "Kiasi (KES)",
    backupTitle: "Hifadhi na Kurudisha Data",
    exportJSON: "Pakua Hifadhi (JSON)",
    importJSON: "Rejesha Hifadhi (JSON)",
    exportCSV: "Pakua Mauzo (CSV)",
    cloudSyncTitle: "Usawazishaji wa Data Mtandaoni (Cloud)",
    cloudEndpoint: "Anwani ya Cloud / Supabase API",
    apiKeyLabel: "Siri ya API (API Key)",
    syncNow: "Weka Kwenye Cloud Sasa",
    syncing: "Inaweka...",
    clearData: "Futa Data Zote",
    adminOnly: "Inahitaji Ruhusa ya Admin",
    enterPin: "Weka PIN ya Usalama",
    pinError: "PIN Si Sahihi",
    switchLanguage: "English",
    allShops: "Maduka Yote Pamoja",
    searchPlaceholder: "Tafuta bidhaa au namba ya pau...",
    noItemsCart: "Kikapu kiko wazi. Bofya bidhaa kuongeza.",
    saleSuccess: "Mauzo yamehifadhiwa vyema!",
    lowStockAlert: "Bidhaa zinahitaji kuongezwa mara moja!",
    expiredAlert: "Kuna bidhaa zilizopitwa na wakati!",
  }
};

// ==========================================
// 3. SEEDING & DUMMY DATA FOR TESTING
// ==========================================
const seedInitialData = async () => {
  const productCount = await dbOp.count('products');
  if (productCount === 0) {
    const initialProducts = [
      { name: "Nivea Body Lotion 400ml", subShop: "cosmetics", category: "Lotions", buyingPrice: 450, sellingPrice: 650, quantity: 24, minThreshold: 5, expiryDate: "2025-12-31", barcode: "60010873" },
      { name: "Maybelline Matte Foundation", subShop: "cosmetics", category: "Makeup", buyingPrice: 1200, sellingPrice: 1800, quantity: 8, minThreshold: 3, expiryDate: "2026-06-30", barcode: "4155442" },
      { name: "Shampoo Shampoo Gallon 5L", subShop: "salon", category: "Consumables", buyingPrice: 1500, sellingPrice: 2200, quantity: 3, minThreshold: 2, expiryDate: "2026-10-15" },
      { name: "Gel Polish Red Velvet", subShop: "salon", category: "Consumables", buyingPrice: 350, sellingPrice: 600, quantity: 15, minThreshold: 4, expiryDate: "2026-08-20" },
      { name: "Vanilla Cone Ice Cream", subShop: "icecream", category: "Cones", buyingPrice: 50, sellingPrice: 100, quantity: 45, minThreshold: 10, expiryDate: "2025-05-10" },
      { name: "Strawberry Ice Pop", subShop: "icecream", category: "Pops", buyingPrice: 20, sellingPrice: 50, quantity: 80, minThreshold: 15, expiryDate: "2025-06-01" },
    ];
    await dbOp.bulkAdd('products', initialProducts);
  }

  const serviceCount = await dbOp.count('services');
  if (serviceCount === 0) {
    const initialServices = [
      { name: "Knotless Braids (Medium)", subShop: "salon", defaultPrice: 2500, estimatedConsumableCost: 300 },
      { name: "Gel Manicure & Pedicure", subShop: "salon", defaultPrice: 1500, estimatedConsumableCost: 200 },
      { name: "Internet Browsing (30 Mins)", subShop: "cyber", defaultPrice: 30, estimatedConsumableCost: 5 },
      { name: "A4 Color Printing (Per Page)", subShop: "cyber", defaultPrice: 20, estimatedConsumableCost: 7 },
      { name: "A4 Photocopy B&W", subShop: "cyber", defaultPrice: 5, estimatedConsumableCost: 1.5 },
      { name: "Passport Photo Printing (Set)", subShop: "cyber", defaultPrice: 200, estimatedConsumableCost: 35 }
    ];
    await dbOp.bulkAdd('services', initialServices);
  }

  const staffCount = await dbOp.count('staff');
  if (staffCount === 0) {
    await dbOp.bulkAdd('staff', [
      { name: "Admin Manager", pin: "1234", role: "admin" },
      { name: "Grace (Salon Attendant)", pin: "5555", role: "attendant" },
      { name: "Kevin (Cyber Attendant)", pin: "6666", role: "attendant" }
    ]);
  }
};

const SHOP_CONFIG = {
  cosmetics: { name: "Cosmetics Shop", color: "#ec4899", bg: "bg-pink-600", light: "bg-pink-500", text: "text-pink-500", border: "border-pink-500" },
  salon: { name: "Salon & Nails", color: "#a855f7", bg: "bg-purple-600", light: "bg-purple-500", text: "text-purple-500", border: "border-purple-500" },
  cyber: { name: "Cyber Cafe", color: "#3b82f6", bg: "bg-blue-600", light: "bg-blue-500", text: "text-blue-500", border: "border-blue-500" },
  icecream: { name: "Ice Cream & Pops", color: "#f59e0b", bg: "bg-amber-600", light: "bg-amber-500", text: "text-amber-500", border: "border-amber-500" }
};

// ==========================================
// 4. MAIN POS & INVENTORY APP COMPONENT
// ==========================================
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [activeTab, setActiveTab] = useState("pos"); // 'dashboard' | 'pos' | 'inventory' | 'pnl' | 'expenses' | 'backup'
  const [activeShop, setActiveShop] = useState("cosmetics"); // 'cosmetics' | 'salon' | 'cyber' | 'icecream'
  const [language, setLanguage] = useState("EN"); // 'EN' | 'SW'

  // Persistent State Collections
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [dbReady, setDbReady] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [mpesaRef, setMpesaRef] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [receiptSale, setReceiptSale] = useState(null);

  // Cloud Sync Settings State
  const [cloudEndpoint, setCloudEndpoint] = useState(() => localStorage.getItem('onyx_cloud_endpoint') || '');
  const [cloudApiKey, setCloudApiKey] = useState(() => localStorage.getItem('onyx_cloud_key') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const t = translations[language];

  useEffect(() => {
    const init = async () => {
      await seedInitialData();
      await refreshData();
      setDbReady(true);
    };
    init();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshData = async () => {
    const p = await dbOp.getAll('products');
    const s = await dbOp.getAll('services');
    const sa = (await dbOp.getAll('sales')).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const ex = (await dbOp.getAll('expenses')).sort((a, b) => new Date(b.date) - new Date(a.date));
    const st = await dbOp.getAll('staff');

    setProducts(p);
    setServices(s);
    setSales(sa);
    setExpenses(ex);
    setStaffList(st);
  };

  // ------------------------------------------
  // AUTHENTICATION LOGIC
  // ------------------------------------------
  const handlePinSubmit = (e) => {
    e.preventDefault();
    const matchedStaff = staffList.find(s => s.pin === pinInput);
    if (matchedStaff) {
      setCurrentUser(matchedStaff);
      setPinInput("");
      setPinError("");
      setActiveTab(matchedStaff.role === "admin" ? "dashboard" : "pos");
    } else {
      setPinError(t.pinError);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPinInput("");
  };

  // ------------------------------------------
  // CLOUD BACKUP SYNC ENGINE
  // ------------------------------------------
  const handleCloudSync = async () => {
    if (!cloudEndpoint) {
      alert("Please enter a valid Cloud Endpoint URL (e.g., Supabase REST URL, Firebase HTTP endpoint, or Webhook).");
      return;
    }
    setIsSyncing(true);
    setSyncStatus('Preparing data payload...');

    try {
      const payload = {
        appId: 'onyx-pos',
        timestamp: new Date().toISOString(),
        products,
        services,
        sales,
        expenses,
        staffList
      };

      localStorage.setItem('onyx_cloud_endpoint', cloudEndpoint);
      localStorage.setItem('onyx_cloud_key', cloudApiKey);

      setSyncStatus('Sending data to online database...');
      const response = await fetch(cloudEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cloudApiKey ? { 'Authorization': `Bearer ${cloudApiKey}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (response.ok || response.status === 201) {
        setSyncStatus('✅ Cloud Sync Completed Successfully!');
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (err) {
      setSyncStatus(`❌ Sync Failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // ------------------------------------------
  // POS CART LOGIC
  // ------------------------------------------
  const addToCart = (item, type) => {
    // type: 'product' or 'service'
    const cartId = `${type}-${item.id}`;
    const existing = cart.find(c => c.cartId === cartId);

    if (type === 'product' && item.quantity <= 0) {
      alert("Out of stock!");
      return;
    }

    if (existing) {
      if (type === 'product' && existing.quantity + 1 > item.quantity) {
        alert("Cannot add more than available stock!");
        return;
      }
      setCart(cart.map(c => c.cartId === cartId ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      const price = type === 'product' ? item.sellingPrice : item.defaultPrice;
      const cost = type === 'product' ? item.buyingPrice : (item.estimatedConsumableCost || 0);
      setCart([...cart, {
        cartId,
        id: item.id,
        name: item.name,
        type,
        price,
        cost,
        quantity: 1,
        subShop: item.subShop
      }]);
    }
  };

  const updateCartQty = (cartId, delta) => {
    setCart(cart.map(c => {
      if (c.cartId === cartId) {
        const newQty = c.quantity + delta;
        if (newQty <= 0) return null;
        return { ...c, quantity: newQty };
      }
      return c;
    }).filter(Boolean));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCostTotal = cart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);
  const cartProfit = cartTotal - cartCostTotal;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === "M-Pesa" && !mpesaRef.trim()) {
      alert("Please enter M-Pesa Transaction Reference!");
      return;
    }

    const saleRecord = {
      timestamp: new Date().toISOString(),
      subShop: activeShop,
      paymentMethod,
      mpesaRef: paymentMethod === "M-Pesa" ? mpesaRef : "",
      items: cart,
      subtotal: cartSubtotal,
      discount: Number(discountAmount),
      totalAmount: cartTotal,
      profit: cartProfit,
      staffName: selectedStaff || (currentUser ? currentUser.name : "Attendant")
    };

    // Save Sale to Native IndexedDB
    const saleId = await dbOp.add('sales', saleRecord);
    saleRecord.id = saleId;

    // Deduct inventory
    for (const item of cart) {
      if (item.type === 'product') {
        const p = products.find(prod => prod.id === item.id);
        if (p) {
          const newQty = Math.max(0, p.quantity - item.quantity);
          await dbOp.update('products', { ...p, quantity: newQty });
        }
      }
    }

    await refreshData();
    setReceiptSale(saleRecord);
    setCart([]);
    setMpesaRef("");
    setDiscountAmount(0);
  };

  // ------------------------------------------
  // CALCULATED ANALYTICS (P&L & DASHBOARD)
  // ------------------------------------------
  const analytics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todaySales = sales.filter(s => s.timestamp.startsWith(todayStr));
    const weeklySales = sales.filter(s => new Date(s.timestamp) >= weekAgo);
    const monthlySales = sales.filter(s => new Date(s.timestamp) >= monthAgo);

    const todayRev = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
    const weeklyRev = weeklySales.reduce((acc, s) => acc + s.totalAmount, 0);
    const monthlyRev = monthlySales.reduce((acc, s) => acc + s.totalAmount, 0);

    const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalProfit - totalExpenses;

    const lowStockItems = products.filter(p => p.quantity <= (p.minThreshold || 5));
    const expiredItems = products.filter(p => p.expiryDate && p.expiryDate !== "N/A" && new Date(p.expiryDate) < new Date());

    // Profit per sub-shop breakdown
    const shopBreakdown = {
      cosmetics: { sales: 0, profit: 0 },
      salon: { sales: 0, profit: 0 },
      cyber: { sales: 0, profit: 0 },
      icecream: { sales: 0, profit: 0 }
    };

    sales.forEach(s => {
      if (shopBreakdown[s.subShop]) {
        shopBreakdown[s.subShop].sales += s.totalAmount;
        shopBreakdown[s.subShop].profit += s.profit;
      }
    });

    const chartData = Object.keys(shopBreakdown).map(key => ({
      name: SHOP_CONFIG[key].name,
      Sales: shopBreakdown[key].sales,
      Profit: shopBreakdown[key].profit,
      color: SHOP_CONFIG[key].color
    }));

    return {
      todayRev,
      weeklyRev,
      monthlyRev,
      totalProfit,
      totalExpenses,
      netProfit,
      lowStockItems,
      expiredItems,
      chartData
    };
  }, [sales, expenses, products]);

  // If DB loading
  if (!dbReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-12 h-12 animate-spin text-pink-500 mb-4" />
        <h2 className="text-xl font-bold">Starting Onyx POS Engine...</h2>
        <p className="text-slate-400 text-sm mt-1">Setting up local IndexedDB database...</p>
      </div>
    );
  }

  // ------------------------------------------
  // LOGIN SCREEN
  // ------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">ONYX BEAUTY & CYBER</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Multi-Business POS System</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2 text-center">
                {t.enterPin}
              </label>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full text-center text-3xl font-mono tracking-widest py-4 bg-slate-950 text-white rounded-2xl border border-slate-700 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                autoFocus
              />
              {pinError && <p className="text-rose-400 text-xs text-center mt-2 font-medium">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:opacity-95 text-white font-bold rounded-2xl shadow-xl shadow-purple-900/30 transition-all text-base"
            >
              {t.login}
            </button>
          </form>

          {/* Quick PIN reference for demo testing */}
          <div className="mt-8 pt-6 border-t border-slate-700/60 text-center text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Default Demo Credentials:</p>
            <p>🔑 <span className="font-mono text-pink-400">1234</span> : Admin (Full Access)</p>
            <p>🔑 <span className="font-mono text-purple-400">5555</span> : Attendant (POS Only)</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter catalog for POS
  const filteredProducts = products.filter(p => 
    p.subShop === activeShop && 
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery)))
  );
  const filteredServices = services.filter(s => 
    s.subShop === activeShop && 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ==========================================
          HEADER / TOP BAR
      ========================================== */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg">
            O
          </div>
          <div>
            <h1 className="font-extrabold text-sm md:text-base leading-tight tracking-wide text-white">
              ONYX BEAUTY & CYBER
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                {isOnline ? 'Online Sync' : 'Offline Mode (Dexie)'}
              </span>
              <span>•</span>
              <span className="text-pink-400 capitalize font-medium">{currentUser.role}</span>
            </div>
          </div>
        </div>

        {/* Sub-Shop Selector Pills */}
        {activeTab === 'pos' && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {Object.keys(SHOP_CONFIG).map(shopKey => {
              const cfg = SHOP_CONFIG[shopKey];
              const isSelected = activeShop === shopKey;
              return (
                <button
                  key={shopKey}
                  onClick={() => setActiveShop(shopKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isSelected ? `${cfg.bg} text-white shadow-lg` : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {shopKey === 'cosmetics' && <ShoppingBag className="w-3.5 h-3.5" />}
                  {shopKey === 'salon' && <Scissors className="w-3.5 h-3.5" />}
                  {shopKey === 'cyber' && <Monitor className="w-3.5 h-3.5" />}
                  {shopKey === 'icecream' && <IceCream className="w-3.5 h-3.5" />}
                  {cfg.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'EN' ? 'SW' : 'EN')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-pink-400" />
            <span>{language === 'EN' ? 'Swahili' : 'English'}</span>
          </button>
          
          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={handleLogout}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all border border-rose-500/20"
            title={t.logout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-16 md:w-64 bg-slate-900 border-r border-slate-800 p-2 md:p-4 flex flex-col justify-between">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'pos' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden md:inline">{t.pos}</span>
            </button>

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all ${
                    activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline">{t.dashboard}</span>
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all ${
                    activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden md:inline">{t.inventory}</span>
                </button>

                <button
                  onClick={() => setActiveTab('pnl')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all ${
                    activeTab === 'pnl' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden md:inline">{t.pnl}</span>
                </button>

                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all ${
                    activeTab === 'expenses' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden md:inline">{t.expenses}</span>
                </button>

                <button
                  onClick={() => setActiveTab('backup')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all ${
                    activeTab === 'backup' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span className="hidden md:inline">{t.backup}</span>
                </button>
              </>
            )}
          </nav>
        </aside>

        {/* ROUTE BODY CONTAINER */}
        <main className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto">

          {/* ------------------------------------------
              1. POS SALES MODULE SCREEN
          ------------------------------------------ */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              
              {/* CATALOG & ITEMS (LEFT 7 COLS) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* Search Bar & Fast Actions */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Items & Services Grid */}
                <div className="flex-1 overflow-y-auto pr-1">
                  
                  {/* PRODUCTS SECTION */}
                  {filteredProducts.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Products ({filteredProducts.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredProducts.map(prod => {
                          const isLow = prod.quantity <= (prod.minThreshold || 5);
                          return (
                            <button
                              key={`p-${prod.id}`}
                              onClick={() => addToCart(prod, 'product')}
                              className="bg-slate-900 hover:bg-slate-850 p-3.5 rounded-2xl border border-slate-800 text-left transition-all hover:scale-[1.02] flex flex-col justify-between relative overflow-hidden group shadow-md"
                            >
                              <div className="absolute top-0 right-0 w-1.5 h-full bg-pink-500" />
                              <div>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                                  {prod.category}
                                </span>
                                <h4 className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug">
                                  {prod.name}
                                </h4>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="font-extrabold text-pink-400 text-sm">
                                  KES {prod.sellingPrice}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  isLow ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                                }`}>
                                  Qty: {prod.quantity}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SERVICES SECTION */}
                  {filteredServices.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Services ({filteredServices.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredServices.map(serv => (
                          <button
                            key={`s-${serv.id}`}
                            onClick={() => addToCart(serv, 'service')}
                            className="bg-slate-900 hover:bg-slate-850 p-3.5 rounded-2xl border border-slate-800 text-left transition-all hover:scale-[1.02] flex flex-col justify-between relative overflow-hidden shadow-md"
                          >
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-500" />
                            <div>
                              <span className="text-[10px] font-semibold text-purple-400 uppercase block mb-1">
                                Service
                              </span>
                              <h4 className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug">
                                {serv.name}
                              </h4>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="font-extrabold text-purple-400 text-sm">
                                KES {serv.defaultPrice}
                              </span>
                              <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
                                Tap to Add
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredProducts.length === 0 && filteredServices.length === 0 && (
                    <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                      <Package className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No products or services found for this shop.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CART & CHECKOUT (RIGHT 5 COLS) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-pink-500" />
                      {t.cart}
                    </h2>
                    <span className="bg-pink-500/20 text-pink-400 text-xs font-bold px-2.5 py-1 rounded-full">
                      {cart.length} items
                    </span>
                  </div>

                  {/* Cart Items List */}
                  <div className="my-4 max-h-[320px] overflow-y-auto space-y-2 pr-1">
                    {cart.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-sm">
                        {t.noItemsCart}
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.cartId} className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-200 truncate">{item.name}</h4>
                            <p className="text-[11px] text-slate-400">
                              KES {item.price} x {item.quantity} = <span className="font-bold text-slate-200">KES {item.price * item.quantity}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateCartQty(item.cartId, -1)}
                              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.cartId, 1)}
                              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Checkout & Options */}
                {cart.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    
                    {/* Staff Attendant Selection */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                        {t.staff}
                      </label>
                      <select
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="">Select Staff Member</option>
                        {staffList.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Cash", "M-Pesa", "Credit"].map(pm => (
                          <button
                            key={pm}
                            onClick={() => setPaymentMethod(pm)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${
                              paymentMethod === pm ? 'bg-pink-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {pm}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* M-Pesa Ref Input */}
                    {paymentMethod === "M-Pesa" && (
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-400 uppercase mb-1">
                          M-Pesa Code (e.g. QX872391)
                        </label>
                        <input
                          type="text"
                          placeholder="QX872391"
                          value={mpesaRef}
                          onChange={(e) => setMpesaRef(e.target.value)}
                          className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl py-2 px-3 text-xs text-white uppercase tracking-wider focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Discount Input */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{t.discount} (KES):</span>
                      <input
                        type="number"
                        min="0"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className="w-24 bg-slate-950 border border-slate-800 rounded-xl py-1 px-2.5 text-right text-xs text-white focus:outline-none"
                      />
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Subtotal:</span>
                        <span>KES {cartSubtotal}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-xs text-rose-400">
                          <span>Discount:</span>
                          <span>- KES {discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-black text-white pt-1 border-t border-slate-800">
                        <span>{t.total}:</span>
                        <span className="text-pink-400">KES {cartTotal}</span>
                      </div>
                    </div>

                    {/* Complete Sale Button */}
                    <button
                      onClick={handleCompleteSale}
                      className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-xl shadow-pink-600/20 text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t.checkout} (KES {cartTotal})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------
              2. DASHBOARD OVERVIEW (ADMIN ONLY)
          ------------------------------------------ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Alert Banners */}
              {analytics.lowStockItems.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-center gap-3 text-rose-300 text-xs md:text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  <div className="flex-1">
                    <span className="font-bold">{t.lowStockAlert}</span> {analytics.lowStockItems.length} items are running below reorder threshold.
                  </div>
                  <button onClick={() => setActiveTab('inventory')} className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs">
                    View Stock
                  </button>
                </div>
              )}

              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.todaySales}
                  </span>
                  <div className="text-2xl font-black text-white">
                    KES {analytics.todayRev.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Real-time POS Total
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.weeklySales}
                  </span>
                  <div className="text-2xl font-black text-purple-400">
                    KES {analytics.weeklyRev.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block">Last 7 rolling days</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.monthlySales}
                  </span>
                  <div className="text-2xl font-black text-blue-400">
                    KES {analytics.monthlyRev.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block">Last 30 rolling days</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t.totalProfit} (Net)
                  </span>
                  <div className={`text-2xl font-black ${analytics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    KES {analytics.netProfit.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block">Gross profit minus expenses</span>
                </div>
              </div>

              {/* Sub-Shop Breakdown Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sales & Profit Breakdown (8 cols) */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                  <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pink-500" />
                    Sub-Shop Performance Breakdown
                  </h3>
                  
                  <div className="space-y-4 pt-2">
                    {analytics.chartData.map(item => {
                      const maxVal = Math.max(...analytics.chartData.map(d => d.Sales), 1);
                      const salesWidth = Math.round((item.Sales / maxVal) * 100);
                      const profitWidth = Math.round((item.Profit / maxVal) * 100);

                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-200">{item.name}</span>
                            <span className="text-slate-400">Sales: KES {item.Sales} | Profit: KES {item.Profit}</span>
                          </div>
                          <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                            <div 
                              className="h-full bg-pink-500 transition-all duration-500 rounded-l-full" 
                              style={{ width: `${salesWidth}%` }} 
                            />
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-500 rounded-r-full" 
                              style={{ width: `${profitWidth}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-Shop Quick Jump Cards (4 cols) */}
                <div className="lg:col-span-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Quick Sub-Shop Launch
                  </h3>
                  {Object.keys(SHOP_CONFIG).map(key => {
                    const cfg = SHOP_CONFIG[key];
                    return (
                      <button
                        key={key}
                        onClick={() => { setActiveShop(key); setActiveTab('pos'); }}
                        className={`w-full p-4 rounded-2xl border border-slate-800 text-left transition-all hover:scale-[1.02] flex items-center justify-between ${cfg.light}/10`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center text-white font-bold`}>
                            {key.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{cfg.name}</h4>
                            <p className="text-xs text-slate-400">Launch POS Module</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------
              3. INVENTORY & SERVICE CATALOG MANAGEMENT
          ------------------------------------------ */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white">{t.inventory}</h2>
                  <p className="text-xs text-slate-400">Manage products, stock levels, and services per shop.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const name = prompt("Enter Product Name:");
                      if (!name) return;
                      const price = Number(prompt("Selling Price (KES):") || 0);
                      const cost = Number(prompt("Buying Price (KES):") || 0);
                      const qty = Number(prompt("Stock Quantity:") || 10);
                      await dbOp.add('products', {
                        name,
                        subShop: activeShop,
                        category: "General",
                        buyingPrice: cost,
                        sellingPrice: price,
                        quantity: qty,
                        minThreshold: 5,
                        expiryDate: "N/A"
                      });
                      await refreshData();
                    }}
                    className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4" /> {t.addStock}
                  </button>
                </div>
              </div>

              {/* Sub-Shop Switcher Tab for Inventory */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.keys(SHOP_CONFIG).map(k => (
                  <button
                    key={k}
                    onClick={() => setActiveShop(k)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeShop === k ? `${SHOP_CONFIG[k].bg} text-white` : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {SHOP_CONFIG[k].name}
                  </button>
                ))}
              </div>

              {/* Products Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-white">Products Catalog ({filteredProducts.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-4">Item Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Buying Price</th>
                        <th className="p-4">Selling Price</th>
                        <th className="p-4">Stock Qty</th>
                        <th className="p-4">Expiry Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProducts.map(p => {
                        const isExpired = p.expiryDate && p.expiryDate !== "N/A" && new Date(p.expiryDate) < new Date();
                        return (
                          <tr key={p.id} className="hover:bg-slate-850/50">
                            <td className="p-4 font-bold text-white">{p.name}</td>
                            <td className="p-4 text-slate-400">{p.category}</td>
                            <td className="p-4">KES {p.buyingPrice}</td>
                            <td className="p-4 font-bold text-pink-400">KES {p.sellingPrice}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full font-bold ${
                                p.quantity <= (p.minThreshold || 5) ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-200'
                              }`}>
                                {p.quantity} Pcs
                              </span>
                            </td>
                            <td className="p-4">
                              {isExpired ? (
                                <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold">
                                  EXPIRED ({p.expiryDate})
                                </span>
                              ) : (
                                p.expiryDate || "N/A"
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete ${p.name}?`)) {
                                    await dbOp.delete('products', p.id);
                                    await refreshData();
                                  }
                                }}
                                className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------
              4. PROFIT & LOSS (PNL) ANALYTICS
          ------------------------------------------ */}
          {activeTab === 'pnl' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">{t.pnl}</h2>
                <p className="text-xs text-slate-400">Automated financial profit and loss calculation engine.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Gross Product Margin</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    KES {analytics.totalProfit.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Expenses</span>
                  <div className="text-2xl font-black text-rose-400 mt-1">
                    KES {analytics.totalExpenses.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Net Income / Profit</span>
                  <div className={`text-2xl font-black mt-1 ${analytics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    KES {analytics.netProfit.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------
              5. EXPENSES TRACKER
          ------------------------------------------ */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold text-white">{t.expensesTitle}</h2>
                  <p className="text-xs text-slate-400">Log business overhead (rent, electricity, salaries).</p>
                </div>
                <button
                  onClick={async () => {
                    const category = prompt("Expense Category (e.g., Rent, Tokens):");
                    if (!category) return;
                    const amount = Number(prompt("Amount in KES:") || 0);
                    await dbOp.add('expenses', {
                      date: new Date().toISOString().split('T')[0],
                      subShop: activeShop,
                      category,
                      amount,
                      note: "Manual entry"
                    });
                    await refreshData();
                  }}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" /> {t.addExpense}
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Sub-Shop</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-slate-850/50">
                        <td className="p-4 font-bold text-white">{e.date}</td>
                        <td className="p-4 uppercase text-slate-400">{e.subShop}</td>
                        <td className="p-4 font-semibold text-slate-200">{e.category}</td>
                        <td className="p-4 font-bold text-rose-400">KES {e.amount}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={async () => {
                              await dbOp.delete('expenses', e.id);
                              await refreshData();
                            }}
                            className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ------------------------------------------
              6. BACKUP & DATA PORTABILITY
          ------------------------------------------ */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-xl font-extrabold text-white">{t.backupTitle}</h2>
                <p className="text-xs text-slate-400">Manage offline IndexedDB backups, Excel exports, and live Cloud Database synchronization.</p>
              </div>

              {/* CLOUD DATABASE SYNC ENGINE */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">{t.cloudSyncTitle}</h3>
                    <p className="text-xs text-slate-400">Sync all sales & inventory to a cloud database (Supabase, Firebase, or Custom API).</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      {t.cloudEndpoint}
                    </label>
                    <input
                      type="text"
                      placeholder="https://xyz.supabase.co/rest/v1/pos_backups"
                      value={cloudEndpoint}
                      onChange={(e) => setCloudEndpoint(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      {t.apiKeyLabel}
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                      value={cloudApiKey}
                      onChange={(e) => setCloudApiKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-indigo-300">{syncStatus}</span>
                  <button
                    onClick={handleCloudSync}
                    disabled={isSyncing}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? t.syncing : t.syncNow}
                  </button>
                </div>
              </div>

              {/* LOCAL EXPORTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* JSON Export */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
                  <Download className="w-8 h-8 text-pink-500" />
                  <h3 className="font-bold text-base text-white">{t.exportJSON}</h3>
                  <p className="text-xs text-slate-400">
                    Download a full offline snapshot of sales, inventory, and expenses as a JSON file.
                  </p>
                  <button
                    onClick={async () => {
                      const data = {
                        products,
                        services,
                        sales,
                        expenses,
                        staffList,
                        backupDate: new Date().toISOString()
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Onyx_POS_Backup_${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                    }}
                    className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg"
                  >
                    Download JSON Snapshot
                  </button>
                </div>

                {/* CSV Sales Export */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <h3 className="font-bold text-base text-white">{t.exportCSV}</h3>
                  <p className="text-xs text-slate-400">
                    Export complete sales history table to Excel-compatible CSV format.
                  </p>
                  <button
                    onClick={() => {
                      let csv = "ID,Timestamp,SubShop,PaymentMethod,TotalAmount,Profit,Staff\n";
                      sales.forEach(s => {
                        csv += `${s.id},"${s.timestamp}",${s.subShop},${s.paymentMethod},${s.totalAmount},${s.profit},"${s.staffName}"\n`;
                      });
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Onyx_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg"
                  >
                    Export Sales to CSV
                  </button>
                </div>
              </div>

              {/* NETLIFY / VERCEL & DATABASE GUIDE CARD */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  How to Host Online & Back Up Data (Netlify / Vercel + Supabase)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-pink-400 uppercase">Step 1: Host Frontend on Netlify/Vercel (Free)</h4>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Push this project code to a <b>GitHub repository</b>.</li>
                      <li>Go to <b>Vercel.com</b> or <b>Netlify.com</b> and click "Import Project".</li>
                      <li>Vercel/Netlify will build your web app and give you an SSL link like <code>https://onyx-pos.vercel.app</code>.</li>
                      <li>Open that link on your Android/iPhone and tap <b>"Add to Home Screen"</b> to install as an offline PWA app!</li>
                    </ol>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-indigo-400 uppercase">Step 2: Connect Free Supabase Database</h4>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Create a free account on <b>Supabase.com</b>.</li>
                      <li>Create a table named <code>pos_backups</code>.</li>
                      <li>Copy your Supabase Project REST URL & Anon Key.</li>
                      <li>Paste them into the <b>Cloud Database Auto-Sync</b> form above to enable 1-click cloud backups!</li>
                    </ol>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ==========================================
          7. THERMAL RECEIPT PREVIEW MODAL (80MM)
      ========================================== */}
      {receiptSale && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl shadow-2xl p-6 font-mono text-xs space-y-4">
            
            {/* Printable Receipt Area */}
            <div className="text-center space-y-1">
              <h2 className="font-extrabold text-base tracking-wider">ONYX BEAUTY & CYBER</h2>
              <p className="text-[10px] text-slate-600">Multi-Shop POS Receipt</p>
              <p className="text-[10px] text-slate-600 uppercase">Sub-Shop: {receiptSale.subShop}</p>
              <p className="text-[10px] text-slate-500">{new Date(receiptSale.timestamp).toLocaleString()}</p>
            </div>

            <div className="border-b border-dashed border-slate-300 my-2" />

            {/* Items Breakdown */}
            <div className="space-y-1.5">
              {receiptSale.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="flex-1 pr-2">
                    <span className="font-bold">{it.name}</span>
                    <span className="block text-[10px] text-slate-500">{it.quantity} x KES {it.price}</span>
                  </div>
                  <span className="font-bold">KES {it.quantity * it.price}</span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-slate-300 my-2" />

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>KES {receiptSale.subtotal}</span>
              </div>
              {receiptSale.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>- KES {receiptSale.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>KES {receiptSale.totalAmount}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                <span>Paid via {receiptSale.paymentMethod}:</span>
                <span>{receiptSale.mpesaRef || "Completed"}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Served By:</span>
                <span>{receiptSale.staffName}</span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="text-center pt-2">
              <div className="h-8 bg-slate-900 w-3/4 mx-auto rounded flex items-center justify-center text-white text-[9px] font-mono tracking-widest">
                ||| | |||| | ||| || |||
              </div>
              <p className="text-[9px] text-slate-500 mt-1">Thank you for visiting Onyx!</p>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> {t.printReceipt}
              </button>
              <button
                onClick={() => setReceiptSale(null)}
                className="px-4 py-2.5 bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}