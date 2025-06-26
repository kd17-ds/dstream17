import { useState } from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const navItems = [
    { label: "Join as Guest", href: "#" },
    { label: "Register", href: "/signup" },
    { label: "Login", href: "/login" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const location = useLocation();
    const isHome = location.pathname === "/";

    return (
        <nav
            className={`${isHome ? "bg-black/10 backdrop-blur-sm" : "bg-white"
                } h-20 w-full absolute top-0 left-0 z-20 flex items-center`}
        >
            <div className="container mx-auto px-8 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center py-0">
                    <img src={logo} alt="DStream Logo" className="h-14" />
                </Link>

                {/* Mobile menu toggle button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`lg:hidden ${isHome ? "text-white" : "text-black"} focus:outline-none`}
                    aria-label="Toggle navigation"
                >
                    <svg
                        className="w-6 h-6"
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
                        <Link
                            key={item.label}
                            to={item.href}
                            className={`${isHome ? "text-white" : "text-black"} font-medium hover:text-amber-500`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile menu dropdown */}
            {isOpen && (
                <div className={`lg:hidden absolute top-20 left-0 w-full ${isHome ? "bg-black" : "bg-white"} px-4 py-4 z-10`}>
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`${isHome ? "text-white" : "text-black"} block font-medium py-2 hover:text-gray-500`}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            )}
        </nav>
    );
}
