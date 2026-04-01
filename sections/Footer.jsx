import React from "react";

export default function Footer() {
  return (
    <footer id="contact" className="w-full bg-[#2b2622] text-[#f7f6f1] py-20 px-6 section-layer">
      <div className="ritual-container">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Logo & Tagline */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4 text-[#f7f6f1]">Rakarituals</h3>
            <p className="text-[#f7f6f1]/50 text-sm leading-relaxed max-w-xs">
              Handcrafted spiritual tools designed to ground your energy and elevate your artisanal rituals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b89b5e] mb-8">Navigate</h4>
            <ul className="space-y-4">
              {["Home", "Products", "About", "Contact"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[#f7f6f1]/60 text-sm hover:text-[#b89b5e] transition-all duration-300 font-medium">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b89b5e] mb-8">Support</h4>
            <ul className="space-y-4">
              {["FAQ", "Shipping", "Returns", "Privacy Policy"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[#f7f6f1]/60 text-sm hover:text-[#b89b5e] transition-all duration-300 font-medium">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b89b5e] mb-8">Follow Us</h4>
            <div className="flex gap-4">
              {["Instagram", "Facebook", "Twitter", "YouTube"].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-[#f7f6f1]/5 flex items-center justify-center hover:bg-[#b89b5e] hover:text-[#2b2622] transition-all duration-300 group"
                  aria-label={social}
                >
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#b89b5e] text-[#2b2622] px-2 py-1 rounded">{social}</span>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-[#f7f6f1]/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#f7f6f1]/40 text-xs uppercase tracking-[0.2em] font-medium">
            &copy; 2026 Rakarituals. All rights reserved.
          </p>
          <p className="text-[#f7f6f1]/40 text-xs font-medium italic">
            Designed with intention.
          </p>
        </div>

      </div>
    </footer>
  );
}
