import logo from "../../assets/logo.png";

export default function Navbar() {
    return (
        <nav className="bg-black h-20 flex items-center">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <a href="#" className="flex items-center py-0">
                    <img src={logo} alt="DStream Logo" className="h-10" />
                </a>
                <button
                    className="lg:hidden text-white focus:outline-none"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M4 5h16M4 12h16M4 19h16" />
                    </svg>
                </button>
                <div className="hidden lg:flex space-x-6 items-center" id="navbarNav">
                    <a href="#" className="text-white font-medium hover:text-gray-300">
                        Home
                    </a>
                    <a href="#" className="text-white font-medium hover:text-gray-300">
                        Features
                    </a>
                    <a href="#" className="text-white font-medium hover:text-gray-300">
                        Pricing
                    </a>
                    <a href="#" className="text-white font-medium hover:text-gray-300">
                        About
                    </a>
                </div>
            </div>
        </nav>
    );
}
