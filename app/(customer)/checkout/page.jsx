'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, ArrowRight, Lock, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';

const INDIAN_STATES_CITIES = {
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore', 'Thanjavur', 'Tuticorin', 'Nagercoil', 'Dindigul', 'Kanchipuram', 'Cuddalore', 'Kumbakonam', 'Other'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Navi Mumbai', 'Nanded', 'Sangli', 'Latur', 'Other'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Gulbarga', 'Davanagere', 'Bellary', 'Shimoga', 'Tumakuru', 'Udupi', 'Bidar', 'Hospet', 'Other'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'North East Delhi', 'South West Delhi', 'Other'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Other'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Bharuch', 'Vapi', 'Other'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj (Allahabad)', 'Noida', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Jhansi', 'Mathura', 'Other'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Asansol', 'Durgapur', 'Bardhaman', 'Malda', 'Baharampur', 'Kharagpur', 'Haldia', 'Other'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad', 'Malappuram', 'Pathanamthitta', 'Other'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur', 'Eluru', 'Ongole', 'Other'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Other'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga', 'Other'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Other'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Singrauli', 'Other'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Chhapra', 'Other'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Other'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Other'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Other'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Other'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Other'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Hamirpur', 'Bilaspur', 'Una', 'Other'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital', 'Kashipur', 'Rudrapur', 'Other'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Udhampur', 'Baramulla', 'Kathua', 'Other'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Other'],
  'Chandigarh': ['Chandigarh'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Other'],
  'Manipur': ['Imphal', 'Churachandpur', 'Thoubal', 'Other'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Other'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Other'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Other'],
  'Sikkim': ['Gangtok', 'Namchi', 'Geyzing', 'Other'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Other'],
  'Andaman and Nicobar Islands': ['Port Blair', 'Other'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa', 'Other'],
  'Ladakh': ['Leh', 'Kargil', 'Other'],
  'Lakshadweep': ['Kavaratti', 'Other']
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, getSubtotal, getDiscountAmount, getTotalPrice, clearCart } = useCart();
  const { addToast } = useToast();

  // Extract clean 10-digit phone if available
  const extractPhoneDigits = (raw) => {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    return digits.slice(-10);
  };

  const [phoneDigits, setPhoneDigits] = useState(extractPhoneDigits(user?.phone));
  const [customCity, setCustomCity] = useState('');

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    street: user?.address?.street || '',
    landmark: user?.address?.landmark || '',
    city: user?.address?.city || 'Chennai',
    state: user?.address?.state || 'Tamil Nadu',
    postalCode: user?.address?.postalCode || '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        street: prev.street || user.address?.street || '',
        landmark: prev.landmark || user.address?.landmark || '',
        city: prev.city || user.address?.city || 'Chennai',
        state: prev.state || user.address?.state || 'Tamil Nadu',
        postalCode: prev.postalCode || user.address?.postalCode || '',
        country: 'India',
      }));
      if (user.phone && !phoneDigits) {
        setPhoneDigits(extractPhoneDigits(user.phone));
      }
    }
  }, [user]);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = subtotal >= 999 ? 0 : 99;
  const totalPrice = getTotalPrice();

  if (cartItems.length === 0) {
    return (
      <div className="container text-center py-5">
        <h2>Your Shopping Bag is Empty</h2>
        <p className="mt-2 text-muted">Add products to your cart before proceeding to checkout.</p>
        <Link href="/products" className="btn btn-primary mt-3">Browse Products</Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'state') {
        const availableCities = INDIAN_STATES_CITIES[value] || [];
        updated.city = availableCities[0] || '';
        setCustomCity('');
      }
      return updated;
    });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhoneDigits(val);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // 1. Mandatory Phone Validation (+91 10-digit Indian Mobile)
    if (!phoneDigits || phoneDigits.length !== 10 || !/^[6-9]\d{9}$/.test(phoneDigits)) {
      addToast('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9', 'error');
      return;
    }

    // 2. Street Address Minimum 25 characters validation
    if (!formData.street || formData.street.trim().length < 25) {
      addToast('Street Address must be at least 25 characters long for accurate courier delivery', 'error');
      return;
    }

    // 3. Landmark validation
    if (!formData.landmark || !formData.landmark.trim()) {
      addToast('Please provide a Landmark (nearby famous shop/place)', 'error');
      return;
    }

    // 4. City determination
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
      const orderItems = cartItems.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || '',
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

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
          totalPrice,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        addToast('Order placed successfully! Redirecting to confirmation...', 'success');
        clearCart();
        router.push(`/orders/${data.order._id}`);
      } else {
        addToast(data.message || 'Failed to place order', 'error');
      }
    } catch (err) {
      addToast('An error occurred while placing order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCities = INDIAN_STATES_CITIES[formData.state] || [];

  return (
    <div className="container checkout-page-wrapper">
      <h1 className="checkout-title"><Lock size={24} /> Cash On Delivery Checkout</h1>

      <div className="checkout-grid">
        {/* Left Form Column */}
        <div className="checkout-form-column">
          <form onSubmit={handlePlaceOrder} className="checkout-form glass-panel">
            <h3>1. Delivery & Shipping Address (India)</h3>

            <div className="form-grid">
              {/* Receiver Name */}
              <div className="form-group span-2">
                <label className="form-label">Full Receiver Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="form-input"
                />
              </div>

              {/* Phone Number with Mandatory +91 Prefix */}
              <div className="form-group span-2">
                <label className="form-label d-flex justify-content-between align-items-center">
                  <span>Mobile Phone Number * (Starts with +91)</span>
                  <span className={phoneDigits.length === 10 ? "text-success font-bold" : "text-muted"} style={{ fontSize: '0.75rem' }}>
                    {phoneDigits.length === 10 ? '✓ 10 Digits Valid' : `${phoneDigits.length}/10 digits`}
                  </span>
                </label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix-badge">+91 🇮🇳</span>
                  <input
                    type="tel"
                    value={phoneDigits}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    className="phone-number-input"
                  />
                </div>
                <small className="subtext mt-1 d-block">
                  Enter 10-digit Indian mobile number. Courier OTP & SMS updates will be sent to +91 {phoneDigits || 'XXXXXXXXXX'}.
                </small>
              </div>

              {/* Street Address - Minimum 25 characters */}
              <div className="form-group span-2">
                <label className="form-label d-flex justify-content-between align-items-center">
                  <span>Street Address * (Min 25 letters)</span>
                  <span className={formData.street.length >= 25 ? "text-success font-bold" : "text-danger font-bold"} style={{ fontSize: '0.75rem' }}>
                    {formData.street.length >= 25 ? '✓ Valid Length' : `Min 25 letters required (${formData.street.length}/25)`}
                  </span>
                </label>
                <textarea
                  name="street"
                  rows={3}
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  minLength={25}
                  placeholder="e.g. Flat No. 402, 4th Floor, Sunshine Heights Apartment, 12th Main Road, Indiranagar"
                  className={`form-textarea ${formData.street.length > 0 && formData.street.length < 25 ? 'border-danger' : ''}`}
                />
                <small className="subtext mt-1 d-block">
                  Please provide complete house/flat no., building, street name (At least 25 characters required).
                </small>
              </div>

              {/* Landmark under Street Address */}
              <div className="form-group span-2">
                <label className="form-label">Landmark (Nearby famous place/shop) *</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Opposite Central Mall / Near HDFC Bank ATM / Beside Apollo Pharmacy"
                  className="form-input"
                />
                <small className="subtext mt-1 d-block">
                  Helps delivery agent locate your house easily.
                </small>
              </div>

              {/* State Selection */}
              <div className="form-group">
                <label className="form-label">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="form-select font-semibold"
                >
                  {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Selection dropdown based on State */}
              <div className="form-group">
                <label className="form-label">City * (Options for {formData.state})</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="form-select font-semibold"
                >
                  {currentCities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>

              {/* If "Other" city is selected, show input */}
              {formData.city === 'Other' && (
                <div className="form-group span-2">
                  <label className="form-label">Specify Your City Name *</label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    required
                    placeholder="Enter city/town name"
                    className="form-input"
                  />
                </div>
              )}

              {/* Postal PIN Code */}
              <div className="form-group">
                <label className="form-label">Postal / PIN Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  maxLength={6}
                  placeholder="e.g. 600001"
                  className="form-input"
                />
              </div>

              {/* Country */}
              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  type="text"
                  name="country"
                  value="India 🇮🇳"
                  readOnly
                  disabled
                  className="form-input form-input-disabled font-bold"
                />
              </div>
            </div>

            {/* Payment Method - Cash on Delivery */}
            <div className="payment-section mt-4">
              <h3>2. Payment Method</h3>
              <div className="payment-options">
                <label className="payment-card selected">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery (COD)"
                    checked={true}
                    readOnly
                  />
                  <div className="payment-method-info">
                    <span className="method-name font-bold">💵 Cash on Delivery (COD)</span>
                    <span className="method-desc">Pay cash to delivery executive when parcel arrives at your door</span>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg place-order-btn mt-4">
              {submitting ? 'Processing Order...' : `Place Cash On Delivery Order (₹${totalPrice.toFixed(0)})`} <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Right Summary Column */}
        <div className="checkout-summary-column">
          <div className="summary-card glass-panel">
            <h3>Order Summary ({cartItems.length} items)</h3>

            <div className="items-mini-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="item-mini-row">
                  <img src={item.product.images?.[0] || '/placeholder.png'} alt={item.product.name} className="mini-img" />
                  <div className="mini-info">
                    <span className="mini-name">{item.product.name}</span>
                    <span className="mini-specs">Qty: {item.quantity} | Size: {item.size} | {item.color}</span>
                  </div>
                  <span className="mini-price">₹{(item.product.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="summary-breakdown mt-3">
              <div className="row"><span>Items Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
              {discount > 0 && <div className="row text-success"><span>Promo Discount</span><span>-₹{discount.toFixed(0)}</span></div>}
              <div className="row"><span>Shipping Fee</span><span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(0)}`}</span></div>
              <div className="divider" />
              <div className="row total-row"><span>Total Payable</span><span>₹{totalPrice.toFixed(0)}</span></div>
            </div>

            <div className="security-note">
              <ShieldCheck size={16} color="#10b981" />
              <span>100% Premium Bio-Washed Cotton. Instant GST Invoice Generated.</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkout-page-wrapper {
          padding-top: 2rem;
        }
        .checkout-title {
          font-size: 2rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
        }

        .checkout-form {
          padding: 2rem;
          border-radius: var(--radius-lg);
        }
        .checkout-form h3 {
          font-size: 1.2rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
          font-weight: 800;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .span-2 { grid-column: span 2; }

        /* Phone input +91 prefix badge */
        .phone-input-wrapper {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-secondary);
          transition: border-color 0.2s ease;
        }
        .phone-input-wrapper:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .phone-prefix-badge {
          padding: 0.65rem 0.85rem;
          background: var(--bg-tertiary);
          border-right: 1.5px solid var(--border-color);
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--text-primary);
          white-space: nowrap;
          user-select: none;
        }
        .phone-number-input {
          flex: 1;
          border: none !important;
          outline: none !important;
          background: transparent !important;
          padding: 0.65rem 0.85rem !important;
          font-size: 0.95rem !important;
          font-weight: 700 !important;
          color: var(--text-primary) !important;
        }

        .border-danger {
          border-color: #ef4444 !important;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .payment-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--accent-primary);
          background: var(--accent-light);
          cursor: pointer;
        }
        .payment-method-info {
          display: flex;
          flex-direction: column;
        }
        .method-name {
          font-size: 0.95rem;
        }
        .method-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .place-order-btn {
          width: 100%;
          justify-content: center;
          padding: 0.9rem;
          font-size: 1.05rem;
          font-weight: 800;
        }

        .summary-card {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          position: sticky;
          top: 90px;
        }
        .summary-card h3 {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .items-mini-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 0.35rem;
        }
        .item-mini-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .mini-img {
          width: 46px;
          height: 56px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }
        .mini-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .mini-name { font-size: 0.85rem; font-weight: 700; line-height: 1.2; }
        .mini-specs { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
        .mini-price { font-size: 0.85rem; font-weight: 800; color: var(--accent-primary); }

        .summary-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        .summary-breakdown .row {
          display: flex;
          justify-content: space-between;
        }
        .divider {
          height: 1px;
          background: var(--border-color);
          margin: 0.5rem 0;
        }
        .total-row {
          font-size: 1.05rem;
          font-weight: 900;
        }

        .security-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 1.25rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }

        .font-bold { font-weight: 800; }
        .font-semibold { font-weight: 600; }

        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .span-2 { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
