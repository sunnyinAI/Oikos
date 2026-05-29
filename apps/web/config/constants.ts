export const APP_NAME = 'Omni';
export const APP_TAGLINE = 'All your home, in one place';

export const GROCERY_CATEGORIES = [
  { id: 'sabzi', label: 'Sabzi', labelFull: 'Sabzi / Vegetables', icon: '🥬', color: 'green', colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { id: 'dal_chawal', label: 'Dal-Chawal', labelFull: 'Dal, Chawal & Grains', icon: '🍚', color: 'amber', colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'masala', label: 'Masala', labelFull: 'Masala & Spices', icon: '🌶️', color: 'red', colorClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { id: 'dairy', label: 'Dairy', labelFull: 'Dairy & Paneer', icon: '🥛', color: 'blue', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'atta_maida', label: 'Atta-Maida', labelFull: 'Atta, Maida & Flour', icon: '🌾', color: 'yellow', colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { id: 'oil_ghee', label: 'Tel-Ghee', labelFull: 'Tel, Ghee & Oil', icon: '🫙', color: 'orange', colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  { id: 'fruits', label: 'Fruits', labelFull: 'Fruits & Dry Fruits', icon: '🍎', color: 'pink', colorClass: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' },
  { id: 'snacks', label: 'Snacks', labelFull: 'Namkeen & Snacks', icon: '🥜', color: 'brown', colorClass: 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200' },
  { id: 'beverages', label: 'Beverages', labelFull: 'Chai, Coffee & Drinks', icon: '🍵', color: 'teal', colorClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
  { id: 'pooja', label: 'Pooja', labelFull: 'Pooja Samagri', icon: '🪔', color: 'purple', colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  { id: 'household', label: 'Household', labelFull: 'Ghar ka Saman', icon: '🧹', color: 'gray', colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  { id: 'personal', label: 'Personal Care', labelFull: 'Personal Care', icon: '🪥', color: 'pink', colorClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
  { id: 'frozen', label: 'Frozen', labelFull: 'Frozen Foods', icon: '🧊', color: 'cyan', colorClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { id: 'baby', label: 'Baby', labelFull: 'Baby & Kids', icon: '👶', color: 'yellow', colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { id: 'other', label: 'Other', labelFull: 'Other Items', icon: '📦', color: 'gray', colorClass: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
];

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
];

export const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'card', label: 'Card', icon: '💳' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
];

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
];

export const POPULAR_SUBSCRIPTIONS = [
  { name: 'Netflix', amount: 649, billing_cycle: 'monthly', category: 'streaming' },
  { name: 'Disney+ Hotstar', amount: 299, billing_cycle: 'monthly', category: 'streaming' },
  { name: 'Amazon Prime', amount: 299, billing_cycle: 'monthly', category: 'streaming' },
  { name: 'Spotify Premium', amount: 119, billing_cycle: 'monthly', category: 'music' },
  { name: 'YouTube Premium', amount: 139, billing_cycle: 'monthly', category: 'streaming' },
  { name: 'SonyLIV', amount: 299, billing_cycle: 'monthly', category: 'streaming' },
  { name: 'ZEE5', amount: 199, billing_cycle: 'monthly', category: 'streaming' },
];

export const DIETARY_PREFS = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥦' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'jain', label: 'Jain', icon: '⚪' },
  { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
];
