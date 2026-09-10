import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';

interface FloatingCartBarProps {
  cart: CartItem[];
  onOpenInvoice: () => void;
}

export default function FloatingCartBar({ cart, onOpenInvoice }: FloatingCartBarProps) {
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    const handleBump = () => {
      setBumping(true);
      setTimeout(() => setBumping(false), 700);
    };
    window.addEventListener('cart-bump', handleBump);
    return () => window.removeEventListener('cart-bump', handleBump);
  }, []);

  if (cart.length === 0) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in zoom-in-75 duration-300">
      <button
        id="floating-cart-button"
        onClick={onOpenInvoice}
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-2xl shadow-emerald-950/40 flex items-center justify-center border-2 border-white/30 active:scale-95 transition-all group cursor-pointer duration-200 ${
          bumping ? 'scale-125 ring-4 ring-amber-400 ring-offset-2' : ''
        }`}
        title="فتح سلة المشتريات والفاتورة"
        aria-label="سلة المشتريات"
      >
        {/* Pulsing subtle glow */}
        <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-30 animate-ping pointer-events-none" />

        {/* Shopping Cart Icon */}
        <ShoppingCart className={`w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform ${bumping ? 'rotate-12 scale-125' : 'group-hover:scale-110'}`} />

        {/* Item count badge in corner */}
        <span className={`absolute -top-1 -right-1 bg-red-600 text-white text-xs font-black font-mono w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform ${bumping ? 'scale-125' : ''}`}>
          {totalItems}
        </span>
      </button>
    </div>
  );
}
