import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CaseStudyProps {
  image: string;
  category: string;
  title: string;
  description: string;
  results: string;
}

const CaseStudy: React.FC<CaseStudyProps> = ({ image, category, title, description, results }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all">
      <div className="h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3">
          {category}
        </span>
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-3">{description}</p>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
          <p className="text-green-700 dark:text-green-400 font-medium text-sm">{results}</p>
        </div>
        <a 
          href="#" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 group/link"
        >
          Read Success Story
          <ArrowRight size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
        </a>
      </div>
    </div>
  );
};

const CaseStudies: React.FC = () => {
  const caseStudies = [
    {
      image: "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      category: "Career Transition",
      title: "From Marketing to Tech: Sarah's Journey",
      description: "Sarah used our AI-powered resume optimization and mock interview features to successfully transition from marketing to a software product manager role at a Fortune 500 company.",
      results: "Landed dream job in 6 weeks with 40% salary increase"
    },
    {
      image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      category: "Recent Graduate",
      title: "Fresh Graduate Lands Senior Role",
      description: "Michael leveraged our interview preparation and application tracking system to secure a senior developer position straight out of college, beating 200+ applicants.",
      results: "Secured senior role with 85% interview success rate"
    },
    {
      image: "https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      category: "Executive Search",
      title: "C-Level Executive Career Acceleration",
      description: "Jennifer used our executive-level resume templates and strategic interview coaching to land a Chief Technology Officer position at a rapidly growing startup.",
      results: "Achieved C-level promotion in 3 months"
    }
  ];

  return (
    <section id="case-studies" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div className="max-w-2xl mb-6 md:mb-0">
            <span className="text-blue-600 dark:text-blue-400 font-medium">Success Stories</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">
              Real People, Real Results
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Discover how our AI-powered job search platform has helped professionals across industries land their dream careers and accelerate their success.
            </p>
          </div>
          <a 
            href="#" 
            className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
          >
            View All Success Stories
            <ArrowRight size={16} className="ml-2" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <CaseStudy 
              key={index}
              image={study.image}
              category={study.category}
              title={study.title}
              description={study.description}
              results={study.results}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;