export const INITIAL_EMPLOYEES = [
  {
    id: 'emp-1',
    name: 'Vikram Singh',
    phone: '+91 98451 22345',
    department: 'Hair Cut & Styling',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    joinedDate: '2025-01-15',
    presentToday: true,
    totalPresentDays: 24,
    totalServiced: 142
  },
  {
    id: 'emp-2',
    name: 'Ananya Sharma',
    phone: '+91 97123 44567',
    department: 'Facial & Skincare',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    joinedDate: '2025-02-10',
    presentToday: true,
    totalPresentDays: 26,
    totalServiced: 118
  },
  {
    id: 'emp-3',
    name: 'Rahul Verma',
    phone: '+91 96234 88990',
    department: 'Hair Straightening & Coloring',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    joinedDate: '2025-03-01',
    presentToday: false,
    totalPresentDays: 20,
    totalServiced: 95
  },
  {
    id: 'emp-4',
    name: 'Karan Mehra',
    phone: '+91 98845 11223',
    department: 'Beard Grooming & Shaving',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    joinedDate: '2025-04-12',
    presentToday: true,
    totalPresentDays: 25,
    totalServiced: 160
  },
  {
    id: 'emp-5',
    name: 'Pooja Hegde',
    phone: '+91 97766 55443',
    department: 'Spa, D-Tan & Massage',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    joinedDate: '2025-05-20',
    presentToday: true,
    totalPresentDays: 23,
    totalServiced: 84
  }
];

export const INITIAL_SERVICES = [
  {
    id: 'srv-1',
    name: 'Signature Royal Haircut & Styling',
    department: 'Hair Cut & Styling',
    price: 450,
    duration: 35,
    description: 'Precision scissor cut, hot towel cleanse, scalp massage & gold serum styling.',
    image: '/images/haircut_action.jpg'
  },
  {
    id: 'srv-2',
    name: 'Luxury Beard Sculpting & Shave',
    department: 'Beard Grooming & Shaving',
    price: 300,
    duration: 25,
    description: 'Razor sharp line work, organic beard oil nourishment & soothing aftershave.',
    image: '/images/beard_grooming.jpg'
  },
  {
    id: 'srv-3',
    name: 'Golden Glow Radiance Facial',
    department: 'Facial & Skincare',
    price: 1400,
    duration: 50,
    description: '24K gold foil exfoliation, deep pore purification and collagen hydration.',
    image: '/images/facial_spa.jpg'
  },
  {
    id: 'srv-4',
    name: 'Instant Brightening D-Tan Therapy',
    department: 'Spa, D-Tan & Massage',
    price: 650,
    duration: 30,
    description: 'Eucalyptus enriched herbal de-tanning pack for instant natural luminance.',
    image: '/images/services/dtan_therapy.jpg'
  },
  {
    id: 'srv-5',
    name: 'Brazilian Keratin Straightening',
    department: 'Hair Straightening & Coloring',
    price: 3500,
    duration: 120,
    description: 'Advanced amino-infusion frizz elimination for silky straight mirror finish.',
    image: '/images/services/keratin_straightening.jpg'
  },
  {
    id: 'srv-6',
    name: 'Executive Head & Shoulder Massage',
    department: 'Spa, D-Tan & Massage',
    price: 550,
    duration: 30,
    description: 'Warm almond oil pressure point therapy releasing tension and fatigue.',
    image: '/images/services/head_massage.jpg'
  },
  {
    id: 'srv-7',
    name: 'Classic Mustache & Beard Trimming',
    department: 'Beard Grooming & Shaving',
    price: 180,
    duration: 15,
    description: 'Clipper grade trim, shape correction and conditioning wax.',
    image: '/images/services/beard_trim.jpg'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prd-1',
    name: 'Aura Moroccan Argan Hair Oil (100ml)',
    category: 'Hair Care',
    price: 850,
    stock: 28,
    soldCount: 42,
    description: 'Pure cold-pressed Moroccan oil for intense hydration and mirror shine.',
    image: '/images/products/argan_hair_oil.jpg'
  },
  {
    id: 'prd-2',
    name: 'Gold Cedarwood Beard Softener Balm (60g)',
    category: 'Beard Care',
    price: 499,
    stock: 19,
    soldCount: 35,
    description: 'Shea butter & organic cedarwood balm for a tame, fragrant beard.',
    image: '/images/products/beard_softener_balm.jpg'
  },
  {
    id: 'prd-3',
    name: 'Botanical Clarifying Clay Face Wash (150ml)',
    category: 'Skin Treatment',
    price: 390,
    stock: 34,
    soldCount: 56,
    description: 'Activated charcoal and tea tree wash for pollution defense.',
    image: '/images/products/clay_face_wash.jpg'
  },
  {
    id: 'prd-4',
    name: 'Matte Finish Strong Hold Clay Pomade (100g)',
    category: 'Styling Wax',
    price: 620,
    stock: 15,
    soldCount: 48,
    description: 'Non-greasy, all-day reworkable hold with subtle sandalwood fragrance.',
    image: '/images/products/pomade_hair_clay.jpg'
  },
  {
    id: 'prd-5',
    name: 'Keratin Color Protect Restoring Mask (250ml)',
    category: 'Hair Care',
    price: 1100,
    stock: 12,
    soldCount: 22,
    description: 'Intense reconstructive protein mask for treated and colored hair.',
    image: '/images/products/keratin_hair_mask.jpg'
  }
];


export const INITIAL_MEMBERSHIPS = [
  {
    id: 'mem-1',
    name: 'Silver Elite Club',
    durationMonths: 3,
    price: 1999,
    discountPercentage: 10,
    perks: ['10% off on all Services', '1 Complimentary Royal Haircut', 'Priority Chair Booking'],
    color: '#9CA3AF'
  },
  {
    id: 'mem-2',
    name: 'Gold Crown Club',
    durationMonths: 6,
    price: 3499,
    discountPercentage: 15,
    perks: ['15% off Services & Products', '2 Complimentary Haircuts + 1 D-Tan', 'Free Head Massage every month'],
    color: '#D4AF37'
  },
  {
    id: 'mem-3',
    name: 'Imperial Diamond VIP',
    durationMonths: 12,
    price: 5999,
    discountPercentage: 25,
    perks: ['25% off All Services & Products', 'Unlimited Beard Trims', '4 Deluxe Facials + Spa Access', 'Dedicated Master Stylist'],
    color: '#1A1D24'
  }
];

export const INITIAL_PACKAGES = [
  {
    id: 'pkg-1',
    name: 'Classic Grooming Combo',
    includedServices: ['Signature Royal Haircut & Styling', 'Classic Mustache & Beard Trimming'],
    originalPrice: 630,
    packagePrice: 520,
    duration: 50,
    description: 'Clean modern haircut paired with a sharp beard trim for quick everyday polish.',
    image: '/images/haircut_action.jpg'
  },
  {
    id: 'pkg-2',
    name: 'Gentleman Shave & Style',
    includedServices: ['Signature Royal Haircut & Styling', 'Luxury Beard Sculpting & Shave'],
    originalPrice: 750,
    packagePrice: 620,
    duration: 60,
    description: 'Haircut and hot towel straight razor shaving experience with premium oils.',
    image: '/images/beard_grooming.jpg'
  },
  {
    id: 'pkg-3',
    name: 'Royal Glow: Haircut + Facial + D-Tan',
    includedServices: ['Signature Royal Haircut & Styling', 'Golden Glow Radiance Facial', 'Instant Brightening D-Tan Therapy'],
    originalPrice: 2500,
    packagePrice: 1950,
    duration: 115,
    description: 'Our most demanded combo! Complete hair transformation combined with 24K gold facial and sun de-tanning.',
    image: '/images/facial_spa.jpg'
  },
  {
    id: 'pkg-4',
    name: 'Supreme Wedding & Party Makeover',
    includedServices: ['Signature Royal Haircut & Styling', 'Luxury Beard Sculpting & Shave', 'Golden Glow Radiance Facial', 'Executive Head & Shoulder Massage'],
    originalPrice: 2700,
    packagePrice: 2150,
    duration: 140,
    description: 'Complete red-carpet rejuvenation package for weddings, milestones and celebrations.',
    image: '/images/salon_hero.jpg'
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Rajesh Kanna',
    phone: '9840123456',
    registeredDate: '2026-09-12',
    membershipPlan: 'Gold Crown Club',
    membershipExpiry: '2027-03-12',
    notes: 'Prefers scissors over machine on top; Vikram stylist',
    history: [
      {
        billId: 'BILL-1001',
        date: '2026-10-17',
        services: ['Signature Royal Haircut & Styling', 'Luxury Beard Sculpting & Shave'],
        employeeName: 'Vikram Singh',
        products: [{ name: 'Aura Moroccan Argan Hair Oil (100ml)', price: 850, quantity: 1 }],
        amount: 1487, // after 15% gold discount
        paymentMethod: 'UPI',
        upiRef: 'UPI/261017/00491'
      },
      {
        billId: 'BILL-0982',
        date: '2026-10-02',
        services: ['Signature Royal Haircut & Styling'],
        employeeName: 'Vikram Singh',
        products: [],
        amount: 382,
        paymentMethod: 'Cash'
      }
    ]
  },
  {
    id: 'cust-2',
    name: 'Deepak Kumar',
    phone: '9789012345',
    registeredDate: '2026-09-20',
    membershipPlan: null,
    membershipExpiry: null,
    notes: 'Regular clean shave and beard shaping',
    history: [
      {
        billId: 'BILL-1002',
        date: '2026-10-17',
        services: ['Luxury Beard Sculpting & Shave'],
        employeeName: 'Karan Mehra',
        products: [{ name: 'Gold Cedarwood Beard Softener Balm (60g)', price: 499, quantity: 1 }],
        amount: 799,
        paymentMethod: 'Cash'
      }
    ]
  },
  {
    id: 'cust-3',
    name: 'Sneha Sundaram',
    phone: '9876543210',
    registeredDate: '2026-08-14',
    membershipPlan: 'Imperial Diamond VIP',
    membershipExpiry: '2027-08-14',
    notes: 'Sensitive skin, uses gentle herbal facial products',
    history: [
      {
        billId: 'BILL-1003',
        date: '2026-10-16',
        services: ['Golden Glow Radiance Facial', 'Instant Brightening D-Tan Therapy'],
        employeeName: 'Ananya Sharma',
        products: [{ name: 'Botanical Clarifying Clay Face Wash (150ml)', price: 390, quantity: 1 }],
        amount: 1830, // 25% discount
        paymentMethod: 'UPI',
        upiRef: 'UPI/261016/91238'
      }
    ]
  },
  {
    id: 'cust-4',
    name: 'Arun Prakash',
    phone: '9944112233',
    registeredDate: '2026-10-01',
    membershipPlan: 'Silver Elite Club',
    membershipExpiry: '2027-01-01',
    notes: 'Fade haircut with textured crop',
    history: [
      {
        billId: 'BILL-1004',
        date: '2026-10-15',
        services: ['Signature Royal Haircut & Styling'],
        employeeName: 'Vikram Singh',
        products: [{ name: 'Matte Finish Strong Hold Clay Pomade (100g)', price: 620, quantity: 1 }],
        amount: 963,
        paymentMethod: 'UPI',
        upiRef: 'UPI/261015/48201'
      }
    ]
  },
  {
    id: 'cust-5',
    name: 'Manoj Viswanathan',
    phone: '9443210987',
    registeredDate: '2026-10-10',
    membershipPlan: null,
    membershipExpiry: null,
    notes: 'Walk-in customer',
    history: [
      {
        billId: 'BILL-1005',
        date: '2026-10-14',
        services: ['Brazilian Keratin Straightening'],
        employeeName: 'Rahul Verma',
        products: [{ name: 'Keratin Color Protect Restoring Mask (250ml)', price: 1100, quantity: 1 }],
        amount: 4600,
        paymentMethod: 'Cash'
      }
    ]
  }
];

export const INITIAL_BILLS = [
  {
    id: 'BILL-1001',
    date: '2026-10-17',
    time: '11:15 AM',
    customerId: 'cust-1',
    customerName: 'Rajesh Kanna',
    customerPhone: '9840123456',
    employeeId: 'emp-1',
    employeeName: 'Vikram Singh',
    services: [
      { name: 'Signature Royal Haircut & Styling', price: 450, employeeName: 'Vikram Singh' },
      { name: 'Luxury Beard Sculpting & Shave', price: 300, employeeName: 'Karan Mehra' }
    ],
    products: [
      { id: 'prd-1', name: 'Aura Moroccan Argan Hair Oil (100ml)', price: 850, quantity: 1 }
    ],
    packageApplied: null,
    subtotal: 1600,
    membershipDiscount: 113,
    totalAmount: 1487,
    paymentMethod: 'UPI',
    upiRef: 'UPI/261017/00491',
    status: 'Paid'
  },
  {
    id: 'BILL-1002',
    date: '2026-10-17',
    time: '12:05 PM',
    customerId: 'cust-2',
    customerName: 'Deepak Kumar',
    customerPhone: '9789012345',
    employeeId: 'emp-4',
    employeeName: 'Karan Mehra',
    services: [
      { name: 'Luxury Beard Sculpting & Shave', price: 300, employeeName: 'Karan Mehra' }
    ],
    products: [
      { id: 'prd-2', name: 'Gold Cedarwood Beard Softener Balm (60g)', price: 499, quantity: 1 }
    ],
    packageApplied: null,
    subtotal: 799,
    membershipDiscount: 0,
    totalAmount: 799,
    paymentMethod: 'Cash',
    upiRef: '',
    status: 'Paid'
  },
  {
    id: 'BILL-1003',
    date: '2026-10-16',
    time: '03:40 PM',
    customerId: 'cust-3',
    customerName: 'Sneha Sundaram',
    customerPhone: '9876543210',
    employeeId: 'emp-2',
    employeeName: 'Ananya Sharma',
    services: [
      { name: 'Golden Glow Radiance Facial', price: 1400, employeeName: 'Ananya Sharma' },
      { name: 'Instant Brightening D-Tan Therapy', price: 650, employeeName: 'Pooja Hegde' }
    ],
    products: [
      { id: 'prd-3', name: 'Botanical Clarifying Clay Face Wash (150ml)', price: 390, quantity: 1 }
    ],
    packageApplied: null,
    subtotal: 2440,
    membershipDiscount: 610,
    totalAmount: 1830,
    paymentMethod: 'UPI',
    upiRef: 'UPI/261016/91238',
    status: 'Paid'
  },
  {
    id: 'BILL-1004',
    date: '2026-10-15',
    time: '04:10 PM',
    customerId: 'cust-4',
    customerName: 'Arun Prakash',
    customerPhone: '9944112233',
    employeeId: 'emp-1',
    employeeName: 'Vikram Singh',
    services: [
      { name: 'Signature Royal Haircut & Styling', price: 450, employeeName: 'Vikram Singh' }
    ],
    products: [
      { id: 'prd-4', name: 'Matte Finish Strong Hold Clay Pomade (100g)', price: 620, quantity: 1 }
    ],
    packageApplied: null,
    subtotal: 1070,
    membershipDiscount: 107,
    totalAmount: 963,
    paymentMethod: 'UPI',
    upiRef: 'UPI/261015/48201',
    status: 'Paid'
  },
  {
    id: 'BILL-1005',
    date: '2026-10-14',
    time: '01:30 PM',
    customerId: 'cust-5',
    customerName: 'Manoj Viswanathan',
    customerPhone: '9443210987',
    employeeId: 'emp-3',
    employeeName: 'Rahul Verma',
    services: [
      { name: 'Brazilian Keratin Straightening', price: 3500, employeeName: 'Rahul Verma' }
    ],
    products: [
      { id: 'prd-5', name: 'Keratin Color Protect Restoring Mask (250ml)', price: 1100, quantity: 1 }
    ],
    packageApplied: null,
    subtotal: 4600,
    membershipDiscount: 0,
    totalAmount: 4600,
    paymentMethod: 'Cash',
    upiRef: '',
    status: 'Paid'
  }
];

export const INITIAL_ATTENDANCE_LOGS = [
  { id: 'att-1', date: '2026-10-17', employeeId: 'emp-1', employeeName: 'Vikram Singh', status: 'Present' },
  { id: 'att-2', date: '2026-10-17', employeeId: 'emp-2', employeeName: 'Ananya Sharma', status: 'Present' },
  { id: 'att-3', date: '2026-10-17', employeeId: 'emp-3', employeeName: 'Rahul Verma', status: 'Absent' },
  { id: 'att-4', date: '2026-10-17', employeeId: 'emp-4', employeeName: 'Karan Mehra', status: 'Present' },
  { id: 'att-5', date: '2026-10-17', employeeId: 'emp-5', employeeName: 'Pooja Hegde', status: 'Present' },
  { id: 'att-6', date: '2026-10-16', employeeId: 'emp-1', employeeName: 'Vikram Singh', status: 'Present' },
  { id: 'att-7', date: '2026-10-16', employeeId: 'emp-2', employeeName: 'Ananya Sharma', status: 'Present' },
  { id: 'att-8', date: '2026-10-16', employeeId: 'emp-3', employeeName: 'Rahul Verma', status: 'Present' },
  { id: 'att-9', date: '2026-10-16', employeeId: 'emp-4', employeeName: 'Karan Mehra', status: 'Present' },
  { id: 'att-10', date: '2026-10-16', employeeId: 'emp-5', employeeName: 'Pooja Hegde', status: 'Present' }
];
