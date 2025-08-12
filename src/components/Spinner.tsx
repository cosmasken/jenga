interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Spinner({ className = '', size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin ${className}`} />
  );
}
