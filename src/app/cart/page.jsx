// "use client";

// import React from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import Navbar from "@/components/layout/Navbar";
// import Footer from "@/components/layout/Footer";
// import { useCart } from "@/context/CartContext";
// import { useAuth } from "@/context/AuthContext";

// export default function CartPage() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const { cart, updateQuantity, removeFromCart, cartSubtotal, isInitialized } = useCart();

//   const handleCheckoutRedirect = () => {
//     if (!user) {
//       router.push("/login?redirect=/checkout");
//     } else {
//       router.push("/checkout");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#FAF6F0]/30 text-on-surface flex flex-col font-body">
//       <Navbar />

//       <main className="flex-grow max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 w-full">
//         <h1 className="text-3xl font-headline font-bold text-[#242926] mb-8">
//           Your Shopping Cart
//         </h1>

//         {!isInitialized ? (
//           <div className="py-20 text-center flex flex-col items-center justify-center">
//             <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">
//               eco
//             </span>
//             <p className="text-sm text-on-surface-variant font-light">Loading your cart...</p>
//           </div>
//         ) : cart.length === 0 ? (
//           <div className="bg-white border border-outline-variant/30 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs flex flex-col items-center justify-center">
//             <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">
//               shopping_bag
//             </span>
//             <h2 className="text-xl font-headline font-bold text-[#242926] mb-2">
//               Your cart is empty
//             </h2>
//             <p className="text-xs sm:text-sm text-on-surface-variant font-light mb-8 leading-relaxed max-w-xs">
//               Explore nature's finest selection of organic oils, teas, and skin botanicals to fill your sanctuary.
//             </p>
//             <Link
//               href="/"
//               className="px-6 py-3 bg-primary text-[#242926] font-semibold text-xs rounded-full hover:bg-primary/95 transition-all shadow-xs"
//             >
//               Explore Products
//             </Link>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
//             {/* Cart Items List */}
//             <div className="lg:col-span-2 flex flex-col gap-6">
//               <div className="bg-white border border-outline-variant/20 rounded-2xl overflow-hidden shadow-xs">
//                 <div className="divide-y divide-outline-variant/10">
//                   {cart.map((item) => (
//                     <div
//                       key={item.product_id}
//                       className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-[#FAF6F0]/10"
//                     >
//                       <div className="flex items-center gap-4 flex-1">
//                         {/* Image */}
//                         <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/20 flex-shrink-0">
//                           <img
//                             src={item.thumbnailUrl || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200"}
//                             alt={item.name}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>

//                         {/* Name & price */}
//                         <div>
//                           <h3 className="font-semibold text-sm sm:text-base text-[#242926] mb-1">
//                             {item.name}
//                           </h3>
//                           <p className="text-xs text-on-surface-variant font-medium">
//                             ${item.price.toFixed(2)} each
//                           </p>
//                         </div>
//                       </div>

//                       {/* Quantity Selector & total */}
//                       <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
//                         {/* Quantity controls */}
//                         <div className="flex items-center border border-outline-variant/40 rounded-full px-2 py-1 bg-white">
//                           <button
//                             onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
//                             className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
//                           >
//                             <span className="material-symbols-outlined text-sm">remove</span>
//                           </button>
//                           <span className="w-10 text-center text-xs font-bold text-[#242926]">
//                             {item.quantity}
//                           </span>
//                           <button
//                             onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
//                             className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
//                           >
//                             <span className="material-symbols-outlined text-sm">add</span>
//                           </button>
//                         </div>

//                         {/* Line Total */}
//                         <div className="text-right min-w-[80px]">
//                           <p className="text-sm font-bold text-[#242926]">
//                             ${(item.price * item.quantity).toFixed(2)}
//                           </p>
//                           <button
//                             onClick={() => removeFromCart(item.product_id)}
//                             className="text-[10px] font-bold text-rose-600 hover:text-rose-700 transition-colors mt-1 inline-flex items-center gap-0.5"
//                           >
//                             <span className="material-symbols-outlined text-[12px]">delete</span>
//                             Remove
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Cart Summary Card */}
//             <div className="bg-white border border-outline-variant/20 p-6 rounded-2xl shadow-xs flex flex-col gap-6">
//               <h2 className="text-lg font-headline font-bold text-[#242926] pb-3 border-b border-outline-variant/10">
//                 Order Summary
//               </h2>

//               <div className="flex flex-col gap-3 text-sm">
//                 <div className="flex justify-between text-on-surface-variant">
//                   <span>Subtotal</span>
//                   <span className="font-semibold text-[#242926]">${cartSubtotal.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-on-surface-variant">
//                   <span>Shipping</span>
//                   <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
//                     Calculated at Checkout
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-on-surface-variant">
//                   <span>Estimated Tax</span>
//                   <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
//                     Calculated at Checkout
//                   </span>
//                 </div>
//               </div>

//               <div className="border-t border-outline-variant/10 pt-4 flex justify-between items-baseline">
//                 <span className="text-sm font-bold text-[#242926]">Subtotal to pay</span>
//                 <span className="text-xl font-bold text-primary-fixed-dim">${cartSubtotal.toFixed(2)}</span>
//               </div>

//               <button
//                 onClick={handleCheckoutRedirect}
//                 className="w-full py-4 bg-primary text-[#242926] font-bold text-xs rounded-full hover:bg-primary/95 transition-all shadow-md text-center hover:scale-[1.02] active:scale-95 cursor-pointer uppercase tracking-wider"
//               >
//                 Proceed to Checkout
//               </button>

//               <p className="text-[10px] text-on-surface-variant/70 text-center font-light leading-relaxed">
//                 By proceeding to checkout you agree to our Terms of Service. Shipping and taxes are calculated dynamically on the server.
//               </p>
//             </div>
//           </div>
//         )}
//       </main>

//       <Footer />
//     </div>
//   );
// }


"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, cartSubtotal, isInitialized } = useCart();

  const formatPrice = (amount) => {
    return `₹${amount?.toFixed(2) || "0.00"}`;
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0]/30 text-[#242926] flex flex-col font-['Inter',sans-serif]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 w-full">
        {/* Page Header */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#242926] mb-1 sm:mb-2">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7A75] font-light">
            Review and manage your selected items
          </p>
        </div>

        {!isInitialized ? (
          <div className="py-12 sm:py-20 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#D4DCD8] border-t-[#2C3E37] rounded-full animate-spin mb-3 sm:mb-4"></div>
            <p className="text-xs sm:text-sm text-[#6B7A75] font-light">Loading your cart...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white border border-[#E8EDEA] rounded-2xl p-8 sm:p-12 lg:p-16 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-[#F5F8F6] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#6B7A75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-light text-[#242926] mb-2 sm:mb-3">
              Your cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7A75] font-light mb-6 sm:mb-8 max-w-xs mx-auto leading-relaxed">
              Discover our curated collection of premium organic products.
            </p>
            <Link
              href="/"
              className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-[#2C3E37] text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-[#1E2D27] transition-colors shadow-sm"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-[#E8EDEA] rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-[#F0F3F1]">
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:bg-[#F8FAF9] transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F5F8F6] border border-[#E8EDEA] flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={item.thumbnailUrl || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <h3 className="font-medium text-[#242926] mb-0.5 sm:mb-1 text-sm sm:text-base truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#6B7A75]">
                          {formatPrice(item.price)} each
                        </p>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#DCE3DF] rounded-lg overflow-hidden flex-shrink-0">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#6B7A75] hover:bg-[#F5F8F6] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-medium text-[#242926]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#6B7A75] hover:bg-[#F5F8F6] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-semibold text-[#242926]">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-[10px] sm:text-xs text-[#6B7A75] hover:text-[#D45C5C] transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm lg:sticky lg:top-32">
                <h2 className="text-lg sm:text-xl font-medium text-[#242926] mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#E8EDEA]">
                  Order Summary
                </h2>

                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-[#6B7A75]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#242926]">{formatPrice(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7A75] items-center">
                    <span>Shipping</span>
                    <span className="text-[10px] sm:text-xs text-[#2C3E37] bg-[#F0F3F1] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      Calculated at checkout
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6B7A75] items-center">
                    <span>Estimated Tax</span>
                    <span className="text-[10px] sm:text-xs text-[#2C3E37] bg-[#F0F3F1] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#E8EDEA] mt-4 sm:mt-6 pt-4 sm:pt-6">
                  <div className="flex justify-between items-baseline mb-4 sm:mb-6">
                    <span className="text-sm font-medium text-[#6B7A75]">Total</span>
                    <span className="text-xl sm:text-2xl font-light text-[#242926]">{formatPrice(cartSubtotal)}</span>
                  </div>

                  <button
                    onClick={handleCheckoutRedirect}
                    className="w-full py-3 sm:py-3.5 bg-[#2C3E37] text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-[#1E2D27] transition-colors shadow-sm hover:shadow-md"
                  >
                    Proceed to Checkout
                  </button>

                  <p className="text-[10px] sm:text-xs text-[#6B7A75] text-center mt-3 sm:mt-4 leading-relaxed">
                    By proceeding, you agree to our Terms of Service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}