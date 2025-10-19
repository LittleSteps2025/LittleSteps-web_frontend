import { Link } from "react-router-dom";
import { Heart, MapPin, Phone, Mail } from "lucide-react";
import logo from "../../../assets/sixth-logo.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* About Column */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <img src={logo} alt="Little Steps Logo" className="h-20 w-auto" />
          </div>
          <p className="mb-6">
            Nurturing young minds from ages 3 to 16 with quality care and
            education in a safe, stimulating environment.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Heart className="w-4 h-4 text-[#9F66FF]" />
            <span>Licensed and Accredited Childcare Center</span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div></div>

        {/* Contact Column */}
        <div>
          <h3 className="font-bold text-lg mb-6 text-white">Contact Us</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#9F66FF] mt-0.5 flex-shrink-0" />
              <span>UCSC Building Complex, 35 Reid Ave, Colombo 00700</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#9F66FF]" />
              <span>+94 766 135110</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#9F66FF]" />
              <span>littlesteps@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Little Steps Learning Center. All
            rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm hover:text-white transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm hover:text-white transition">
              Terms
            </Link>
            <Link to="/safety" className="text-sm hover:text-white transition">
              Safety Protocols
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
