import { Link } from 'react-router-dom';

const Header = () => (
  <header className="bg-white shadow-sm fixed w-full z-50">
   
    <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src="https://img.icons8.com/fluency/96/000000/children.png"
          alt="Little Steps Logo"
          className="h-10 w-auto"
        />
        <span className="text-2xl font-extrabold bg-gradient-to-r from-[#6339C0] to-[#9F66FF] bg-clip-text text-transparent tracking-tight">
          Little Steps
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/" className="text-gray-700 hover:text-[#6339C0] font-medium px-3 py-2 rounded transition">Home</Link>
        <Link to="/login" className="bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all font-medium">
          Login
        </Link>
        <Link to="/signup" className="border-2 border-[#6339C0] text-[#6339C0] px-5 py-2.5 rounded-lg hover:bg-[#f6f3ff] transition-all font-medium">
          Sign Up
        </Link>
      </div>
    </nav>
  </header>
);

export default Header;