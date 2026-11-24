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
      setTimeout(() => setBumping(false), 650);
    };
    window.addEventListener('cart-bump', handleBump);
    return () => window.removeEventListener('cart-bump', handleBump);
  }, []);

  if (cart.length === 0) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        id="floating-cart-button"
        onClick={onOpenInvoice}
        className={`liquid-btn-primary relative h-14 px-4 sm:px-5 rounded-full flex items-center gap-2.5 cursor-pointer transition-transform duration-200 ${
          bumping ? 'scale-110 ring-4 ring-sky-300/60' : ''
        }`}
        title="فتح سلة المشتريات والفاتورة"
        aria-label="سلة المشتريات"
      >
        <ShoppingCart
          className={`w-5 h-5 text-white transition-transform ${bumping ? 'rotate-6 scale-110' : ''}`}
        />
        <span className="text-xs font-extrabold hidden sm:inline whitespace-nowrap">الفاتورة</span>
        <span className="min-w-6 h-6 px-1.5 rounded-full bg-white text-[#0071e3] text-xs font-black font-mono tabular-nums flex items-center justify-center shadow-sm">
          {totalItems}
        </span>
      </button>
    </div>
  );
}
