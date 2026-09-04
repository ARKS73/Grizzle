'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Phone,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Tag,
  CreditCard,
  Banknote,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';

const INDIAN_STATES_CITIES = {
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore',
    'Tirunelveli', 'Thanjavur', 'Kanchipuram', 'Nagercoil', 'Cuddalore', 'Dindigul', 'Hosur',
    'Kumbakonam', 'Karaikudi', 'Neyveli', 'Ambur', 'Pudukkottai', 'Nagapattinam', 'Other'
  ],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Navi Mumbai', 'Other'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Gulbarga', 'Davanagere', 'Bellary', 'Shimoga', 'Tumakuru', 'Udupi', 'Other'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Other'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Other'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Anand', 'Other'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Noida', 'Bareilly', 'Other'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Asansol', 'Durgapur', 'Other'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur', 'Alappuzha', 'Kottayam', 'Other'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Other'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Other'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Other'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Other'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Other'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Other'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Other'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Other'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Other'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Other'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Other'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Other'],
  'Chandigarh': ['Chandigarh'],
};

const ALL_COUNTRIES = [
  'India 🇮🇳',
  'United States 🇺🇸',
  'United Kingdom 🇬🇧',
  'United Arab Emirates 🇦🇪',
  'Singapore 🇸🇬',
  'Canada 🇨🇦',
  'Australia 🇦🇺',
  'Other Country 🌐',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const {
    cartItems,
    getSubtotal,
    getDiscountAmount,
    getTotalPrice,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { addToast } = useToast();

  const firstInputRef = useRef(null);
  const [couponInput, setCouponInput] = useState('');
  const [mobileSummaryExpanded, setMobileSummaryExpanded] = useState(false);

  // Extract clean 10-digit phone
  const extractPhoneDigits = (raw) => {
    if (!raw || raw.includes('12345') || raw.includes('00000')) return '';
    const digits = raw.replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : '';
  };

  const [phoneDigits, setPhoneDigits] = useState(extractPhoneDigits(user?.phone));
  const [customCity, setCustomCity] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    street: user?.address?.street || '',
    landmark: user?.address?.landmark || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Tamil Nadu',
    postalCode: user?.address?.postalCode || '',
    country: 'India 🇮🇳',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  const [submitting, setSubmitting] = useState(false);
  const [cityRates, setCityRates] = useState([]);
  const [defaultShippingFee, setDefaultShippingFee] = useState(49);
  const [freeShippingMode, setFreeShippingMode] = useState(false);

  // Auto-focus first input field on load
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    async function fetchShippingRates() {
      try {
        const res = await fetch('/api/shipping');
        const data = await res.json();
        if (data.success) {
          setCityRates(data.rates || []);
          if (data.defaultShippingFee !== undefined) {
            setDefaultShippingFee(data.defaultShippingFee);
          }
          setFreeShippingMode(Boolean(data.freeShippingMode));
        }
      } catch (err) {
        console.error('Failed to load shipping rates:', err);
      }
    }
    fetchShippingRates();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        street: prev.street || user.address?.street || '',
        landmark: prev.landmark || user.address?.landmark || '',
        city: prev.city || user.address?.city || '',
        state: prev.state || user.address?.state || 'Tamil Nadu',
        postalCode: prev.postalCode || user.address?.postalCode || '',
        country: 'India 🇮🇳',
      }));
      if (user.phone && !phoneDigits) {
        setPhoneDigits(extractPhoneDigits(user.phone));
      }
    }
  }, [user]);

  const calculateCityShippingFee = (city) => {
    if (freeShippingMode) return 0;
    if (!city) return defaultShippingFee;
    const target = (city === 'Other' ? customCity : city).trim().toLowerCase();
    const found = cityRates.find((r) => r.city.trim().toLowerCase() === target);
    if (found) return found.shippingFee;
    return defaultShippingFee;
  };

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = calculateCityShippingFee(formData.city);
  const totalPrice = Math.max(0, subtotal - discount + shipping);

  const productSavings = cartItems.reduce((acc, item) => {
    const orig = item.product?.originalPrice || item.product?.price || 0;
    const curr = item.product?.price || 0;
    if (orig > curr) {
      return acc + ((orig - curr) * item.quantity);
    }
    return acc;
  }, 0);

  const combinedSavings = productSavings + discount;

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center empty-cart-box">
        <div className="empty-cart-icon">
          <ShoppingBag size={48} strokeWidth={1.5} color="var(--text-muted)" />
        </div>
        <h2 className="empty-heading">Your Bag is Empty</h2>
        <p className="empty-desc">Explore Grizzle high-density DTF printed streetwear drops before proceeding to checkout.</p>
        <Link href="/products" className="btn-street-dark btn-hero-primary mt-3">
          Explore Products Catalog <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'state') {
        updated.city = '';
        setCitySearch('');
        setCustomCity('');
      }
      return updated;
    });
  };

  const stateCityList = INDIAN_STATES_CITIES[formData.state] || INDIAN_STATES_CITIES['Tamil Nadu'];
  const filteredCities = stateCityList.filter((ct) =>
    ct.toLowerCase().includes(citySearch.trim().toLowerCase())
  );

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhoneDigits(val);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!phoneDigits || phoneDigits.length !== 10 || !/^[6-9]\d{9}$/.test(phoneDigits)) {
      addToast('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9', 'error');
      return;
    }

    if (!formData.street || formData.street.trim().length < 25) {
      addToast('Street Address must be at least 25 characters long for accurate courier delivery', 'error');
      return;
    }

    if (!formData.landmark || !formData.landmark.trim()) {
      addToast('Please provide a Landmark (nearby shop/place)', 'error');
      return;
    }

    const finalCity = (formData.city === 'Other' ? customCity : formData.city)?.trim();
    if (!finalCity) {
      addToast('Please select or enter your City', 'error');
      return;
    }

    if (!formData.fullName || !formData.state || !formData.postalCode) {
      addToast('Please complete all required shipping fields', 'error');
      return;
    }

    const fullPhone = `+91 ${phoneDigits}`;
    const finalShippingAddress = {
      ...formData,
      phone: fullPhone,
      city: finalCity,
    };

    try {
      setSubmitting(true);

      const orderItems = cartItems.map((item) => {
        const prodId = typeof item.product === 'object' ? (item.product?._id || item.product?.id) : item.product;
        const prodName = typeof item.product === 'object' ? item.product?.name : (item.name || 'Grizzle Apparel');
        const prodImage = typeof item.product === 'object' ? (item.product?.images?.[0] || item.image || '') : (item.image || '');
        const prodPrice = typeof item.product === 'object' ? item.product?.price : (item.price || 0);

        return {
          product: prodId,
          name: prodName,
          image: prodImage,
          price: parseFloat(prodPrice || 0),
          quantity: parseInt(item.quantity || 1, 10),
          size: item.size || 'M',
          color: item.color || 'Black',
        };
      });

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems,
          shippingAddress: finalShippingAddress,
          paymentMethod,
          itemsPrice: subtotal,
          shippingPrice: shipping,
          discountAmount: discount,
          couponCode: appliedCoupon?.code || '',
          totalPrice,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        addToast('Order placed successfully! Delivery details saved to your profile.', 'success');
        clearCart();
        if (refreshUser) refreshUser();
        router.push(`/orders/${data.order._id}`);
      } else {
        addToast(data.message || 'Failed to place order. Please check your delivery details.', 'error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      addToast(err?.message || 'An error occurred while placing your order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-clean-container">
      <div className="container">
        {/* 1. Header & Clean Stepper Bar */}
        <header className="checkout-header-bar">
          <div className="brand-title-wrap">
            <Link href="/" className="brand-logo-txt">GRIZZLE</Link>
            <span className="secure-tag"><Lock size={12} /> SECURE CHECKOUT</span>
          </div>

          {/* Clean 3-Step Stepper Navigation */}
          <nav className="checkout-steps-stepper">
            <Link href="/cart" className="step-item step-completed">
              <span className="step-badge">✓</span>
              <span className="step-name">Bag</span>
            </Link>
            <div className="step-connector active" />
            <div className="step-item step-active">
              <span className="step-badge">2</span>
              <span className="step-name">Details</span>
            </div>
            <div className="step-connector" />
            <div className="step-item step-pending">
              <span className="step-badge">3</span>
              <span className="step-name">Payment</span>
            </div>
          </nav>
        </header>

        {/* 2. Mobile Collapsible Summary Accordion Bar */}
        <div className="mobile-order-summary-bar">
          <button
            type="button"
            onClick={() => setMobileSummaryExpanded(!mobileSummaryExpanded)}
            className="mobile-summary-toggle-btn"
          >
            <div className="toggle-left">
              <div className="thumb-stack-mini">
                {cartItems.slice(0, 3).map((it, idx) => (
                  <img
                    key={idx}
                    src={it.product?.images?.[0] || '/icon.png'}
                    alt="Item thumbnail"
                    className="stack-img"
                    style={{ zIndex: 3 - idx }}
                  />
                ))}
              </div>
              <span className="summary-qty-lbl">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
              {mobileSummaryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            <div className="toggle-right">
              <span className="toggle-total-price">₹{totalPrice.toFixed(0)}</span>
            </div>
          </button>

          {/* Expanded Mobile Summary Content — Clean Mini UI */}
          {mobileSummaryExpanded && (
            <div className="mobile-summary-expand-content">
              <div className="items-list-compact">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="item-row-compact">
                    <img
                      src={item.product?.images?.[0] || '/icon.png'}
                      alt={item.product?.name}
                      className="item-img-sm"
                    />
                    <div className="item-info-sm">
                      <span className="item-title-sm">{item.product?.name}</span>
                      <span className="item-meta-sm">Size: {item.size} • Qty: {item.quantity}</span>
                    </div>
                    <span className="item-price-sm">₹{(item.product?.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              {/* Promo Coupon Box Mobile */}
              <div className="coupon-box-wrap mt-3">
                {appliedCoupon ? (
                  <div className="applied-coupon-row">
                    <div className="coupon-txt-info">
                      <Tag size={13} className="text-emerald-500" />
                      <span>{appliedCoupon.code} applied ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`})</span>
                    </div>
                    <button type="button" onClick={removeCoupon} className="remove-coupon-btn">Remove</button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!couponInput.trim()) return;
                      const ok = await applyCoupon(couponInput);
                      if (ok) setCouponInput('');
                    }}
                    className="coupon-input-form"
                  >
                    <input
                      type="text"
                      placeholder="Promo Coupon Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="coupon-input-field"
                    />
                    <button type="submit" className="coupon-apply-btn">Apply</button>
                  </form>
                )}
              </div>

              {/* Price Breakdown Rows */}
              <div className="price-breakdown-rows mt-3">
                <div className="p-row">
                  <span>Items Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                {combinedSavings > 0 && (
                  <div className="p-row text-success font-bold">
                    <span>🎉 Total Savings</span>
                    <span>-₹{combinedSavings.toFixed(0)}</span>
                  </div>
                )}
                <div className="p-row">
                  <span>Shipping Fee</span>
                  <span>{shipping === 0 ? <strong className="text-success">FREE</strong> : `₹${shipping}`}</span>
                </div>
                <div className="p-row p-total-row">
                  <span>Total Payable</span>
                  <span className="p-total-val">₹{totalPrice.toFixed(0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Main 2-Column Desktop Grid */}
        <div className="checkout-main-grid">
          {/* Left Form Column */}
          <div className="checkout-form-column">
            <form onSubmit={handlePlaceOrder} className="checkout-form-card">
              {/* Section 1: Contact & Shipping Address */}
              <div className="form-section-block">
                <div className="section-head-row">
                  <div className="section-step-badge">1</div>
                  <div>
                    <h2 className="section-heading">Contact &amp; Shipping Address</h2>
                    <p className="section-sub">Where should we deliver your Grizzle streetwear package?</p>
                  </div>
                </div>

                <div className="clean-form-grid mt-4">
                  {/* Full Name */}
                  <div className="form-field-group col-span-2">
                    <label className="clean-label">Receiver Full Name *</label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      name="fullName"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="clean-input"
                    />
                  </div>

                  {/* Phone Number with +91 */}
                  <div className="form-field-group col-span-2">
                    <div className="label-flex-row">
                      <label className="clean-label">Mobile Phone Number *</label>
                      <span className={phoneDigits.length === 10 ? 'val-status val-success' : 'val-status val-muted'}>
                        {phoneDigits.length === 10 ? '✓ 10 Digits Valid' : `${phoneDigits.length}/10 Digits`}
                      </span>
                    </div>
                    <div className="phone-prefix-input-box">
                      <span className="country-prefix">+91 🇮🇳</span>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={phoneDigits}
                        onChange={handlePhoneChange}
                        maxLength={10}
                        required
                        className="clean-input phone-field"
                      />
                    </div>
                    <span className="field-hint">Courier dispatch updates &amp; delivery OTP will be sent to +91 {phoneDigits || '9876543210'}.</span>
                  </div>

                  {/* Street Address */}
                  <div className="form-field-group col-span-2">
                    <div className="label-flex-row">
                      <label className="clean-label">Street Address *</label>
                      <span className={formData.street.length >= 25 ? 'val-status val-success' : 'val-status val-danger'}>
                        {formData.street.length >= 25 ? '✓ Valid Address Length' : `Min 25 letters required (${formData.street.length}/25)`}
                      </span>
                    </div>
                    <textarea
                      name="street"
                      rows={3}
                      placeholder="Flat/House No., Building Name, Street, Area Name (At least 25 letters)"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      minLength={25}
                      className={`clean-input clean-textarea ${formData.street.length > 0 && formData.street.length < 25 ? 'input-error' : ''}`}
                    />
                  </div>

                  {/* Landmark */}
                  <div className="form-field-group col-span-2">
                    <label className="clean-label">Landmark *</label>
                    <input
                      type="text"
                      name="landmark"
                      placeholder="Nearby famous shop, temple, park or school"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      required
                      className="clean-input"
                    />
                  </div>

                  {/* State Select */}
                  <div className="form-field-group col-span-1">
                    <label className="clean-label">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="clean-select"
                    >
                      {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* City Select with Filter Search */}
                  <div className="form-field-group col-span-1">
                    <div className="label-flex-row">
                      <label className="clean-label">City *</label>
                      {formData.city && <span className="val-status val-success">✓ {formData.city}</span>}
                    </div>

                    <div className="city-search-box mb-2">
                      <Search size={14} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="clean-input search-input"
                      />
                      {citySearch && (
                        <button type="button" onClick={() => setCitySearch('')} className="clear-search-btn">
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="clean-select"
                    >
                      <option value="" disabled>-- Select City --</option>
                      {filteredCities.map((ct) => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>

                  {/* If Other City Chosen */}
                  {formData.city === 'Other' && (
                    <div className="form-field-group col-span-2">
                      <label className="clean-label">Enter Custom City Name *</label>
                      <input
                        type="text"
                        placeholder="Your City Name"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        required
                        className="clean-input"
                      />
                    </div>
                  )}

                  {/* Postal Pincode */}
                  <div className="form-field-group col-span-1">
                    <label className="clean-label">PIN Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="6-Digit PIN Code"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      maxLength={6}
                      required
                      className="clean-input"
                    />
                  </div>

                  {/* Country */}
                  <div className="form-field-group col-span-1">
                    <label className="clean-label">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="clean-select"
                    >
                      {ALL_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Method Selection */}
              <div className="form-section-block mt-5">
                <div className="section-head-row">
                  <div className="section-step-badge">2</div>
                  <div>
                    <h2 className="section-heading">Payment Option</h2>
                    <p className="section-sub">Select your preferred payment mode</p>
                  </div>
                </div>

                <div className="payment-options-grid mt-4">
                  {/* Option 1: Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                    className={`payment-option-card ${paymentMethod === 'Cash on Delivery (COD)' ? 'active-option' : ''}`}
                  >
                    <div className="option-radio-dot">
                      {paymentMethod === 'Cash on Delivery (COD)' && <div className="radio-inner" />}
                    </div>
                    <div className="option-icon-box">
                      <Banknote size={22} color={paymentMethod === 'Cash on Delivery (COD)' ? '#dc2626' : 'var(--text-muted)'} />
                    </div>
                    <div className="option-text">
                      <div className="option-title">Cash on Delivery (COD)</div>
                      <div className="option-subtitle">Pay with cash upon doorstep package delivery</div>
                    </div>
                    <span className="badge-cod-tag">POPULAR</span>
                  </div>

                  {/* Option 2: Online Express Payment (Disabled / Coming Soon) */}
                  <div
                    onClick={() => {
                      addToast('Online Payment (UPI/Cards) is temporarily unavailable. Cash on Delivery is active for your order.', 'info');
                    }}
                    className="payment-option-card disabled-option"
                  >
                    <div className="option-radio-dot disabled-dot">
                    </div>
                    <div className="option-icon-box">
                      <CreditCard size={22} color="var(--text-muted)" />
                    </div>
                    <div className="option-text">
                      <div className="option-title text-muted">UPI / Cards / NetBanking</div>
                      <div className="option-subtitle">GPay, PhonePe, Paytm &amp; Cards (Under Maintenance)</div>
                    </div>
                    <span className="badge-coming-soon-tag">TEMPORARILY OFF</span>
                  </div>
                </div>
              </div>

              {/* Desktop Main Submit Button */}
              <div className="desktop-submit-wrap mt-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-place-order-large"
                >
                  {submitting ? 'Placing Order...' : `Place Order — ₹${totalPrice.toFixed(0)}`} <ArrowRight size={18} />
                </button>
              </div>

              {/* Trust Strip */}
              <div className="trust-strip-footer mt-4">
                <div className="trust-item"><ShieldCheck size={16} className="text-emerald-500" /> 100% Encrypted Checkout</div>
                <div className="trust-dot">•</div>
                <div className="trust-item"><Truck size={16} className="text-blue-500" /> Pan-India Express Delivery</div>
                <div className="trust-dot">•</div>
                <div className="trust-item"><Banknote size={16} className="text-amber-500" /> Cash on Delivery Available</div>
              </div>

              {/* WhatsApp Support Link */}
              <div className="support-link-wrap mt-3">
                <a
                  href="https://wa.me/919176281858?text=Hi%20Grizzle%20Support%2C%20I%20have%20a%20question%20about%20my%20checkout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-support-link"
                >
                  <MessageCircle size={15} color="#25d366" />
                  <span>Need help with your order? <strong>Chat on WhatsApp</strong></span>
                </a>
              </div>
            </form>
          </div>

          {/* Right Column: Sticky Order Summary Card */}
          <div className="checkout-summary-column">
            <div className="sticky-summary-card">
              <h3 className="summary-card-title">Order Summary</h3>

              {/* Product Thumbnails List */}
              <div className="summary-items-list">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="summary-item-row">
                    <img src={item.product?.images?.[0] || '/icon.png'} alt={item.product?.name} className="summary-item-img" />
                    <div className="summary-item-info">
                      <span className="summary-item-name">{item.product?.name}</span>
                      <span className="summary-item-specs">Qty: {item.quantity} | Size: {item.size}</span>
                    </div>
                    <span className="summary-item-price">₹{(item.product?.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              {/* Estimated Dispatch Badge */}
              <div className="delivery-estimate-box mt-3">
                <Truck size={16} className="truck-icon" />
                <div>
                  <div className="est-title">Ships in 24-48 Hours</div>
                  <div className="est-sub">Est. Pan-India Delivery in 3-5 Days</div>
                </div>
              </div>

              {/* Promo Coupon Form */}
              <div className="sidebar-coupon-box mt-3 mb-3">
                {appliedCoupon ? (
                  <div className="applied-coupon-banner">
                    <div className="c-info">
                      <Tag size={14} className="text-emerald-500" />
                      <span className="c-code">{appliedCoupon.code}</span>
                      <span className="c-disc">({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`})</span>
                    </div>
                    <button type="button" onClick={removeCoupon} className="c-remove-btn">Remove</button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!couponInput.trim()) return;
                      const ok = await applyCoupon(couponInput);
                      if (ok) setCouponInput('');
                    }}
                    className="coupon-form-desktop"
                  >
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. WELCOME20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="coupon-input-desktop"
                    />
                    <button type="submit" className="coupon-btn-desktop">Apply</button>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="summary-price-breakdown">
                <div className="calc-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>

                {combinedSavings > 0 && (
                  <div className="calc-row text-success font-bold">
                    <span>🎉 Total Savings</span>
                    <span>-₹{combinedSavings.toFixed(0)}</span>
                  </div>
                )}

                <div className="calc-row">
                  <span>Shipping Fee</span>
                  <span>{shipping === 0 ? <strong className="text-success">FREE</strong> : `₹${shipping}`}</span>
                </div>

                <div className="calc-divider" />

                <div className="calc-row total-pay-row">
                  <span>Total Payable</span>
                  <span className="total-val">₹{totalPrice.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mobile Fixed Bottom Sticky Place Order CTA Bar */}
      <div className="mobile-sticky-checkout-bar">
        <div className="mobile-bar-price-info">
          <span className="mobile-bar-total-val">₹{totalPrice.toFixed(0)}</span>
          <span className="mobile-bar-tax-lbl">Total Payable</span>
        </div>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="mobile-bar-place-order-btn"
        >
          {submitting ? 'Placing...' : 'PLACE ORDER'} <ArrowRight size={16} />
        </button>
      </div>

      {/* Embedded CSS Design Tokens & Styles */}
      <style jsx>{`
        .checkout-clean-container {
          background: var(--bg-primary);
          min-height: 100vh;
          padding-top: 1.5rem;
          padding-bottom: 5rem;
          color: var(--text-primary);
        }

        /* ------------------ HEADER & STEPPER ------------------ */
        .checkout-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1.25rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .brand-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .brand-logo-txt {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: var(--text-primary);
          text-decoration: none;
        }

        .secure-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 3px 8px;
          border-radius: 99px;
          letter-spacing: 0.05em;
        }

        .checkout-steps-stepper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .step-badge {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 900;
          flex-shrink: 0;
        }

        .step-completed {
          color: #10b981;
        }
        .step-completed .step-badge {
          background: #10b981;
          color: #ffffff;
          border-color: #10b981;
        }

        .step-active {
          color: var(--text-primary);
        }
        .step-active .step-badge {
          background: var(--accent-primary, #dc2626);
          color: #ffffff;
          border-color: var(--accent-primary, #dc2626);
        }

        .step-connector {
          width: 24px;
          height: 2px;
          background: var(--border-color);
          flex-shrink: 0;
        }
        .step-connector.active {
          background: #10b981;
        }

        /* ------------------ MOBILE ACCORDION ------------------ */
        .mobile-order-summary-bar {
          display: none;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin-bottom: 1.25rem;
          overflow: hidden;
        }

        .mobile-summary-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.95rem;
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        .toggle-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .thumb-stack-mini {
          display: flex;
          align-items: center;
          margin-right: 2px;
        }

        .stack-img {
          width: 26px;
          height: 32px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: -8px;
          border: 1.5px solid var(--bg-secondary);
        }

        .summary-qty-lbl {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .toggle-total-price {
          font-size: 0.95rem;
          font-weight: 900;
          color: var(--accent-primary, #dc2626);
        }

        .mobile-summary-expand-content {
          padding: 0.85rem 0.95rem 1rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-tertiary);
        }

        .items-list-compact {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .item-row-compact {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .item-img-sm {
          width: 48px !important;
          height: 58px !important;
          object-fit: cover !important;
          border-radius: 8px !important;
          border: 1px solid var(--border-color) !important;
          flex-shrink: 0 !important;
        }

        .item-info-sm {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .item-title-sm {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .item-meta-sm {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .item-price-sm {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--accent-primary, #dc2626);
          flex-shrink: 0;
        }

        .coupon-box-wrap {
          margin-top: 0.75rem;
        }

        .coupon-input-form {
          display: flex;
          gap: 0.5rem;
        }

        .coupon-input-field {
          flex: 1;
          padding: 0.45rem 0.65rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          outline: none;
        }

        .coupon-apply-btn {
          padding: 0.45rem 0.85rem;
          background: var(--text-primary);
          color: var(--bg-primary);
          font-size: 0.75rem;
          font-weight: 800;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }

        .applied-coupon-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 8px;
          font-size: 0.75rem;
        }

        .coupon-txt-info {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
          color: #10b981;
        }

        .remove-coupon-btn {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
        }

        .price-breakdown-rows {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-top: 0.75rem;
          padding-top: 0.65rem;
          border-top: 1px dashed var(--border-color);
        }

        .p-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .p-total-row {
          font-size: 0.92rem;
          font-weight: 900;
          color: var(--text-primary);
          border-top: 1px solid var(--border-color);
          padding-top: 0.45rem;
          margin-top: 0.35rem;
        }

        .p-total-val {
          color: var(--accent-primary, #dc2626);
          font-size: 1.05rem;
        }

        /* ------------------ MAIN 2-COLUMN GRID ------------------ */
        .checkout-main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2.5rem;
          align-items: start;
        }

        .checkout-form-card {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section-block {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: var(--shadow-sm);
        }

        .section-head-row {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .section-step-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-primary, #dc2626);
          color: #ffffff;
          font-weight: 900;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-heading {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .section-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* ------------------ FORM FIELDS & INPUTS ------------------ */
        .clean-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.1rem;
        }

        .col-span-2 { grid-column: span 2; }
        .col-span-1 { grid-column: span 1; }

        .form-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .label-flex-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .clean-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .val-status {
          font-size: 0.72rem;
          font-weight: 700;
        }
        .val-success { color: #10b981; }
        .val-danger { color: #ef4444; }
        .val-muted { color: var(--text-muted); }

        .clean-input, .clean-select, .clean-textarea {
          width: 100%;
          padding: 0.75rem 0.95rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 9px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          outline: none;
          transition: all 0.2s ease;
        }

        .clean-input:focus, .clean-select:focus, .clean-textarea:focus {
          border-color: var(--accent-primary, #dc2626);
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
        }

        .input-error {
          border-color: #ef4444 !important;
        }

        .phone-prefix-input-box {
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 9px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .phone-prefix-input-box:focus-within {
          border-color: var(--accent-primary, #dc2626);
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
        }

        .country-prefix {
          padding: 0.75rem 0.85rem;
          background: var(--bg-tertiary);
          border-right: 1px solid var(--border-color);
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .phone-field {
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }

        .city-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          padding-left: 2.1rem !important;
          padding-right: 2rem !important;
          font-size: 0.82rem !important;
          height: 36px;
        }

        .clear-search-btn {
          position: absolute;
          right: 8px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .field-hint {
          font-size: 0.73rem;
          color: var(--text-muted);
          line-height: 1.35;
        }

        /* ------------------ PAYMENT OPTIONS CARDS ------------------ */
        .payment-options-grid {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .payment-option-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 1.25rem;
          background: var(--bg-primary);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .payment-option-card:hover {
          border-color: rgba(220, 38, 38, 0.4);
        }

        .payment-option-card.active-option {
          border-color: var(--accent-primary, #dc2626);
          background: rgba(220, 38, 38, 0.04);
        }

        .option-radio-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .active-option .option-radio-dot {
          border-color: var(--accent-primary, #dc2626);
        }

        .radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-primary, #dc2626);
        }

        .option-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .option-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .option-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .option-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .badge-cod-tag {
          font-size: 0.65rem;
          font-weight: 900;
          color: #d97706;
          background: rgba(217, 119, 6, 0.12);
          border: 1px solid rgba(217, 119, 6, 0.25);
          padding: 2px 7px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .payment-option-card.disabled-option {
          opacity: 0.65;
          cursor: not-allowed;
          background: var(--bg-tertiary);
          border-style: dashed;
        }

        .payment-option-card.disabled-option:hover {
          border-color: var(--border-color);
        }

        .badge-coming-soon-tag {
          font-size: 0.62rem;
          font-weight: 900;
          color: #9ca3af;
          background: rgba(156, 163, 175, 0.15);
          border: 1px solid rgba(156, 163, 175, 0.3);
          padding: 2px 7px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        /* ------------------ BUTTONS & TRUST STRIP ------------------ */
        .btn-place-order-large {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 1.05rem 2rem;
          background: var(--text-primary);
          color: var(--bg-primary);
          font-size: 1.05rem;
          font-weight: 900;
          letter-spacing: 0.03em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: var(--shadow-md);
        }

        .btn-place-order-large:hover {
          background: var(--accent-primary, #dc2626);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(220, 38, 38, 0.35);
        }

        .trust-strip-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .trust-dot {
          opacity: 0.4;
        }

        .support-link-wrap {
          text-align: center;
        }

        .whatsapp-support-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .whatsapp-support-link:hover {
          color: #25d366;
        }

        /* ------------------ STICKY SUMMARY SIDEBAR ------------------ */
        .sticky-summary-card {
          position: sticky;
          top: 90px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .summary-card-title {
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0 0 1rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .summary-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          max-height: 260px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .summary-item-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .summary-item-img {
          width: 48px;
          height: 58px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
        }

        .summary-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .summary-item-name {
          font-size: 0.82rem;
          font-weight: 700;
          line-height: 1.25;
          color: var(--text-primary);
        }

        .summary-item-specs {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .summary-item-price {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--accent-primary, #dc2626);
        }

        .delivery-estimate-box {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 0.9rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
        }

        .truck-icon {
          color: var(--accent-primary, #dc2626);
          flex-shrink: 0;
        }

        .est-title {
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .est-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* Coupon Desktop */
        .coupon-form-desktop {
          display: flex;
          gap: 0.5rem;
        }

        .coupon-input-desktop {
          flex: 1;
          padding: 0.55rem 0.75rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          outline: none;
        }

        .coupon-btn-desktop {
          padding: 0.55rem 0.95rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .coupon-btn-desktop:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
        }

        .applied-coupon-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0.85rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 8px;
        }

        .c-info {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
        }

        .c-code {
          font-weight: 900;
          color: #10b981;
        }

        .c-disc {
          font-weight: 700;
          color: var(--text-muted);
        }

        .c-remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
        }

        /* Breakdown */
        .summary-price-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .calc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text-secondary);
        }

        .calc-divider {
          height: 1px;
          background: var(--border-color);
          margin: 0.4rem 0;
        }

        .total-pay-row {
          font-size: 1.05rem;
          font-weight: 900;
          color: var(--text-primary);
        }

        .total-val {
          color: var(--accent-primary, #dc2626);
          font-size: 1.15rem;
        }

        /* ------------------ MOBILE STICKY BOTTOM BAR ------------------ */
        .mobile-sticky-checkout-bar {
          display: none;
        }

        /* ------------------ RESPONSIVE BREAKPOINTS ------------------ */
        @media (max-width: 900px) {
          .checkout-header-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding-bottom: 0.85rem;
            margin-bottom: 1rem;
          }

          .checkout-steps-stepper {
            width: 100%;
            justify-content: space-between;
            gap: 0.25rem;
          }

          .step-item {
            font-size: 0.72rem;
            gap: 3px;
          }

          .step-badge {
            width: 18px;
            height: 18px;
            font-size: 0.65rem;
          }

          .step-connector {
            width: auto;
            flex: 1;
            min-width: 8px;
          }

          .checkout-main-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .checkout-summary-column {
            display: none;
          }

          .mobile-order-summary-bar {
            display: block;
          }

          .form-section-block {
            padding: 1.1rem;
          }

          .clean-form-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }

          .col-span-1 {
            grid-column: span 2;
          }

          .desktop-submit-wrap {
            display: none;
          }

          .mobile-sticky-checkout-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(15, 15, 18, 0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            padding: 0.75rem 1rem;
            z-index: 999;
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
          }

          .mobile-bar-price-info {
            display: flex;
            flex-direction: column;
          }

          .mobile-bar-total-val {
            font-size: 1.1rem;
            font-weight: 900;
            color: #ffffff;
          }

          .mobile-bar-tax-lbl {
            font-size: 0.68rem;
            color: var(--text-muted);
          }

          .mobile-bar-place-order-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 0.75rem 1.4rem;
            background: var(--accent-primary, #dc2626);
            color: #ffffff;
            font-size: 0.9rem;
            font-weight: 900;
            border-radius: 10px;
            border: none;
            cursor: pointer;
          }
        }
      `}</style>
    </div>
  );
}
