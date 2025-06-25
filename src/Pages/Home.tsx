import React from 'react';
import { 
  Apple, Shield, BarChart2, Calendar, MessageSquare, CreditCard, Users, 
  Clock, BookOpen, Bell, Play, ChevronRight, Check, Star, Award, 
  Zap, Heart, Lock, PieChart, Tablet, Smartphone, LifeBuoy, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SecondaryLogo from '../assets/secondary-logo.png';
import PrimaryLogo from '../assets/primary-logo.png';


const Home: React.FC = () => {
  // Stats data
  const stats = [
    { value: "500+", label: "Daycares Trust Us" },
    { value: "95%", label: "Customer Satisfaction" },
    { value: "24/7", label: "Dedicated Support" },
    { value: "4.9/5", label: "Average Rating" }
  ];

  // Feature categories
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
      {/* Premium Navigation */}
     

      {/* Ultra Premium Hero Section */}
      <section className="relative pt-10 pb-32 px-6 max-w-7xl mx-auto w-full">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#6339C0] rounded-full opacity-5 blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#9F66FF] rounded-full opacity-5 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-[#6339C0] rounded-full opacity-10 blur-xl"></div>
        </div>
        
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
              <a 
                href="/register" 
                className="bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg flex items-center group"
              >
                <span>Start Free Trial</span>
                <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition" />
              </a>
              <a 
                href="#demo" 
                className="border-2 border-[#6339C0] text-[#6339C0] px-8 py-4 rounded-xl hover:bg-[#f6f3ff] transition font-semibold text-lg flex items-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </a>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map((i) => (
                  <img 
                    key={i}
                    src={`https://randomuser.me/api/portraits/${i%2===0?'women':'men'}/${i+30}.jpg`}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white shadow"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center mb-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">Rated 5.0 by 300+ daycare professionals</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-64 h-64 bg-[#6339C0] rounded-3xl opacity-10 blur-3xl"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition-all duration-300">
              <img 
                src="https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80" 
                alt="Dashboard Preview" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-8 flex flex-col justify-end">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow">
                  <h3 className="font-bold text-xl mb-1 text-gray-900">Executive Dashboard</h3>
                  <p className="text-sm text-gray-600">Real-time insights across all centers</p>
                  <div className="flex justify-between mt-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Zap className="w-4 h-4 text-[#6339C0] mr-1" />
                      <span>Live Data</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 text-[#6339C0] mr-1" />
                      <span>Multi-Center</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Marquee */}
      <section className="py-8 bg-gray-50 border-y border-gray-200 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
          
          <div className="flex items-center justify-center gap-16 animate-marquee whitespace-nowrap">
            {[
              'Bright Horizons', 'KinderCare', 'Primrose Schools', 
              'The Goddard School', 'Learning Care Group', 'Childcare Network',
              'Kids R','Kids', 'La Petite Academy'
            ].map((name, i) => (
              <div key={i} className="flex items-center text-gray-500 font-medium text-lg">
                {name}
              </div>
            ))}
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

      {/* Premium Feature Categories */}
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
              <a href="#" className="mt-6 inline-flex items-center text-[#6339C0] font-medium group">
                Explore features
                <ChevronRight className="ml-1 w-5 h-5 transform group-hover:translate-x-1 transition" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-28 bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block bg-white/20 px-4 py-2 rounded-full font-medium mb-4">
              LIVE DEMO
            </span>
            <h2 className="text-4xl font-bold mb-6">Experience LittleSteps</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              See how our platform transforms daycare management with a personalized walkthrough from our experts.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-[#6339C0] px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg flex items-center group">
                <Play className="w-5 h-5 mr-2" />
                <span>Watch Demo</span>
                <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition" />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-[#6339C0] transition font-semibold text-lg">
                Schedule Live Demo
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-all">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Demo Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all cursor-pointer shadow-lg transform hover:scale-110">
                  <Play className="w-8 h-8 text-[#6339C0] pl-1" />
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white text-[#6339C0] px-4 py-2 rounded-lg shadow-lg font-medium flex items-center">
              <Zap className="w-5 h-5 mr-2 fill-current" />
              Interactive Demo
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl font-bold mb-6">
              Trusted by <span className="text-[#6339C0]">Industry Leaders</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "LittleSteps has transformed our multi-center operations. The executive dashboard gives me real-time visibility across all locations.",
                name: "Jennifer Alvarez",
                title: "CEO, Bright Beginnings Academy",
                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
                rating: 5
              },
              {
                quote: "Our teachers love the intuitive interface, and our parents rave about the communication features. It's been a game-changer.",
                name: "Marcus Johnson",
                title: "Director, Little Explorers",
                avatar: "https://randomuser.me/api/portraits/men/75.jpg",
                rating: 5
              },
              {
                quote: "The compliance tracking alone has saved us countless hours during audits. Worth every penny for premium centers.",
                name: "Sarah Chen",
                title: "Operations Manager, KinderCare Network",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                rating: 4
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all relative">
                <div className="absolute -top-4 -right-4 bg-[#6339C0] text-white text-xs px-2 py-1 rounded-full font-bold">
                  {testimonial.rating}/5
                </div>
                <div className="flex mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg italic mb-8 text-gray-700 relative">
                  <span className="absolute -top-4 -left-4 text-5xl text-gray-200 font-serif">"</span>
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4 border-2 border-[#6339C0]" />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Pricing Section */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium mb-4">
            PRICING
          </span>
          <h2 className="text-4xl font-bold mb-6">
            Simple, <span className="text-[#6339C0]">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your center. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: "Essentials",
              price: "$99",
              period: "per month",
              description: "For single-center operations",
              features: ["1 Center", "Up to 50 Children", "Basic Reporting", "Email Support"],
              cta: "Start Free Trial",
              popular: false
            },
            {
              name: "Professional",
              price: "$249",
              period: "per month",
              description: "For growing daycare networks",
              features: ["3 Centers", "Up to 150 Children", "Advanced Analytics", "Priority Support", "Parent Portal"],
              cta: "Start Free Trial",
              popular: true
            },
            {
              name: "Enterprise",
              price: "Custom",
              period: "",
              description: "For large childcare organizations",
              features: ["Unlimited Centers", "Unlimited Children", "Dedicated Manager", "Custom Integrations", "API Access", "White Label"],
              cta: "Contact Sales",
              popular: false
            }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`relative rounded-xl overflow-hidden border ${plan.popular ? 'border-[#6339C0] shadow-xl' : 'border-gray-200 shadow-sm'} hover:shadow-lg transition-all`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white text-center py-2 text-sm font-bold">
                  MOST POPULAR
                </div>
              )}
              <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-600"> {plan.period}</span>}
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center">
                      <Check className="w-5 h-5 text-[#6339C0] mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  className={`w-full py-3 rounded-lg font-bold ${plan.popular ? 'bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white hover:shadow-md' : 'border-2 border-[#6339C0] text-[#6339C0] hover:bg-[#f6f3ff]'}`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 px-6 bg-gray-50 max-w-7xl mx-auto rounded-xl mb-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Plan Comparison</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">See how our plans stack up against each other</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-4 pl-4">Features</th>
                <th className="text-center pb-4">Essentials</th>
                <th className="text-center pb-4">Professional</th>
                <th className="text-center pb-4">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Number of Centers", essentials: "1", professional: "3", enterprise: "Unlimited" },
                { feature: "Child Capacity", essentials: "50", professional: "150", enterprise: "Unlimited" },
                { feature: "Advanced Reporting", essentials: false, professional: true, enterprise: true },
                { feature: "Parent Portal", essentials: false, professional: true, enterprise: true },
                { feature: "Dedicated Support", essentials: false, professional: true, enterprise: true },
                { feature: "API Access", essentials: false, professional: false, enterprise: true }
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-100/50">
                  <td className="py-4 pl-4">{row.feature}</td>
                  <td className="text-center py-4">
                    {typeof row.essentials === 'boolean' ? (
                      row.essentials ? <Check className="w-5 h-5 text-[#6339C0] mx-auto" /> : "—"
                    ) : row.essentials}
                  </td>
                  <td className="text-center py-4">
                    {typeof row.professional === 'boolean' ? (
                      row.professional ? <Check className="w-5 h-5 text-[#6339C0] mx-auto" /> : "—"
                    ) : row.professional}
                  </td>
                  <td className="text-center py-4">
                    {typeof row.enterprise === 'boolean' ? (
                      row.enterprise ? <Check className="w-5 h-5 text-[#6339C0] mx-auto" /> : "—"
                    ) : row.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 bg-gradient-to-br from-[#6339C0] to-[#9F66FF] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Heart className="w-12 h-12 mx-auto mb-6 text-white/30" />
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Daycare?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the elite childcare providers who trust LittleSteps for their daily operations and long-term success.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/register" 
              className="bg-white text-[#6339C0] px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg flex items-center group"
            >
              <span>Start Free Trial</span>
              <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition" />
            </a>
            <a 
              href="#demo" 
              className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-[#6339C0] transition font-semibold text-lg flex items-center"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </a>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      
    </div>
  );
};

export default Home;