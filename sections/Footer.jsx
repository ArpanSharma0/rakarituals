import React from "react";

export default function Footer() {
  return (
    <footer id="contact" className="w-full bg-black text-white py-16 px-6 md:px-20">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
          
          {/* Logo & Tagline */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4">Rakarituals</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Nurturing your spiritual journey with mindfully curated products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-6">Navigate</h4>
            <ul className="space-y-3.5">
              {["Home", "Products", "About", "Contact"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/50 text-sm hover:text-white transition-colors duration-300">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-6">Support</h4>
            <ul className="space-y-3.5">
              {["FAQ", "Shipping", "Returns", "Privacy Policy"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/50 text-sm hover:text-white transition-colors duration-300">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-6">Follow Us</h4>
            <ul className="space-y-3.5">
              {["Instagram", "Facebook", "Twitter", "YouTube"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/50 text-sm hover:text-white transition-colors duration-300">{link}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.08] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/25 text-xs uppercase tracking-wider">
            &copy; 2026 Rakarituals. All rights reserved.
          </p>
          <p className="text-white/25 text-xs">
            Designed with intention.
          </p>
        </div>

      </div>
    </footer>
  );
}
