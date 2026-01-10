import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  FileText,
  Shield,
  Zap,
  Eye,
  BarChart3,
  Users,
  Map,
  Lock,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { value: "3x", label: "Faster Onboarding" },
    { value: "100%", label: "Data Availability" },
    { value: "24/7", label: "Access Anywhere" },
  ];

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-[#EA9000]" />,
      title: "Unified Documents",
      description:
        "Centralized document management system for all census records with secure storage and easy retrieval.",
    },
    {
      icon: <Shield className="w-8 h-8 text-[#EA9000]" />,
      title: "Secure Verification",
      description:
        "Multi-layer authentication and role-based access control ensuring data integrity and security.",
    },
    {
      icon: <Zap className="w-8 h-8 text-[#EA9000]" />,
      title: "Fast Applications",
      description:
        "Streamlined workflow for creating and processing census records with real-time updates.",
    },
    {
      icon: <Eye className="w-8 h-8 text-[#EA9000]" />,
      title: "Transparent Tracking",
      description:
        "Complete audit trail of all activities with detailed logging and accountability measures.",
    },
  ];

  const capabilities = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-Time Analytics",
      description:
        "State-wise and region-wise data visualization with interactive charts and insights.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Role-Based Access",
      description:
        "Granular permissions for Supervisors, District Admins, State Analysts, and Policy Makers.",
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Interactive Maps",
      description:
        "Visualize census data geographically with state-wise breakdowns and drill-down capabilities.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Policy Simulation",
      description:
        "Test policy eligibility criteria and simulate impact based on demographic filters.",
    },
  ];

  const faqs = [
    {
      question: "Who can use this platform?",
      answer:
        "Government officials, census administrators, state analysts, and policy makers with authorized access.",
    },
    {
      question: "Is the data secure?",
      answer:
        "Yes, we implement OAuth2 authentication, role-based access control, and complete audit logging for maximum security.",
    },
    {
      question: "Can I access it from mobile devices?",
      answer:
        "Absolutely! The platform is fully responsive and accessible from any device, anywhere, 24/7.",
    },
    {
      question: "How does the review queue work?",
      answer:
        "Records can be flagged for review and must be approved by authorized personnel before being finalized.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#EA9000] to-[#ff8800] bg-clip-text text-transparent">
                Census Portal
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-[#EA9000] transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-[#EA9000] transition-colors"
              >
                About
              </a>
              <a
                href="#faq"
                className="text-gray-700 hover:text-[#EA9000] transition-colors"
              >
                FAQ
              </a>
              <Button
                onClick={() => navigate("/login")}
                className="bg-[#EA9000] hover:bg-[#d18000]"
              >
                Sign In
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-gray-700 hover:text-[#EA9000]"
                >
                  Features
                </a>
                <a href="#about" className="text-gray-700 hover:text-[#EA9000]">
                  About
                </a>
                <a href="#faq" className="text-gray-700 hover:text-[#EA9000]">
                  FAQ
                </a>
                <Button onClick={() => navigate("/login")} className="w-full">
                  Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-4 bg-orange-100 text-[#EA9000] hover:bg-orange-200">
              Most Efficient
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Access Census Data
              <br />
              <span className="bg-gradient-to-r from-[#EA9000] to-[#ff8800] bg-clip-text text-transparent">
                Effortlessly
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A unified portal for administrators and analysts to manage
              documents, verify identities, and process census data securely
              with real-time analytics and policy simulation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#EA9000] hover:bg-[#d18000] text-lg px-8 py-6"
                onClick={() => navigate("/login")}
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() =>
                  document
                    .getElementById("features")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-[#EA9000] to-[#ff8800] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-lg">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-[#EA9000]">
              Features
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leveraging efficiency from anywhere with reassured availability
              for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Additional Capabilities */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((capability, index) => (
              <Card
                key={index}
                className="p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg text-[#EA9000]">
                  {capability.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    {capability.title}
                  </h4>
                  <p className="text-gray-600">{capability.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-100 text-[#EA9000]">
                About the Platform
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for Modern Governance
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                The Census Intelligence System leverages cutting-edge technology
                to manage, verify, and analyze demographic data. We combine
                secure authentication, role-based access control, and real-time
                analytics to ensure transparent, efficient, and accurate census
                management.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our platform empowers government officials and analysts with
                powerful tools for data-driven decision making, policy
                simulation, and comprehensive audit trails.
              </p>
              <ul className="space-y-3">
                {[
                  "OAuth2 secure authentication",
                  "Complete audit logging",
                  "Real-time data visualization",
                  "Policy impact simulation",
                  "Mobile-responsive design",
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-[#EA9000] mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#EA9000] to-[#ff8800] rounded-2xl p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Platform Highlights</h3>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="font-semibold mb-1">
                      In-Memory Architecture
                    </div>
                    <div className="text-sm text-white/80">
                      Fast, local storage without external database dependencies
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="font-semibold mb-1">RESTful API</div>
                    <div className="text-sm text-white/80">
                      Clean, well-documented API endpoints for seamless
                      integration
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="font-semibold mb-1">Modern UI</div>
                    <div className="text-sm text-white/80">
                      Built with React, Tailwind CSS, and shadcn/ui components
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-100 text-[#EA9000]">
              Video Tutorial
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Watch our comprehensive guide to learn how to navigate and utilize
              all the features of the Census Portal
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
            <video
              controls
              className="w-full h-auto"
              poster="/api/placeholder/1200/675"
            >
              <source src="/tut.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-[#EA9000] mb-2">
                Step 1
              </div>
              <h3 className="font-semibold text-lg mb-2">Authentication</h3>
              <p className="text-gray-600">
                Sign in securely using OAuth2 or development credentials
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-[#EA9000] mb-2">
                Step 2
              </div>
              <h3 className="font-semibold text-lg mb-2">Navigate Dashboard</h3>
              <p className="text-gray-600">
                Access census records, analytics, and policy tools
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-[#EA9000] mb-2">
                Step 3
              </div>
              <h3 className="font-semibold text-lg mb-2">Manage Data</h3>
              <p className="text-gray-600">
                Create, review, and analyze census data efficiently
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-[#EA9000]">FAQ's</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              You Asked, We Answered
            </h2>
            <p className="text-lg text-gray-600">
              Still got questions? Feel free to reach out to our support team
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#EA9000] to-[#ff8800]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join the modern approach to census data management and analytics
          </p>
          <Button
            size="lg"
            className="bg-white text-[#EA9000] hover:bg-gray-100 text-lg px-8 py-6"
            onClick={() => navigate("/login")}
          >
            Access Platform <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Census Portal</h3>
              <p className="text-gray-400">
                Empowering governance through intelligent data management and
                analytics
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Pages</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Census Intelligence System. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
