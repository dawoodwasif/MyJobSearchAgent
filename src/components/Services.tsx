import React from 'react';
import { FileText, MessageCircle, BarChart3, Sparkles, Target, CheckCircle } from 'lucide-react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  gradient: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, features, gradient }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100 dark:border-gray-700 group relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className={`w-16 h-16 ${gradient} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-lg">
          {description}
        </p>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <button className={`w-full ${gradient} text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all hover:-translate-y-1 group-hover:scale-105`}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  const services = [
    {
      icon: <FileText size={32} />,
      title: "Resume & Cover Letter Customization",
      description: "AI-powered resume and cover letter optimization tailored to specific job requirements and industry standards.",
      features: [
        "ATS-optimized formatting and keywords",
        "Industry-specific templates and styles",
        "Real-time content suggestions",
        "Skills gap analysis and recommendations",
        "Multiple format exports (PDF, Word, etc.)",
        "Version control and tracking"
      ],
      gradient: "bg-gradient-to-br from-blue-600 to-blue-700"
    },
    {
      icon: <MessageCircle size={32} />,
      title: "Mock Interview & Q&A Preparation",
      description: "Comprehensive interview preparation with AI-driven mock interviews, personalized feedback, and industry-specific question banks.",
      features: [
        "AI-powered mock interview sessions",
        "Industry and role-specific questions",
        "Real-time feedback and scoring",
        "Video practice with analysis",
        "Behavioral and technical question prep",
        "Performance tracking and improvement tips"
      ],
      gradient: "bg-gradient-to-br from-purple-600 to-purple-700"
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Job Dashboard & Application Tracking",
      description: "Intelligent job search dashboard with detailed job descriptions, role matching, and comprehensive application management.",
      features: [
        "Personalized job recommendations",
        "Advanced filtering and search capabilities",
        "Application status tracking",
        "Interview scheduling and reminders",
        "Salary insights and market analysis",
        "Company research and insights"
      ],
      gradient: "bg-gradient-to-br from-emerald-600 to-emerald-700"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">Our Services</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 text-gray-900 dark:text-white">
            Your Complete Job Search
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Success Platform
            </span>
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 text-xl leading-relaxed">
            From crafting the perfect resume to landing your dream job, our AI-powered platform provides everything you need to succeed in today's competitive job market.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              features={service.features}
              gradient={service.gradient}
            />
          ))}
        </div>
        
        {/* Call to action section */}
        <div className="text-center mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
            <Target className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Job Search?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Join thousands of professionals who have successfully landed their dream jobs using our platform.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all hover:-translate-y-1">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;