import React from 'react';
import { 
  PieChart,
  Tablet,
  Smartphone,
  Award,
  ChevronRight,
  Play,
  Check,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

const Home: React.FC = () => {
  const stats = [
    { value: "500+", label: "Daycares Trust Us" },
    { value: "95%", label: "Customer Satisfaction" },
    { value: "24/7", label: "Dedicated Support" },
    { value: "4.9/5", label: "Average Rating" }
  ];

  const featureCategories = [
    {
      name: "Administration",
      icon: <PieChart className="text-[#6339C0]" size={24} />,
      features: [
        "Centralized dashboard",
        "Staff management",
        "Financial reporting",
        "Compliance tracking"
      ]
    },
    {
      name: "Classroom Tools",
      icon: <Tablet className="text-[#6339C0]" size={24} />,
      features: [
        "Daily activity logging",
        "Lesson planning",
        "Developmental tracking",
        "Meal & nap records"
      ]
    },
    {
      name: "Parent Engagement",
      icon: <Smartphone className="text-[#6339C0]" size={24} />,
      features: [
        "Real-time updates",
        "Photo sharing",
        "Digital forms",
        "Payment portal"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-poppins antialiased overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium mb-6">
              <Award className="mr-2" size={18} />
              <span>Industry Leading Daycare Software</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#6339C0] to-[#9F66FF] bg-clip-text text-transparent">
                Elite Childcare
              </span><br />
              Management Platform
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              The most sophisticated solution for premium daycare centers. Streamline operations, enhance parent engagement, and elevate your childcare services.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg flex items-center group"
              >
                <span>Start Free Trial</span>
                <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition" />
              </Link>
              <Link 
                to="#demo" 
                className="border-2 border-[#6339C0] text-[#6339C0] px-8 py-4 rounded-xl hover:bg-[#f6f3ff] transition font-semibold text-lg flex items-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition-all duration-300">
              <img 
                src="https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80" 
                alt="Dashboard Preview" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#f9f6ff] to-[#f0e9ff]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-all">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#6339C0] to-[#9F66FF] bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Categories */}
      <section id="solutions" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium mb-4">
            COMPREHENSIVE SOLUTIONS
          </span>
          <h2 className="text-4xl font-bold mb-6">
            Everything Your <span className="text-[#6339C0]">Center Needs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From daily classroom operations to executive-level reporting, we've built tools for every role in your organization.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featureCategories.map((category, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
              <div className="w-14 h-14 flex items-center justify-center bg-[#f3eeff] rounded-xl mb-6">
                {category.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{category.name}</h3>
              <ul className="space-y-3">
                {category.features.map((feature, j) => (
                  <li key={j} className="flex items-center">
                    <Check className="w-5 h-5 text-[#6339C0] mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="#" className="mt-6 inline-flex items-center text-[#6339C0] font-medium group">
                Explore features
                <ChevronRight className="ml-1 w-5 h-5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 bg-gradient-to-br from-[#6339C0] to-[#9F66FF] text-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Heart className="w-12 h-12 mx-auto mb-6 text-white/30" />
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Daycare?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the elite childcare providers who trust LittleSteps for their daily operations and long-term success.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/signup" 
              className="bg-white text-[#6339C0] px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg flex items-center group"
            >
              <span>Start Free Trial</span>
              <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition" />
            </Link>
            <Link 
              to="#demo" 
              className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-[#6339C0] transition font-semibold text-lg flex items-center"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

   
    </div>
  );
};

export default Home;