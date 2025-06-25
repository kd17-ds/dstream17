import whatsappIcon from "../../assets/whatsapp-icon.png";
import instaIcon from "../../assets/insta-icon.png";
import linkedinIcon from "../../assets/linkedin-icon.png";
import xIcon from "../../assets/x-icon.png";
import gmailIcon from "../../assets/gmail-icon.png";

// Easily updatable icon + link config
const socialLinks = [
    {
        href: "https://wa.me/916367248171",
        imgSrc: whatsappIcon,
        alt: "Whatsapp",
    },
    {
        href: "https://www.instagram.com/kd17_02/",
        imgSrc: instaIcon,
        alt: "Instagram",
    },
    {
        href: "https://www.linkedin.com/in/divyansh-sharma-1a7a24276/",
        imgSrc: linkedinIcon,
        alt: "LinkedIn",
    },
    {
        href: "https://twitter.com/I_am_DS_17",
        imgSrc: xIcon,
        alt: "Twitter (X)",
    },
    {
        href: "mailto:shan17div@gmail.com",
        imgSrc: gmailIcon,
        alt: "Email",
    },
];

export default function Footer() {
    return (
        <footer className="bg-black text-white py-8 px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
                {/* Left - Name */}
                <div className="text-center md:text-left mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold">D.S</h1>
                    <p className="text-sm text-gray-400">
                        Divyansh Sharma © All rights reserved.
                    </p>
                </div>

                {/* Right - Dynamic Social Icons */}
                <div className="flex space-x-4 justify-center">
                    {socialLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={link.imgSrc}
                                alt={link.alt}
                                className="h-6 w-6 hover:scale-110 transition"
                            />
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
