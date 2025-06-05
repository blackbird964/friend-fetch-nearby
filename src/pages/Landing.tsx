
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, MessageCircle, Zap, Shield, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleLearnMore = () => {
    const benefitsSection = document.getElementById('benefits-section');
    if (benefitsSection) {
      benefitsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const benefits = [
    {
      icon: MapPin,
      title: "Location-Based Connections",
      description: "Meet people nearby who share your interests and are available to hang out right now."
    },
    {
      icon: Users,
      title: "Real-Time Social Discovery",
      description: "Find friends, study partners, or activity buddies in your immediate vicinity."
    },
    {
      icon: MessageCircle,
      title: "Instant Communication",
      description: "Chat directly with people around you and coordinate meetups effortlessly."
    },
    {
      icon: Zap,
      title: "Spontaneous Meetups",
      description: "Turn boring moments into exciting social opportunities with spontaneous connections."
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Built with privacy in mind. Control your visibility and who can connect with you."
    },
    {
      icon: Globe,
      title: "Community Building",
      description: "Build meaningful local connections and strengthen your community bonds."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/aee9cabd-3e35-4f44-809d-b0266fd39860.png" 
              alt="Kairo Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-2xl font-bold text-gray-900">Kairo</span>
          </div>
          <Button onClick={handleSignIn} variant="outline">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Meet People.<br />
          <span className="text-blue-600">Right Now.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Kairo connects you with like-minded people in your area who are available to meet up, hang out, or collaborate on activities right now.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-3">
            Get Started Free
          </Button>
          <Button onClick={handleLearnMore} variant="outline" size="lg" className="text-lg px-8 py-3">
            Learn More
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits-section" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Kairo?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform how you connect with your local community and make every moment social.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Kairo Works
            </h2>
            <p className="text-lg text-gray-600">
              Getting connected is easier than ever
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Set Your Status</h3>
              <p className="text-gray-600">
                Let others know what you're interested in doing and when you're available.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Discover Nearby</h3>
              <p className="text-gray-600">
                See who's around you and what activities they're up for right now.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Connect & Meet</h3>
              <p className="text-gray-600">
                Send a message, plan the meetup, and enjoy new connections in your area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Meet Amazing People?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of people who are already using Kairo to make meaningful connections in their local community.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100"
          >
            Start Connecting Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img 
                src="/lovable-uploads/aee9cabd-3e35-4f44-809d-b0266fd39860.png" 
                alt="Kairo Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-white">Kairo</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2024 Kairo. Connecting communities, one meetup at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
