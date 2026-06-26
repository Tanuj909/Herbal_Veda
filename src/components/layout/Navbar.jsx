// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { useCart } from "@/context/CartContext";

// export default function Navbar() {
//   const router = useRouter();
//   const { user, logout } = useAuth();
//   const { cartCount } = useCart();

//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

//   // Monitor scroll to update navbar background opacity
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 20) {
//         setIsScrolled(true);
//       } else {
//         setIsScrolled(false);
//       }
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const handleLogout = () => {
//     logout();
//     setIsProfileDropdownOpen(false);
//     router.push("/login");
//   };

//   return (
//     <nav
//       className="fixed top-0 left-0 right-0 z-50 font-label bg-background border-b border-outline-variant/10 shadow-sm py-4"
//     >
//       <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
//         {/* Left: Brand Logo */}
//         <Link href="/" className="flex items-center gap-2 text-primary group">
//           <span
//             className="material-symbols-outlined text-3xl transition-transform duration-300 group-hover:rotate-12"
//             style={{ fontVariationSettings: "'FILL' 1" }}
//           >
//             eco
//           </span>
//           <span className="font-headline text-xl font-bold tracking-tight text-on-surface">
//             The Herbal <span className="text-primary">Veda</span>
//           </span>
//         </Link>

//         {/* Center: Main Navigation (Desktop) */}
//         <div className="hidden md:flex items-center gap-8">
//           <Link
//             href="/"
//             className="text-sm font-semibold text-black hover:text-primary transition-colors"
//           >
//             Shop
//           </Link>
//           <Link
//             href="/categories"
//             className="text-sm font-semibold text-black hover:text-primary transition-colors"
//           >
//             Categories
//           </Link>
//           {user && (
//             <Link
//               href="/orders"
//               className="text-sm font-semibold text-black hover:text-primary transition-colors"
//             >
//               My Orders
//             </Link>
//           )}
//           {user && (
//             <Link
//               href="/addresses"
//               className="text-sm font-semibold text-black hover:text-primary transition-colors"
//             >
//               Addresses
//             </Link>
//           )}
//         </div>

//         {/* Right: Actions */}
//         <div className="flex items-center gap-4">
//           {/* Search Icon (Desktop) */}
//           <button className="hidden sm:flex text-on-surface-variant hover:text-primary p-2 transition-colors cursor-pointer">
//             <span className="material-symbols-outlined text-2xl">search</span>
//           </button>

//           {/* Wishlist */}
//           {user && (
//             <Link
//               href="/wishlist"
//               className="text-on-surface-variant hover:text-primary p-2 transition-colors relative flex items-center"
//               aria-label="Wishlist"
//             >
//               <span className="material-symbols-outlined text-2xl">favorite</span>
//               <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
//                 0
//               </span>
//             </Link>
//           )}

//           {/* Cart */}
//           {user && (
//             <Link
//               href="/cart"
//               className="text-on-surface-variant hover:text-primary p-2 transition-colors relative flex items-center"
//               aria-label="Shopping Cart"
//             >
//               <span className="material-symbols-outlined text-2xl">
//                 shopping_bag
//               </span>
//               {cartCount > 0 && (
//                 <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white animate-pulse">
//                   {cartCount}
//                 </span>
//               )}
//             </Link>
//           )}

//           {/* User Profile / Login */}
//           <div className="relative">
//             {user ? (
//               <>
//                 <button
//                   onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
//                   className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30"
//                   aria-label="User profile menu"
//                 >
//                   <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold uppercase">
//                     {user.name ? user.name.slice(0, 2) : "U"}
//                   </div>
//                 </button>

//                 {isProfileDropdownOpen && (
//                   <>
//                     {/* Backdrop to close dropdown */}
//                     <div
//                       className="fixed inset-0 z-30"
//                       onClick={() => setIsProfileDropdownOpen(false)}
//                     />
//                     <div className="absolute right-0 mt-3 w-48 rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2 shadow-lg z-40 animate-fadeIn">
//                       <div className="px-4 py-2 border-b border-outline-variant/20 mb-1">
//                         <p className="text-xs text-outline font-bold uppercase tracking-wider">
//                           Logged in as
//                         </p>
//                         <p className="text-sm font-bold text-on-surface truncate">
//                           {user.name || "User"}
//                         </p>
//                         <span className="inline-block mt-1 text-[10px] font-bold bg-primary-fixed text-on-primary-fixed-variant px-1.5 py-0.5 rounded-md">
//                           {user.role}
//                         </span>
//                       </div>
//                       {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
//                         <Link
//                           href="/admin/dashboard"
//                           className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
//                           onClick={() => setIsProfileDropdownOpen(false)}
//                         >
//                           <span className="material-symbols-outlined text-lg">
//                             dashboard
//                           </span>
//                           Admin Panel
//                         </Link>
//                       )}
//                       <button
//                         onClick={handleLogout}
//                         className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container/20 transition-colors text-left cursor-pointer font-bold"
//                       >
//                         <span className="material-symbols-outlined text-lg">
//                           logout
//                         </span>
//                         Sign Out
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </>
//             ) : (
//               <Link
//                 href="/login"
//                 className="flex items-center justify-center w-9 h-9 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-200"
//                 aria-label="Log in"
//               >
//                 <span className="material-symbols-outlined text-2.5xl">
//                   account_circle
//                 </span>
//               </Link>
//             )}
//           </div>

//           {/* Mobile Menu Icon (Hamburger) */}
//           <button
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             className="md:hidden text-on-surface hover:text-primary p-2 transition-colors cursor-pointer"
//             aria-label="Toggle Navigation Menu"
//           >
//             <span className="material-symbols-outlined text-2xl">
//               {isMobileMenuOpen ? "close" : "menu"}
//             </span>
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu Drawer */}
//       {isMobileMenuOpen && (
//         <div className="md:hidden fixed inset-x-0 top-[72px] bg-background border-b border-outline-variant/20 shadow-lg px-6 py-6 flex flex-col gap-4 animate-slideDown z-40">
//           <Link
//             href="/"
//             className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10"
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             Shop
//           </Link>
//           <Link
//             href="/categories"
//             className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10"
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             Categories
//           </Link>

//           {user && (
//             <>
//               <Link
//                 href="/wishlist"
//                 className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10 flex items-center gap-2"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 <span className="material-symbols-outlined text-lg">favorite</span>
//                 Wishlist
//               </Link>
//               <Link
//                 href="/cart"
//                 className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10 flex items-center justify-between"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 <div className="flex items-center gap-2">
//                   <span className="material-symbols-outlined text-lg">shopping_bag</span>
//                   Cart
//                 </div>
//                 {cartCount > 0 && (
//                   <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//                     {cartCount}
//                   </span>
//                 )}
//               </Link>
//               <Link
//                 href="/orders"
//                 className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10 flex items-center gap-2"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 <span className="material-symbols-outlined text-lg">receipt_long</span>
//                 My Orders
//               </Link>
//               <Link
//                 href="/addresses"
//                 className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10 flex items-center gap-2"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 <span className="material-symbols-outlined text-lg">location_on</span>
//                 Addresses
//               </Link>
//             </>
//           )}

//           <div className="flex gap-4 mt-2">
//             <button className="flex-1 py-3 px-4 bg-surface-container-low rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2">
//               <span className="material-symbols-outlined text-lg">search</span>
//               Search
//             </button>
//             {!user && (
//               <Link
//                 href="/login"
//                 className="flex-1 py-3 px-4 bg-primary text-on-primary rounded-xl text-center text-sm font-bold block"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Monitor scroll to update navbar background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    router.push("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 font-label bg-white border-b border-[#E8EDEA]/50 transition-all duration-300 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16 lg:h-[72px]">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
          <span
            className="material-symbols-outlined text-2xl sm:text-3xl transition-transform duration-300 group-hover:rotate-12 text-[#2C3E37]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          <span className="font-headline text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[#242926] whitespace-nowrap">
            The Herbal <span className="text-[#2C3E37]">Veda</span>
          </span>
        </Link>

        {/* Center: Main Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-[#242926] hover:text-[#2C3E37] transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-[#242926] hover:text-[#2C3E37] transition-colors"
          >
            Categories
          </Link>
          {user && (
            <>
              <Link
                href="/orders"
                className="text-sm font-medium text-[#242926] hover:text-[#2C3E37] transition-colors"
              >
                My Orders
              </Link>
              <Link
                href="/addresses"
                className="text-sm font-medium text-[#242926] hover:text-[#2C3E37] transition-colors"
              >
                Addresses
              </Link>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
          {/* Search Icon (Desktop only) */}
          <button className="hidden sm:flex text-[#6B7A75] hover:text-[#2C3E37] p-1.5 sm:p-2 transition-colors cursor-pointer rounded-lg hover:bg-[#F5F8F6]">
            <span className="material-symbols-outlined text-xl sm:text-2xl">search</span>
          </button>

          {/* Wishlist - Desktop only */}
          {user && (
            <Link
              href="/wishlist"
              className="hidden sm:flex text-[#6B7A75] hover:text-[#2C3E37] p-1.5 sm:p-2 transition-colors relative items-center rounded-lg hover:bg-[#F5F8F6]"
              aria-label="Wishlist"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">favorite</span>
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#2C3E37] text-[8px] sm:text-[10px] font-bold text-white">
                0
              </span>
            </Link>
          )}

          {/* Cart - Desktop only */}
          {user && (
            <Link
              href="/cart"
              className="hidden sm:flex text-[#6B7A75] hover:text-[#2C3E37] p-1.5 sm:p-2 transition-colors relative items-center rounded-lg hover:bg-[#F5F8F6]"
              aria-label="Shopping Cart"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">
                shopping_bag
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#2C3E37] text-[8px] sm:text-[10px] font-bold text-white animate-pulse">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile / Login */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-full hover:bg-[#F5F8F6] transition-colors cursor-pointer border border-transparent hover:border-[#E8EDEA]"
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F0F3F1] text-[#2C3E37] flex items-center justify-center text-xs sm:text-sm font-bold uppercase">
                    {user.name ? user.name.slice(0, 2) : "U"}
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 sm:w-56 rounded-xl bg-white border border-[#E8EDEA] py-2 shadow-lg z-40 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-[#F0F3F1] mb-1">
                        <p className="text-[10px] text-[#6B7A75] font-bold uppercase tracking-wider">
                          Logged in as
                        </p>
                        <p className="text-sm font-medium text-[#242926] truncate">
                          {user.name || "User"}
                        </p>
                        <span className="inline-block mt-1 text-[9px] sm:text-[10px] font-bold bg-[#F0F3F1] text-[#2C3E37] px-1.5 py-0.5 rounded-md">
                          {user.role}
                        </span>
                      </div>
                      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#242926] hover:bg-[#F5F8F6] transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <span className="material-symbols-outlined text-lg">
                            dashboard
                          </span>
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer font-medium"
                      >
                        <span className="material-symbols-outlined text-lg">
                          logout
                        </span>
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-[#6B7A75] hover:text-[#2C3E37] hover:bg-[#F5F8F6] transition-all duration-200"
                aria-label="Log in"
              >
                <span className="material-symbols-outlined text-2xl sm:text-2.5xl">
                  account_circle
                </span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Icon (Hamburger) - Always visible on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-[#242926] hover:text-[#2C3E37] p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-[#F5F8F6]"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer - Shows only on mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[56px] sm:top-[64px] lg:top-[72px] bg-white border-b border-[#E8EDEA] shadow-lg px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-3 sm:gap-4 animate-slideDown z-40 max-h-[calc(100vh-56px)] overflow-y-auto">
          <Link
            href="/"
            className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined text-lg text-[#6B7A75]">storefront</span>
            Shop
          </Link>
          <Link
            href="/categories"
            className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined text-lg text-[#6B7A75]">category</span>
            Categories
          </Link>

          {user && (
            <>
              <Link
                href="/wishlist"
                className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center justify-between"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#6B7A75]">favorite</span>
                  Wishlist
                </div>
                <span className="bg-[#F0F3F1] text-[#2C3E37] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  0
                </span>
              </Link>
              <Link
                href="/cart"
                className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center justify-between"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#6B7A75]">shopping_bag</span>
                  Cart
                </div>
                {cartCount > 0 && (
                  <span className="bg-[#2C3E37] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/orders"
                className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg text-[#6B7A75]">receipt_long</span>
                My Orders
              </Link>
              <Link
                href="/addresses"
                className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg text-[#6B7A75]">location_on</span>
                Addresses
              </Link>
            </>
          )}

          {!user && (
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-[#2C3E37] text-white font-medium text-sm rounded-lg text-center hover:bg-[#1E2D27] transition-colors shadow-sm mt-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}

          {user && (
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 px-4 bg-red-50 text-red-600 font-medium text-sm rounded-lg text-center hover:bg-red-100 transition-colors mt-2 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}