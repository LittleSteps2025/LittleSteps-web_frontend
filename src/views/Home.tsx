import React from 'react';
import { 
  PieChart,
  Smartphone,
  Award,
  ChevronRight,
  Users,
  BookOpen,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

const Home: React.FC = () => {
  const stats = [
    { value: "500+", label: "Happy Children" },
    { value: "95%", label: "Parent Satisfaction" },
    { value: "24/7", label: "Educator Support" },
    { value: "4.9/5", label: "Average Rating" }
  ];

  const features = [
    {
      icon: <PieChart className="text-[#6339C0]" size={24} />,
      title: "Smart Administration",
      description: "Streamline your center's operations with intuitive management tools"
    },
  
    {
      icon: <Users className="text-[#6339C0]" size={24} />,
      title: "Staff Management",
      description: "Simplify scheduling and communication with your team"
    },
    {
      icon: <BookOpen className="text-[#6339C0]" size={24} />,
      title: "Curriculum Planning",
      description: "Access our library of age-appropriate activities"
    },
    {
      icon: <ShieldCheck className="text-[#6339C0]" size={24} />,
      title: "Safety & Compliance",
      description: "Stay compliant with all regulations and ensure child safety"
    },
    {
      icon: <Smartphone className="text-[#6339C0]" size={24} />,
      title: "Parent Engagement",
      description: "Keep families connected with real-time updates"
    }
  ];

  const testimonials = [
    {
      quote: "This platform has transformed how we manage our daycare. The parents love the daily updates!",
      author: "Sarah Johnson",
      role: "Director, Little Stars Daycare"
    },
    {
      quote: "The child development tracking helps us provide personalized care for each child.",
      author: "Michael Chen",
      role: "Lead Educator, Sunshine Preschool"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-poppins antialiased overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-6 max-w-7xl mx-auto w-full">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium mb-6">
              <Award className="mr-2" size={18} />
              <span>Trusted by Leading Daycares</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#6339C0] to-[#9F66FF] bg-clip-text text-transparent">
                Exceptional Childcare
              </span><br />
              Starts Here
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
              Our comprehensive platform helps daycare centers provide nurturing environments while simplifying administration and enhancing parent engagement.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Link 
                to="/features" 
                className="bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Explore Features
              </Link>
              <Link 
                to="/contact" 
                className="border-2 border-[#6339C0] text-[#6339C0] px-8 py-3 rounded-lg hover:bg-[#f6f3ff] transition font-semibold"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80" 
                alt="Daycare management dashboard" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#f9f6ff] to-[#f0e9ff]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-all">
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#6339C0] to-[#9F66FF] bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium mb-4">
            COMPREHENSIVE SOLUTIONS
          </span>
          <h2 className="text-3xl font-bold mb-6">
            Designed for <span className="text-[#6339C0]">Childcare Excellence</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Every tool you need to provide exceptional care while running an efficient center.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
              <div className="w-14 h-14 flex items-center justify-center bg-[#f3eeff] rounded-xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <Link to="#" className="inline-flex items-center text-[#6339C0] font-medium group">
                Learn more
                <ChevronRight className="ml-1 w-5 h-5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium mb-4">
              TRUSTED BY EDUCATORS
            </span>
            <h2 className="text-3xl font-bold mb-6">
              What Our <span className="text-[#6339C0]">Community Says</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-gradient-to-br from-[#f9f6ff] to-[#f0e9ff] p-8 rounded-xl">
                <div className="mb-6 text-[#9F66FF]">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-lg italic mb-6">"{testimonial.quote}"</p>
                <div className="font-bold text-[#6339C0]">{testimonial.author}</div>
                <div className="text-gray-600 text-sm">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#6339C0] to-[#9F66FF] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Heart className="w-12 h-12 mx-auto mb-6 text-white/30" />
          <h2 className="text-3xl font-bold mb-6">Ready to Elevate Your Childcare Center?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover how our platform can help you focus on what matters most - nurturing young minds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/contact" 
              className="bg-white text-[#6339C0] px-8 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Get Started
            </Link>
            <Link 
              to="/features" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition font-semibold"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;