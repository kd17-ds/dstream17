import { useState } from "react";
import logo from "../../assets/logo.png";

const navItems = [
    { label: "Join as Guest", href: "#" },
    { label: "Register", href: "#" },
    { label: "Login", href: "#" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-black/10 h-20 w-full absolute top-0 left-0 z-20 backdrop-blur-sm flex items-center">
            <div className="container mx-auto px-8 flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center py-0">
                    <img src={logo} alt="DStream Logo" className="h-14" />
                </a>

                {/* Mobile menu toggle button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden text-white focus:outline-none"
                    aria-label="Toggle navigation"
                >
                    <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                {/* Desktop navigation */}
                <div className="hidden lg:flex space-x-6 items-center px-6">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="text-white font-medium hover:text-amber-500"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Mobile menu dropdown */}
            {isOpen && (
                <div className="lg:hidden absolute top-20 left-0 w-full bg-black px-4 py-4 z-10">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="block text-white font-medium py-2 hover:text-gray-300"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            )}
        </nav>
    );
}
