import React from 'react';
import { 
  BookOpen,
  Apple,
  Gamepad2,
  Music,
  Paintbrush,
  Leaf,
  Heart,
  ChevronRight,
  Check,
  Users,
  Shield,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Smile,
  GraduationCap,
  Globe,
  Laptop
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './components/header/Header';

const Home: React.FC = () => {
  const stats = [
    { value: "200+", label: "Happy Children", icon: <Smile className="text-[#9F66FF]" size={20} /> },
    { value: "98%", label: "Parent Satisfaction", icon: <Heart className="text-[#9F66FF]" size={20} /> },
    { value: "10:1", label: "Child to Teacher Ratio", icon: <Users className="text-[#9F66FF]" size={20} /> },
    { value: "4.9/5", label: "Average Rating", icon: <Star className="text-[#9F66FF]" size={20} /> }
  ];

  const ageGroups = [
    {
      range: "3-5 Years",
      icon: <Paintbrush className="text-[#6339C0]" size={24} />,
      description: "Play-based learning with focus on social skills and creativity",
      image: "https://images.unsplash.com/photo-1600046050370-4e64d1e902e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      range: "6-10 Years",
      icon: <Globe className="text-[#6339C0]" size={24} />,
      description: "Exploratory learning with STEM activities and team projects",
      image: "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    },
    {
      range: "11-16 Years",
      icon: <GraduationCap className="text-[#6339C0]" size={24} />,
      description: "Specialized programs with academic support and extracurriculars",
      image: "https://images.unsplash.com/photo-1524179091875-b494986c6e1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    }
  ];

  const programs = [
    {
      name: "Early Childhood",
      icon: <BookOpen className="text-[#6339C0]" size={24} />,
      description: "Foundational literacy and numeracy through play",
      activities: ["Story time", "Creative arts", "Sensory play"]
    },
    {
      name: "Elementary Program",
      icon: <Laptop className="text-[#6339C0]" size={24} />,
      description: "Project-based learning with technology integration",
      activities: ["Science experiments", "Coding basics", "Reading clubs"]
    },
    {
      name: "Teen Development",
      icon: <GraduationCap className="text-[#6339C0]" size={24} />,
      description: "Leadership and skill-building activities",
      activities: ["Sports teams", "Study groups", "Career workshops"]
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
              <Shield className="mr-2" size={18} />
              <span>Licensed & Accredited</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#6339C0] to-[#9F66FF] bg-clip-text text-transparent">
                Little Steps
              </span><br />
              Growing With Your Child
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              Comprehensive care and education for children ages 3 to 16. From preschool play to teen development, we support every stage of growth.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Link 
                to="/contact" 
                className="bg-gradient-to-r from-[#6339C0] to-[#9F66FF] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg flex items-center group"
              >
                <span>Schedule a Visit</span>
                <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                alt="Multi-age group of children learning together" 
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Age Groups Section */}
      <section className="py-15 px-6 bg-gradient-to-br from-[#f9f6ff] to-[#f0e9ff]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium mb-4">
              OUR AGE GROUPS
            </span>
            <h2 className="text-4xl font-bold mb-6">
              Programs for <span className="text-[#6339C0]">Every Stage</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored learning experiences from preschool through high school
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {ageGroups.map((group, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={group.image} 
                    alt={`Children aged ${group.range}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#f3eeff] rounded-xl mr-4">
                      {group.icon}
                    </div>
                    <h3 className="text-xl font-bold">{group.range}</h3>
                  </div>
                  <p className="text-gray-600">{group.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#f9f6ff] p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-all flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center bg-[#f3eeff] rounded-full mb-3">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#6339C0] to-[#9F66FF] bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-6 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium mb-4">
            OUR PROGRAMS
          </span>
          <h2 className="text-4xl font-bold mb-6">
            Learning For <span className="text-[#6339C0]">All Ages</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((program, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
              <div className="w-14 h-14 flex items-center justify-center bg-[#f3eeff] rounded-xl mb-4">
                {program.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{program.name}</h3>
              <p className="text-gray-600 mb-4">{program.description}</p>
              <ul className="space-y-2 mb-6">
                {program.activities.map((activity, j) => (
                  <li key={j} className="flex items-start">
                    <Check className="w-4 h-4 text-[#6339C0] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{activity}</span>
                  </li>
                ))}
              </ul>
              <div className="h-40 overflow-hidden rounded-lg">
                <img 
                  src={`https://source.unsplash.com/random/300x200/?children,${program.name.toLowerCase().replace(' ', '')}`}
                  alt={program.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-10 px-6 bg-gradient-to-br from-[#f9f6ff] to-[#f0e9ff]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium mb-4">
              LIFE AT LITTLESTEPS
            </span>
            <h2 className="text-4xl font-bold mb-6">
              Where <span className="text-[#6339C0]">Children Thrive</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "https://images.unsplash.com/photo-1541692641319-981cc79ee10a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
              "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
              "https://images.unsplash.com/photo-1541178735493-479c1a27ed24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
              "https://images.unsplash.com/photo-1588072432904-843af37f03ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
              "https://images.unsplash.com/photo-1542816417-0983675099c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
              "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            ].map((imgSrc, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-xl hover:shadow-lg transition-all">
                <img 
                  src={imgSrc}
                  alt="Children learning and playing"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <span className="inline-block bg-[#f3eeff] text-[#6339C0] px-4 py-2 rounded-full font-medium">
              GET IN TOUCH
            </span>
            <h2 className="text-4xl font-bold">
              Contact <span className="text-[#6339C0]">LittleSteps</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-[#6339C0] mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Our Location</h3>
                  <p className="text-gray-600">UCSC Building Complex, 35 Reid Ave, Colombo 00700</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-[#6339C0] mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Call Us</h3>
                  <p className="text-gray-600">+94 766 135110</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-[#6339C0] mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Email Us</h3>
                  <p className="text-gray-600">littlesteps@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-[#6339C0] mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Hours</h3>
                  <p className="text-gray-600">Monday-Friday: 7:30am - 6:00pm</p>
                  <p className="text-gray-600">Saturday: 9:00am - 2:00pm</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1541692641319-981cc79ee10a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
              alt="Happy children at our center" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-15 bg-gradient-to-br from-[#6339C0] to-[#9F66FF] text-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Heart className="w-12 h-12 mx-auto mb-6 text-white/30" />
          <h2 className="text-4xl font-bold mb-6">Begin Your Child's Learning Journey</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Limited spaces available for all age groups (3-16 years).
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center bg-white text-[#6339C0] px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg group mx-auto"
          >
            <span>Contact Us Today</span>
            <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;