import { Link } from 'react-router-dom';
import logo from '../../../assets/fifth-logo.png';

const Header = () => (
  <header className="bg-white shadow-sm fixed w-full z-50">
    <nav className="max-w-7xl mx-auto px-2 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
         <img 
              src={logo} // Replace with your logo path 
              alt="Little Steps Logo" 
              className="h-15 w-auto"
            />
       
      </div>
      <div className="flex items-center gap-4">
        <Link to="/login" className="bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all font-medium">
          Login
        </Link>
        
      </div>
    </nav>
  </header>
);

export default Header;