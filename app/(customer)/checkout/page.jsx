'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, ArrowRight, Lock, MapPin, Phone, Search, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';

const INDIAN_STATES_CITIES = {
  'Tamil Nadu': [
    'Aarkadu', 'Adirampattinam', 'Adiyakkamangalam', 'Aduthurai', 'Alangudi', 'Alwarthirunagiri', 'Alāndurai', 'Ambasamudram', 'Ambaturai', 'Ambur',
    'Ammaianayakkanur', 'Anaikatti', 'Anaimalai', 'Anakkara', 'Anandathandavapuram', 'Anangur', 'Andampallam', 'Andevanahalli', 'Andipatti', 'Anekal',
    'Annur', 'Anuppampattu', 'Anvarthikanpettei', 'Arakkonam', 'Aralvaimozhi', 'Arani', 'Aranthangi', 'Ariyalur', 'Ariyanoor', 'Arumuganeri',
    'Aruppukkottai', 'Attadi', 'Attur', 'Auroville', 'Avinashi', 'Ayandur', 'Ayodhiyapatinam', 'Ayyampalayam', 'Ayyampettai', 'Banavarm',
    'Bangarapet', 'Batlagundu', 'Belukkurichchi', 'Bengaluru', 'Bhavani', 'Bhel Township', 'Bhutapandi', 'Bodinayakanur', 'Bommayapalayam', 'Bommidi',
    'Booluvampatti', 'Budalur', 'Buddireddipatti', 'Chalakudy', 'Chamarajanagara', 'Chellarcovil', 'Chengalpattu', 'Chengam', 'Chennai', 'Cherambadi',
    'Cheranmahadevi', 'Chettippattu', 'Cheyyur', 'Chidambaram', 'Chinna Salem', 'Chinnakanal', 'Chitra Nagar', 'Chittar Lake', 'Chittoor', 'Chittur',
    'Chittāmūr', 'Coimbatore', 'Colachel', 'Coonoor', 'Courtallam', 'Cuddalore', 'Cuddalore-Puducherry Administrative Boundary', 'Cumbum', 'Danishpet', 'Dasampatti',
    'Denkanikota', 'Devakottai', 'Devala', 'Devikolam', 'Dhanushkodi', 'Dhārāpuram', 'Eachangadu', 'Egattur', 'Elanthoppu', 'Elavur',
    'Eraniel', 'Eriyodu', 'Erode', 'Ethapur', 'Ganapathichettikulam', 'Gangaikonda Cholapuram', 'Genguvarpatti', 'Gingee', 'Gobichettipalayam', 'Golden Rock',
    'Gudalur', 'Gudiyatham', 'Guduvancheri', 'Gummidipundi', 'Gundlupet', 'Gvanagar', 'Harur', 'Hogenakkal', 'Hoskote', 'Hosur',
    'Huligal', 'Ilaiyankudi', 'Ingur', 'Iravanpatti', 'Ithalar', 'Jolarpet', 'Kadambattur', 'Kadambur', 'Kadayam', 'Kadayanallur',
    'Kaduvanur', 'Kalambur', 'Kalanivasal', 'Kalapet', 'Kalial', 'Kallagam', 'Kallakkurichi', 'Kallal', 'Kallidaikurichi', 'Kambarasampettai',
    'Kamudi', 'Kanakammachattram', 'Kanakapura', 'Kanchipuram', 'Kaniyambadi', 'Kannamangalam', 'Kannan Devan Hills', 'Kanyakumari', 'Karaikal', 'Karaikudi',
    'Karambavayal', 'Karumattampatti', 'Karungulam', 'Karunya Nagar', 'Karuppur', 'Karur', 'Kathadimattam', 'Katpadi', 'Kattankulathur', 'Kattumannarkoil',
    'Kavanur', 'Kilvelur', 'Kizha Ambur', 'Kodaikanal', 'Kollegal', 'Kollidam', 'Konni', 'Koolipalayam', 'Koonimedu', 'Koradacheri',
    'Korampallam', 'Kotagiri', 'Kothamangalam', 'Kottachchedu', 'Kottagudi', 'Kottakuppam', 'Kovilampoondi', 'Kovilpatti', 'Krishna Karanai', 'Krishnagiri',
    'Kuchanur', 'Kuilapalayam', 'Kulattur', 'Kulithalai', 'Kumaran Nagar', 'Kumbakonam', 'Kumily', 'Kuppam', 'Kurumbur', 'Kuthalam',
    'Kuthambakkam', 'Kuzhithurai', 'Kālpākkam', 'Kānādukāttān', 'Kāramadai', 'Kāverippattanam', 'Kāveripāk', 'Lalgudi', 'Latteri', 'Lokur',
    'Lovedale', 'Madurai', 'Madurantakam', 'Magudanchavadi', 'Mahabalipuram', 'Mailam', 'Malaiyāndipattanam', 'Malampuzha-I', 'Mallur', 'Malur',
    'Mambalapattu', 'Manamadurai', 'Manamedu', 'Manapparai', 'Manavur', 'Mandapam', 'Mandavi', 'Mangalam', 'Manganallur', 'Manimutharu',
    'Maniyachi', 'Manjakuppam', 'Manjakuttai', 'Mannargudi', 'Mannarkkad', 'Maraimalai Nagar', 'Marie Oulgaret', 'Marthandam', 'Marungai', 'Marungoor',
    'Masinagudi', 'Mattur', 'Mavelipalayam', 'Mayiladuthurai', 'Mekkarai', 'Melmaruvathur', 'Melnariyappanur', 'Melpattampakkam', 'Melpatti', 'Melur',
    'Mettupalayam', 'Mettur', 'Minjur', 'Mohanur', 'Morappur', 'Moratandi', 'Mudukulattur', 'Mudumalai', 'Mulligoor', 'Mundiyampakkam',
    'Munthal', 'Musiri', 'Muthalamada', 'Muthupet', 'Naduhatty', 'Nagapattinam', 'Nagercoil', 'Nagore', 'Namakkal', 'Nandhiyan Kudikkadu',
    'Nanguneri', 'Nannilam', 'Nattam', 'Nazareth', 'Nedumangad', 'Needamangalam', 'Nellikuppam', 'Nerinjippettai', 'Nettapakkam', 'Neyveli',
    'Neyyattinkara', 'Nidur', 'Nilakkottai', 'Nilambur', 'Oddanchatram', 'Olakur', 'Omalur', 'Ooty', 'Oragadam', 'Orattanadu',
    'Ottapidaram', 'Pachakuppam', 'Padavayal', 'Palakkad', 'Palakkodu', 'Palani', 'Palayam', 'Palayankottai', 'Palladam', 'Pallapatti',
    'Pallipalayam', 'Pallippattu', 'Palliyadi', 'Palmaner', 'Pamba Kovil Shandy', 'Panagudi', 'Panambakkam', 'Panangudi', 'Panruti', 'Papanasam',
    'Papasanam', 'Paramakudi', 'Parangipettai', 'Parassala', 'Pattukkottai', 'Pedda Nayakkanpalaiyam', 'Peermade', 'Pennadam', 'Pennagaram', 'Peralam',
    'Perambalūr', 'Perani', 'Peravurani', 'Periyakulam', 'Perumal Kovil Pathy', 'Perumālmalai', 'Perundurai', 'Pollachi', 'Polur', 'Ponneri',
    'Ponnirai', 'Poondi', 'Poondithangal', 'Poothurai', 'Poovar', 'Potheri', 'Pottaveli', 'Pudi', 'Puducherry', 'Pudukkottai',
    'Pudukudi', 'Pudumund', 'Pukkiravari', 'Puliyūr', 'Punalur', 'Punjai Puliyampatti', 'Pushpagiri', 'Puthiamputhur', 'Puttur', 'Pykara',
    'Pāchchalūr', 'Pālamedu', 'Radhapuram', 'Rajapalayam', 'Ramakkalmedu', 'Ramanathapuram', 'Rameshwaram', 'Ranipet', 'Rasipuram', 'Salem',
    'Saliamangalam', 'Samalpatti', 'Samayanallur', 'Samayapuram', 'Samudram', 'Sankagiri', 'Sankarankovil', 'Sannanallur', 'Saranthangi', 'Saravanampatty',
    'Sathyamangalam', 'Sattankulam', 'Sattiyakudi', 'Sattur', 'Satyavedu', 'Sembatti', 'Sendurai', 'Sengulam', 'Sethumadai', 'Sevoor',
    'Seydunganallur', 'Shenkottai', 'Shimla', 'Sholavandan', 'Silaiman', 'Sillakkudi', 'Singanallur', 'Singaperumal Koil', 'Sirkazhi', 'Sirumalai',
    'Sirumugai', 'Siruseri', 'Sivaganga', 'Sivagiri', 'Sivakasi', 'Solagampatti', 'Somanur', 'Sorapattu', 'Sriharikota', 'Sriperumbudur',
    'Srivaikuntam', 'Srivilliputhur', 'Srīrangam', 'Suchindram', 'Sulerikadu', 'Sulthan Bathery', 'Swamimalai', 'Tada', 'Taingapatam', 'Taiyūr',
    'Takkolam', 'Tarangambadi', 'Tenkasi', 'Thadikombu', 'Thalaivasal', 'Thalayathimund', 'Thanjavur', 'Tharumapuri', 'Thekkady', 'Theni',
    'Thindal', 'Thindukkal', 'Thirukadaiyur', 'Thirukkadaiyur', 'Thirumayam', 'Thirunageswaram', 'Thirunallar', 'Thirunankovil', 'Thiruparankundram', 'Thiruthangal',
    'Thiruthani', 'Thiruthuraipoondi', 'Thiruthuraiyur', 'Thiruvaiyaru', 'Thiruvalangadu', 'Thiruvallam', 'Thiruvarur', 'Thiruvavaduthurai', 'Thiruverumbur', 'Thiruvidaimarudur',
    'Thiruvisanallur', 'Thoothukudi', 'Thovalai', 'Thuckalay', 'Thuraiyur', 'Tindivanam', 'Tiruchendur', 'Tiruchengode', 'Tiruchirappalli', 'Tiruchuli',
    'Tirukoilur', 'Tirumalaisamudram', 'Tirumalpur', 'Tirumangalam', 'Tirunelveli', 'Tirupattur', 'Tiruppattur', 'Tirupporur', 'Tiruppuvanam', 'Tirupur',
    'Tiruvadanai', 'Tiruvannamalai', 'Tiruvettipuram', 'Tiruvādūr', 'Tozhuppedu', 'Tranquebar', 'Uchipuli', 'Udaiyarpalaiyam', 'Udumalaipettai', 'Udumbanchola',
    'Ulundurpet', 'Umayalparamancheri', 'Usilampatti', 'Uthamapalayam', 'Uthukuli', 'Uttangarai', 'Uttiramerur', 'Uttukkottai', 'Vadavalli', 'Vadipatti',
    'Vaduvanchal', 'Vaithīsvarankoil', 'Vallam', 'Vallampadugai', 'Vallioor', 'Valparai', 'Vandavasi', 'Vaniyambadi', 'Vannarpet', 'Varakalpattu',
    'Vasavasamudram', 'Vazhapadi', 'Vedasandur', 'Veerarakiyam', 'Velankanni', 'Velayuthampalayam', 'Velliyanai', 'Vellore', 'Veppadai', 'Vijayamanagaram',
    'Vijayamangalam', 'Vikravandi', 'Vilattikulam', 'Villiyanallur', 'Vilpatti', 'Viluppuram', 'Vinnamangalam', 'Virudhunagar', 'Vriddhachalam', 'Vythiri',
    'Walajabad', 'Walajapet', 'Walayar', 'West Mere', 'Yelagiri', 'Yercaud', 'Other'
  ],
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
};

const ALL_COUNTRIES = [
  'India 🇮🇳',
  'United States 🇺🇸',
  'United Kingdom 🇬🇧',
  'United Arab Emirates 🇦🇪',
  'Singapore 🇸🇬',
  'Malaysia 🇲🇾',
  'Canada 🇨🇦',
  'Australia 🇦🇺',
  'Germany 🇩🇪',
  'France 🇫🇷',
  'Saudi Arabia 🇸🇦',
  'Sri Lanka 🇱🇰',
  'Other Country 🌐',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { cartItems, getSubtotal, getDiscountAmount, getTotalPrice, clearCart } = useCart();
  const { addToast } = useToast();

  // Extract clean 10-digit phone if available (ignore dummy numbers)
  const extractPhoneDigits = (raw) => {
    if (!raw || raw.includes('12345') || raw.includes('00000')) return '';
    const digits = raw.replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : '';
  };

  const [phoneDigits, setPhoneDigits] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    street: user?.address?.street || '',
    landmark: user?.address?.landmark || '',
    city: user?.address?.city || '',
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
        city: prev.city || user.address?.city || '',
        state: prev.state || user.address?.state || 'Tamil Nadu',
        postalCode: prev.postalCode || user.address?.postalCode || '',
        country: 'India',
      }));
    }
  }, [user]);

  const METRO_CITIES = ['Chennai', 'Mumbai', 'Bengaluru', 'Delhi', 'New Delhi', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat'];

  // Calculate Shipping Fee based strictly on City
  const calculateCityShippingFee = (city) => {
    if (METRO_CITIES.includes(city)) return 49; // Express Metro City rate
    return 79; // Standard regional city rate
  };

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = calculateCityShippingFee(formData.city);
  const totalPrice = Math.max(0, subtotal - discount + shipping);

  if (cartItems.length === 0) {
    return (
      <div className="container text-center py-5">
        <h2>Your Cart is Empty</h2>
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
        updated.city = ''; // Prompt user to select city from all available cities for selected state
        setCitySearch('');
        setCustomCity('');
      }
      return updated;
    });
  };

  const stateCityList = INDIAN_STATES_CITIES[formData.state] || [];
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
        addToast('Order placed successfully! Delivery details saved to your profile.', 'success');
        clearCart();
        if (refreshUser) refreshUser();
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
                    
                    className="phone-number-input"
                  />
                </div>
                <small className="subtext mt-1 d-block">
                  e.g. 98765 43210 — Enter 10-digit Indian mobile number. Courier OTP & tracking updates sent to +91 {phoneDigits || '9876543210'}.
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
                 
                  className="form-input"
                />
                <small className="subtext mt-1 d-block">
                  Helps delivery agent locate your house easily.
                </small>
              </div>

              {/* State Selection - Fixed to Tamil Nadu */}
              <div className="form-group">
                <label className="form-label">State *</label>
                <select
                  name="state"
                  value="Tamil Nadu"
                  disabled
                  className="form-select font-semibold form-input-disabled"
                >
                  <option value="Tamil Nadu">Tamil Nadu (TN)</option>
                </select>
              </div>

              {/* City Selection dropdown with Live Search Filter */}
              <div className="form-group span-2">
                <label className="form-label d-flex justify-content-between align-items-center">
                  <span>City * ({stateCityList.length} Cities in Tamil Nadu)</span>
                  {formData.city && <span className="text-success font-bold" style={{ fontSize: '0.8rem' }}>✓ Selected: {formData.city}</span>}
                </label>

                {/* City Search Bar */}
                <div className="city-search-wrapper mb-2">
                  <Search size={16} className="city-search-icon" />
                  <input
                    type="text"
                   
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="form-input city-search-input"
                  />
                  {citySearch && (
                    <button
                      type="button"
                      onClick={() => setCitySearch('')}
                      className="clear-search-btn"
                      title="Clear Search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="form-select font-semibold"
                >
                  <option value="" disabled>
                    {filteredCities.length > 0
                      ? `-- Choose from ${filteredCities.length} ${citySearch ? 'Matching' : 'Available'} Cities --`
                      : '❌ No matching city found. Choose "Other" below'}
                  </option>
                  {filteredCities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
                <small className="subtext mt-1 d-block">
                  {citySearch ? `Showing ${filteredCities.length} of ${stateCityList.length} cities.` : 'Type in search box above to instantly find your city name.'}
                </small>
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
                 
                  className="form-input"
                />
              </div>

              {/* Country Selection Dropdown */}
              <div className="form-group">
                <label className="form-label">Country *</label>
                <select
                  name="country"
                  value={formData.country || 'India 🇮🇳'}
                  onChange={handleInputChange}
                  required
                  className="form-select font-bold"
                >
                  {ALL_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment Method - Cash on Delivery */}
            <div className="payment-method-section mt-4">
              <h3 className="section-title text-base font-bold mb-2">Payment Method</h3>
              <div className="cod-badge-container flex items-center gap-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                <input type="radio" checked readOnly className="accent-emerald-500" />
                <div>
                  <div className="font-bold text-sm text-emerald-400">Cash on Delivery (COD)</div>
                  <div className="text-xs text-muted">Pay with cash upon package delivery</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-block btn-lg mt-4 w-full text-center"
            >
              {submitting ? 'Placing Order...' : `Confirm Order (₹${totalPrice.toFixed(0)})`}
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
              <div className="row">
                <span>Shipping ({formData.city || 'City'})</span>
                <span>{shipping === 0 ? <strong className="text-success">FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div className="divider" />
              <div className="row total-row"><span>Total Payable</span><span>₹{totalPrice.toFixed(0)}</span></div>
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

        /* City Live Search Box */
        .city-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .city-search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .city-search-input {
          padding-left: 2.3rem !important;
          padding-right: 2.2rem !important;
          font-size: 0.9rem !important;
          border-color: var(--accent-primary) !important;
        }
        .clear-search-btn {
          position: absolute;
          right: 10px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .clear-search-btn:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
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
          .checkout-page-wrapper {
            padding-top: 1rem;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .checkout-title {
            font-size: 1.35rem;
            margin-bottom: 1rem;
          }
          .checkout-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          .checkout-form-column, .checkout-summary-column {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 !important;
          }
          .checkout-form-column {
            order: 2;
          }
          .checkout-summary-column {
            order: 1;
          }
          .summary-card, .checkout-form {
            position: relative;
            top: 0;
            padding: 1rem !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .payment-section, .payment-options, .payment-card {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .payment-card {
            padding: 0.85rem !important;
            gap: 0.75rem !important;
          }
          .form-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .span-2 { grid-column: span 1; }
          .mini-name { font-size: 0.82rem; }
          .mini-specs { font-size: 0.72rem; }
          .mini-price { font-size: 0.82rem; }
          .phone-prefix-badge { padding: 0.55rem 0.65rem; font-size: 0.82rem; }
          .phone-number-input { padding: 0.55rem 0.65rem !important; font-size: 0.88rem !important; }
        }
      `}</style>
    </div>
  );
}
