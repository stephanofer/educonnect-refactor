import { Link } from "react-router";
import { Instagram, Linkedin } from "lucide-react";

const footerLinks = {
  company: [
    { href: "/sobre-nosotros", label: "Sobre nosotros" },
    { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
    { href: "/para-tutores", label: "Para tutores" },
  ],
  legal: [
    { href: "/terminos", label: "Terminos y condiciones" },
    { href: "/privacidad", label: "Politica de privacidad" },
  ],
  support: [
    { href: "/ayuda", label: "Centro de ayuda" },
    { href: "/contacto", label: "Contacto" },
  ],
};

const socialLinks = [
  { href: "https://instagram.com/educonnect", icon: Instagram, label: "Instagram" },
  { href: "https://linkedin.com/company/educonnect", icon: Linkedin, label: "LinkedIn" },
];

// TikTok icon component since lucide doesn't have it
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Edu<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Conectamos estudiantes universitarios con tutores verificados para
              asesorias academicas personalizadas online. Aprende a tu ritmo,
              cuando lo necesites.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
              <a
                href="https://tiktok.com/@educonnect"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Metodos de pago:
              </span>
              <div className="flex items-center gap-3">
                {/* Yape */}
                <div className="px-3 py-1 bg-[#6B2D8B] text-white text-xs font-semibold rounded">
                  Yape
                </div>
                {/* Plin */}
                <div className="px-3 py-1 bg-[#00D4AA] text-white text-xs font-semibold rounded">
                  Plin
                </div>
                {/* Visa */}
                <div className="px-3 py-1 bg-[#1A1F71] text-white text-xs font-semibold rounded">
                  VISA
                </div>
                {/* Mastercard */}
                <div className="px-3 py-1 bg-[#EB001B] text-white text-xs font-semibold rounded">
                  MC
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} EduConnect - Hecho en Peru
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
