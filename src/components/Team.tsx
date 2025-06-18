import React from 'react';
import { Linkedin, Twitter, Mail } from 'lucide-react';

interface TeamMemberProps {
  image: string;
  name: string;
  role: string;
  bio: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ image, name, role, bio }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-center pt-8 pb-6">
        <img 
          src={image} 
          alt={name} 
          className="w-40 h-40 rounded-full object-cover transition-transform duration-500 group-hover:scale-105 shadow-lg"
        />
      </div>
      <div className="p-6 pt-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">{name}</h3>
        <p className="text-blue-600 dark:text-blue-400 font-medium mb-3 text-center">{role}</p>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">{bio}</p>
        <div className="flex gap-3 justify-center">
          <a 
            href="#" 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="LinkedIn profile"
          >
            <Linkedin size={16} />
          </a>
          <a 
            href="#" 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="Twitter profile"
          >
            <Twitter size={16} />
          </a>
          <a 
            href="#" 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="Email"
          >
            <Mail size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

const Team: React.FC = () => {
  const teamMembers = [
    {
      image: "https://drive.google.com/file/d/1uUvaIZXne8PL2o4i_Ue-mgDV1UXcRwA_/preview",
      name: "Alex Aggarwal",
      role: "Senior AI Architect",
      bio: "Visionary leader driving AI innovation and strategic partnerships to transform businesses across multiple industries."
    },
    {
      image: "https://drive.google.com/file/d/1u2ZO_CBaLlxw19divfYaJe_W6nk_ekfB/preview",
      name: "Rahul Chandai",
      role: "AI Developer",
      bio: "Specialized in deep learning and computer vision, developing cutting-edge AI models for real-world applications."
    },
    {
      image: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      name: "Dawood Wasif",
      role: "AI Developer",
      bio: "Operations expert ensuring seamless delivery of AI solutions and maintaining the highest standards of client satisfaction."
    },
    {
      image: "https://drive.google.com/file/d/1Bs1yO94hYi0y8sUi7rm2tuk9Mt-VVwdP/preview",
      name: "Tejas Bachhav",
      role: "AI Project DevOps",
      bio: "Leading data scientist with expertise in machine learning algorithms and statistical modeling for enterprise solutions."
    },
    {
      image: "https://drive.google.com/file/d/1i_5OXAfRLdJjE8mi1dK7qDcCMr6iEoXa/preview",
      name: "Darcy Liu",
      role: "AI Developer",
      bio: "Technology visionary with 15+ years in AI research, leading our platform architecture and innovation roadmap."
    },
    {
      image: "https://drive.google.com/file/d/10YcQPLSgn8CCatLiOAvIQyUwJ4uICfp5/preview",
      name: "Mona Aggarwal",
      role: "Project Design and Managment",
      bio: "UX/UI expert crafting intuitive user experiences that make job searching seamless and engaging for our users."
    },
    {
      image: "https://drive.google.com/file/d/18eFq_3WedUDGrPn9Da4YCn7_NNW5iCgm/preview",
      name: "Yatharath Chopra",
      role: "AI Developer",
      bio: "Full-stack developer building scalable systems that power millions of job applications and career transformations."
    },
    {
      image: "https://drive.google.com/file/d/1UitP1dpGvgaxHOl3_NRj7UIWsNbK10RN/preview",
      name: "Vandana Pawar",
      role: "Project Managment/Security",
      bio: "Machine learning researcher developing next-generation algorithms for resume optimization and interview analysis."
    },
    {
      image: "https://drive.google.com/file/d/1P7Sky5IQ6dtAMT8WByArnWTBKRfij4qk/preview",
      name: "Vernessa",
      role: "Project Presentation/Video",
      bio: "Customer advocate ensuring every user achieves their career goals through personalized support and guidance."
    },
    {
      image: "https://drive.google.com/file/d/1fmHnyTEHqKe-SzeaaQg_sjgo4brcBnkg/preview",
      name: "Medhat Mikhail",
      role: "AI Graphic Designer",
      bio: "Growth strategist connecting job seekers with our platform through data-driven marketing and community building."
    },
    {
      image: "https://drive.google.com/file/d/1Mq36094QhCpeQS5L3o9RzKtVVzgxYIc6/preview",
      name: "Harkeerat Mauder",
      role: "AI Developer",
      bio: "Infrastructure specialist ensuring 99.9% uptime and lightning-fast performance for our global user base."
    },
    {
      image: "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      name: "Prathamesh Chaudhari",
      role: "AI Developer",
      bio: "Partnership expert building strategic alliances with top companies to create exclusive job opportunities for our users."
    }
  ];

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 dark:text-blue-400 font-medium">Our Team</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">
            Meet the Career Success Experts
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Our diverse team of career specialists, AI researchers, and technology experts is dedicated to revolutionizing how professionals find and land their dream jobs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {teamMembers.map((member, index) => (
            <TeamMember 
              key={index}
              image={member.image}
              name={member.name}
              role={member.role}
              bio={member.bio}
            />
          ))}
        </div>

        {/* Team Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-300">Years Combined Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">100K+</div>
              <div className="text-gray-600 dark:text-gray-300">Successful Job Placements</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">95%</div>
              <div className="text-gray-600 dark:text-gray-300">User Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">AI-Powered Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;