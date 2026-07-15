import Link from "next/link";
import { PROJECT_NAME } from "@/lib/constants";

const footerLinks = {
  Discover: [
    { label: "All DApps", href: "/" },
    { label: "Trending", href: "/#trending" },
    { label: "Categories", href: "/#categories" },
    { label: "Airdrop", href: "/#airdrop" },
  ],
  Community: [
    { label: "Twitter / X", href: "#" },
    { label: "Discord", href: "#" },
    { label: "Telegram", href: "#" },
    { label: "GitHub", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07070c]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-white">{PROJECT_NAME}.fun</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your gateway to the decentralized web. Discover, track, and explore the best of Web3.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="font-semibold text-white">{title}</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} {PROJECT_NAME}.fun. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
