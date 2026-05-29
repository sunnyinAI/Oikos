export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100/80 dark:border-gray-700/60 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
