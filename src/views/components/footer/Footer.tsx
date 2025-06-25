import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src="/logo-white.png" 
              alt="Little Steps Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-[#9F66FF] to-[#6339C0] bg-clip-text text-transparent">
              LittleSteps
            </span>
          </div>
          <p className="mb-6">
            Premium daycare management software designed for excellence in early childhood education.
          </p>
          <div className="flex gap-4">
            {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
              <a key={social} href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d={`M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z`} clipRule="evenodd" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-6 text-white">Product</h3>
          <ul className="space-y-3">
            {['Features', 'Pricing', 'Integrations', 'Roadmap'].map((item) => (
              <li key={item}>
                <Link to={`#${item.toLowerCase()}`} className="hover:text-white transition">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-6 text-white">Resources</h3>
          <ul className="space-y-3">
            {['Blog', 'Help Center', 'Webinars', 'Community'].map((item) => (
              <li key={item}>
                <Link to="#" className="hover:text-white transition">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-6 text-white">Company</h3>
          <ul className="space-y-3">
            {['About Us', 'Careers', 'Contact', 'Legal'].map((item) => (
              <li key={item}>
                <Link to="#" className="hover:text-white transition">{item}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Little Steps. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="text-sm hover:text-white transition">Terms of Service</Link>
            <Link to="/cookies" className="text-sm hover:text-white transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;