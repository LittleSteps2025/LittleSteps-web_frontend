import React from "react";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">LittleSteps</h1>
          <nav className="space-x-6">
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#contact" className="hover:text-blue-600">Contact</a>
            <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Login</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-br from-blue-100 to-white">
        <h2 className="text-4xl font-bold mb-4">Smart Daycare, Simplified.</h2>
        <p className="text-lg max-w-xl mx-auto mb-6">
          LittleSteps helps parents, caregivers, and daycare admins stay connected, organized, and informed.
        </p>
        <a href="/register" className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 transition">
          Get Started
        </a>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-semibold text-center mb-12">Why LittleSteps?</h3>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
            <h4 className="text-xl font-bold mb-2">Parent Updates</h4>
            <p>Get daily reports, announcements, and real-time alerts about your child.</p>
          </div>
          <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
            <h4 className="text-xl font-bold mb-2">Teacher Tools</h4>
            <p>Track attendance, log meals and naps, and manage schedules easily.</p>
          </div>
          <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
            <h4 className="text-xl font-bold mb-2">Admin Control</h4>
            <p>Manage users, monitor reports, and keep everything running smoothly.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white border-t text-center py-6 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} LittleSteps. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
