import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', size = 'md', className = '', loading, disabled, onClick, type = 'button', ...props }) {
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-soft',
    secondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400',
    success: 'bg-kgreen-500 hover:bg-kgreen-600 text-white shadow-sm',
  };
  const sizes = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-5 text-sm',
    lg: 'py-4 px-6 text-base',
    icon: 'p-2.5',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
}
