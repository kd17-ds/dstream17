import mobile from "../assets/mobile.png";
import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <div className="relative w-full h-screen">
            {/* Background Layer */}
            <div className="absolute inset-0 bg-[url('/media/background.png')] bg-cover bg-center -z-10" />
            {/* Foreground Content */}
            <div className="pt-20 px-6 flex items-center justify-around text-white h-full">
                {/* Text Block */}
                <div>
                    <h1 className="text-5xl font-bold leading-snug">
                        <span className="text-amber-500">Connect Instantly.</span>
                        <br />
                        Share Freely. <br /> Collaborate Anywhere.
                    </h1>
                    <p className="mt-5 text-xl">Talk. Share. Get Things Done — Together</p>
                    <Link to={"/login"}><button className="mt-6 px-6 py-2 font-bold border-2 border-amber-500 text-amber-500 rounded hover:cursor-pointer hover:bg-amber-500 hover:text-white transition">
                        Get Started
                    </button>
                    </Link>
                </div>
                {/* Image Block */}
                <div>
                    <img src={mobile} alt="Mobile App" className="h-[75vh] max-h-[90vh]" />
                </div>
            </div>
        </div>
    );
}
