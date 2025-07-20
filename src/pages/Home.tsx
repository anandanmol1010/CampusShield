import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Settings, Shield, Users, Lock, CheckCircle } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl mx-4 sm:mx-6 lg:mx-8"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-lg">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Campus<span className="text-blue-600">Shield</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 font-medium">
              Report Issues Anonymously. Stay Safe. Be Heard.
            </p>
            <p className="text-lg text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              A secure, anonymous platform for students to report incidents of ragging, harassment, 
              mental health concerns, and faculty misconduct. Your voice matters, and your identity stays protected.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/submit"
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>Submit Complaint</span>
              </Link>
              <Link
                to="/track"
                className="w-full sm:w-auto bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Track Complaint</span>
              </Link>
              <Link
                to="/admin-login"
                className="w-full sm:w-auto bg-slate-100 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-200 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Settings className="h-5 w-5" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose CampusShield?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with students' safety and privacy in mind, ensuring your voice is heard while protecting your identity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100">
              <div className="p-3 bg-blue-100 rounded-xl w-fit mb-6">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">100% Anonymous</h3>
              <p className="text-slate-600 leading-relaxed">
                Your identity is completely protected. Report incidents without fear of retaliation or exposure.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100">
              <div className="p-3 bg-green-100 rounded-xl w-fit mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Real-time Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                Get a unique ticket ID to track your complaint status and receive updates on the resolution process.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100">
              <div className="p-3 bg-purple-100 rounded-xl w-fit mb-6">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Dedicated Support</h3>
              <p className="text-slate-600 leading-relaxed">
                Professional administrators review each case and ensure appropriate action is taken promptly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              What Can You Report?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              CampusShield covers a wide range of issues affecting student welfare and campus safety.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[{
              title: 'Ragging',
              description: 'Any form of ragging, bullying, or intimidation by senior students.',
              color: 'red'
            },
            {
              title: 'Harassment',
              description: 'Sexual harassment, discrimination, or any form of inappropriate behavior.',
              color: 'orange'
            },
            {
              title: 'Mental Health',
              description: 'Concerns about mental health support, counseling, or psychological well-being.',
              color: 'blue'
            },
            {
              title: 'Faculty Misconduct',
              description: 'Inappropriate behavior, bias, or unprofessional conduct by faculty members.',
              color: 'purple'
            },
            {
              title: 'Others',
              description: 'Any other campus-related issues that don\'t fit into the above categories.',
              color: 'gray'
            }].map((category, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{category.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;