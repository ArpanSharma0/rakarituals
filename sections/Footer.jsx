const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/rakaarituals",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    )
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/14e2CN1igxW/",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    )
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@rakaarituals",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    )
  },
  {
    name: "Pinterest",
    url: "https://pin.it/5E9GREiZ7",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 0 0-3.3 19.4c-.1-.9-.2-2.4 0-3.4.2-1 1.4-6 1.4-6s-.4-.7-.4-1.8c0-1.7 1-2.9 2.2-2.9 1 0 1.5.8 1.5 1.7 0 1-.6 2.6-1 4-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.8-2.2 3.8-5.5 0-2.9-2-4.9-5-4.9-3.4 0-5.4 2.6-5.4 5.2 0 1 .4 2.1.9 2.7.1.1.1.2.1.3l-.3 1.4c-.1.2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.6 0-3.8 2.8-7.3 7.9-7.3 4.2 0 7.4 3 7.4 6.9 0 4.1-2.6 7.5-6.2 7.5-1.2 0-2.4-.6-2.8-1.4l-.7 2.8c-.3 1-1 2.4-1.5 3.1A10 10 0 1 0 12 2z" />
      </svg>
    )
  }
];

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
              {["Shipping", "Returns", "Privacy Policy"].map((link) => (
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
              {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-10 h-10 rounded-full bg-[#f7f6f1]/5 flex items-center justify-center text-[#f7f6f1]/60 hover:bg-[#b89b5e] hover:text-[#2b2622] transition-all duration-300 group"
                  aria-label={social.name}
                >
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#b89b5e] text-[#2b2622] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">{social.name}</span>
                  {social.icon}
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
