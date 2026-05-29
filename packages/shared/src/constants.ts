export const APP_NAME = 'Omni';
export const APP_TAGLINE = 'All your home, in one place';
export const APP_TAGLINE_HI = 'सब कुछ, एक जगह';

export const SESSION_TOKEN_KEY = 'omni_token';
export const STORE_PREFIX = 'omni';

export const GROCERY_CATEGORIES = [
  { id: 'sabzi', label: 'Sabzi', labelFull: 'Sabzi / Vegetables', icon: '🥬', colorClass: 'bg-green-100 text-green-800' },
  { id: 'dal_chawal', label: 'Dal-Chawal', labelFull: 'Dal, Chawal & Grains', icon: '🍚', colorClass: 'bg-amber-100 text-amber-800' },
  { id: 'masala', label: 'Masala', labelFull: 'Masala & Spices', icon: '🌶️', colorClass: 'bg-red-100 text-red-800' },
  { id: 'dairy', label: 'Dairy', labelFull: 'Dairy & Paneer', icon: '🥛', colorClass: 'bg-blue-100 text-blue-800' },
  { id: 'atta_maida', label: 'Atta-Maida', labelFull: 'Atta, Maida & Flour', icon: '🌾', colorClass: 'bg-yellow-100 text-yellow-800' },
  { id: 'oil_ghee', label: 'Tel-Ghee', labelFull: 'Tel, Ghee & Oil', icon: '🫙', colorClass: 'bg-orange-100 text-orange-800' },
  { id: 'fruits', label: 'Fruits', labelFull: 'Fruits & Dry Fruits', icon: '🍎', colorClass: 'bg-pink-100 text-pink-800' },
  { id: 'snacks', label: 'Snacks', labelFull: 'Namkeen & Snacks', icon: '🥜', colorClass: 'bg-amber-100 text-amber-900' },
  { id: 'beverages', label: 'Beverages', labelFull: 'Chai, Coffee & Drinks', icon: '🍵', colorClass: 'bg-teal-100 text-teal-800' },
  { id: 'pooja', label: 'Pooja', labelFull: 'Pooja Samagri', icon: '🪔', colorClass: 'bg-purple-100 text-purple-800' },
  { id: 'household', label: 'Household', labelFull: 'Ghar ka Saman', icon: '🧹', colorClass: 'bg-gray-100 text-gray-800' },
  { id: 'personal', label: 'Personal Care', labelFull: 'Personal Care', icon: '🪥', colorClass: 'bg-rose-100 text-rose-800' },
  { id: 'frozen', label: 'Frozen', labelFull: 'Frozen Foods', icon: '🧊', colorClass: 'bg-cyan-100 text-cyan-800' },
  { id: 'baby', label: 'Baby', labelFull: 'Baby & Kids', icon: '👶', colorClass: 'bg-yellow-100 text-yellow-800' },
  { id: 'other', label: 'Other', labelFull: 'Other Items', icon: '📦', colorClass: 'bg-gray-100 text-gray-700' },
] as const;

export const UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'gram', label: 'gram' },
  { value: 'litre', label: 'litre' },
  { value: 'ml', label: 'ml' },
  { value: 'piece', label: 'piece' },
  { value: 'dozen', label: 'dozen' },
  { value: 'packet', label: 'packet' },
  { value: 'bottle', label: 'bottle' },
  { value: 'box', label: 'box' },
  { value: 'can', label: 'can' },
  { value: 'pao', label: 'pao (250g)' },
  { value: 'bundle', label: 'bundle' },
] as const;

export const DIETARY_PREFS = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥦' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'jain', label: 'Jain', icon: '⚪' },
  { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'card', label: 'Card', icon: '💳' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
] as const;

export const EXPENSE_CATEGORIES = [
  { id: 'grocery', label: 'Grocery', icon: '🛒', color: 'green' },
  { id: 'utility', label: 'Utility', icon: '⚡', color: 'yellow' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: 'blue' },
  { id: 'food_dining', label: 'Food & Dining', icon: '🍽️', color: 'orange' },
  { id: 'health', label: 'Health', icon: '💊', color: 'red' },
  { id: 'education', label: 'Education', icon: '📚', color: 'purple' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'pink' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: 'cyan' },
  { id: 'rent', label: 'Rent/EMI', icon: '🏠', color: 'amber' },
  { id: 'other', label: 'Other', icon: '📦', color: 'gray' },
] as const;

export const POPULAR_SUBSCRIPTIONS = [
  { name: 'Netflix', amount: 649, billing_cycle: 'monthly', category: 'streaming' },
  { name: 'Disney+ Hotstar', amount: 299, billing_cycle: 'monthly', category: 'streaming' },
  { name: 'Amazon Prime', amount: 299, billing_cycle: 'monthly', category: 'streaming' },
  { name: 'Spotify Premium', amount: 119, billing_cycle: 'monthly', category: 'music' },
  { name: 'YouTube Premium', amount: 139, billing_cycle: 'monthly', category: 'streaming' },
  { name: 'JioCinema Premium', amount: 149, billing_cycle: 'monthly', category: 'streaming' },
  { name: 'SonyLIV', amount: 299, billing_cycle: 'monthly', category: 'streaming' },
] as const;

export const INDIAN_STATES = [
  { code: 'MH', name: 'Maharashtra' },
  { code: 'DL', name: 'Delhi' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'WB', name: 'West Bengal' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'TS', name: 'Telangana' },
  { code: 'PB', name: 'Punjab' },
  { code: 'HR', name: 'Haryana' },
  { code: 'KL', name: 'Kerala' },
] as const;
