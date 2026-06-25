"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#242926] text-[#eae6de] font-body pt-16 pb-12 border-t border-primary/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Minimal 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12 items-start justify-between">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-5 max-w-sm">
            <Link href="/" className="flex items-center gap-2 text-primary-fixed-dim">
              <span
                className="material-symbols-outlined text-3xl flex items-center justify-center"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                eco
              </span>
              <span className="font-headline text-2xl font-bold tracking-tight text-white">
                The Herbal Veda
              </span>
            </Link>
            <p className="text-sm text-[#c8c5bc] leading-relaxed font-light">
              Sourcing nature's finest botanicals with uncompromised integrity, bringing the pure essence of the earth directly to your sanctuary.
            </p>
          </div>

          {/* Column 2: Contact Details & Social Links */}
          <div className="md:justify-self-end flex flex-col gap-5">
            <h3 className="font-headline text-lg font-semibold text-white">
              Contact & Support
            </h3>
            
            {/* Contact details */}
            <ul className="flex flex-col gap-3 text-sm text-[#c8c5bc]">
              <li className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg text-primary flex items-center justify-center">
                  mail
                </span>
                <a href="mailto:support@theherbalveda.com" className="hover:text-white transition-colors">
                  support@theherbalveda.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg text-primary flex items-center justify-center">
                  call
                </span>
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </li>
            </ul>

            {/* Social Media Links cleanly placed below contact info */}
            <div className="flex gap-3 items-center mt-2">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors text-[#c8c5bc] hover:text-white"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors text-[#c8c5bc] hover:text-white"
                aria-label="Pinterest"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.396-5.914 1.396-5.914s-.356-.715-.356-1.777c0-1.664.962-2.906 2.167-2.906 1.023 0 1.517.768 1.517 1.686 0 1.028-.655 2.568-.992 3.992-.283 1.196.598 2.17 1.778 2.17 2.133 0 3.774-2.253 3.774-5.502 0-2.879-2.069-4.892-5.022-4.892-3.421 0-5.43 2.567-5.43 5.217 0 1.033.398 2.143.896 2.746.098.118.113.22.083.342-.09.377-.291 1.189-.33 1.349-.052.21-.173.255-.399.15-1.488-.695-2.418-2.875-2.418-4.631 0-3.772 2.742-7.237 7.904-7.237 4.15 0 7.373 2.957 7.373 6.908 0 4.124-2.6 7.443-6.208 7.443-1.213 0-2.353-.631-2.744-1.376 0 0-.6 2.285-.745 2.846-.27 1.036-.999 2.336-1.489 3.136 1.122.347 2.312.535 3.548.535 6.62 0 11.988-5.367 11.988-11.987C23.992 5.368 18.625 0 12.017 0z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors text-[#c8c5bc] hover:text-white"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Sub-bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#c8c5bc]/50">
          <p>© {new Date().getFullYear()} The Herbal Veda. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#eae6de] transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-[#eae6de] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
