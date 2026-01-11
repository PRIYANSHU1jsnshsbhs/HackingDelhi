import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import ChatbotWidget from "../components/ChatbotWidget";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import "../shepherd-custom.css";
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
  Languages,
  Compass,
} from "lucide-react";

// Translations
const translations = {
  en: {
    nav: {
      title: "Census Portal",
      features: "Features",
      about: "About",
      faq: "FAQ",
      signIn: "Sign In",
    },
    hero: {
      badge: "Most Efficient",
      title: "Access Census Data",
      titleHighlight: "Effortlessly",
      description:
        "A unified portal for administrators and analysts to manage documents, verify identities, and process census data securely with real-time analytics and policy simulation.",
      getStarted: "Get Started",
      learnMore: "Learn More",
    },
    stats: [
      { value: "3x", label: "Faster Onboarding" },
      { value: "100%", label: "Data Availability" },
      { value: "24/7", label: "Access Anywhere" },
    ],
    features: {
      badge: "Features",
      title: "Everything You Need",
      subtitle:
        "Leveraging efficiency from anywhere with reassured availability for everyone",
      items: [
        {
          title: "Unified Documents",
          description:
            "Centralized document management system for all census records with secure storage and easy retrieval.",
        },
        {
          title: "Secure Verification",
          description:
            "Multi-layer authentication and role-based access control ensuring data integrity and security.",
        },
        {
          title: "Fast Applications",
          description:
            "Streamlined workflow for creating and processing census records with real-time updates.",
        },
        {
          title: "Transparent Tracking",
          description:
            "Complete audit trail of all activities with detailed logging and accountability measures.",
        },
      ],
    },
    capabilities: [
      {
        title: "Real-Time Analytics",
        description:
          "State-wise and region-wise data visualization with interactive charts and insights.",
      },
      {
        title: "Role-Based Access",
        description:
          "Granular permissions for Supervisors, District Admins, State Analysts, and Policy Makers.",
      },
      {
        title: "Interactive Maps",
        description:
          "Visualize census data geographically with state-wise breakdowns and drill-down capabilities.",
      },
      {
        title: "Policy Simulation",
        description:
          "Test policy eligibility criteria and simulate impact based on demographic filters.",
      },
    ],
    about: {
      badge: "About the Platform",
      title: "Built for Modern Governance",
      description1:
        "The Census Intelligence System leverages cutting-edge technology to manage, verify, and analyze demographic data. We combine secure authentication, role-based access control, and real-time analytics to ensure transparent, efficient, and accurate census management.",
      description2:
        "Our platform empowers government officials and analysts with powerful tools for data-driven decision making, policy simulation, and comprehensive audit trails.",
      highlights: {
        title: "Platform Highlights",
        items: [
          {
            title: "In-Memory Architecture",
            description:
              "Fast, local storage without external database dependencies",
          },
          {
            title: "RESTful API",
            description:
              "Clean, well-documented API endpoints for seamless integration",
          },
          {
            title: "Modern UI",
            description:
              "Built with React, Tailwind CSS, and shadcn/ui components",
          },
        ],
      },
      features: [
        "OAuth2 secure authentication",
        "Complete audit logging",
        "Real-time data visualization",
        "Policy impact simulation",
        "Mobile-responsive design",
      ],
    },
    video: {
      badge: "Video Tutorial",
      title: "See How It Works",
      subtitle:
        "Watch our comprehensive guide to learn how to navigate and utilize all the features of the Census Portal",
      steps: [
        {
          title: "Authentication",
          description:
            "Sign in securely using OAuth2 or development credentials",
        },
        {
          title: "Navigate Dashboard",
          description: "Access census records, analytics, and policy tools",
        },
        {
          title: "Manage Data",
          description: "Create, review, and analyze census data efficiently",
        },
      ],
    },
    faq: {
      badge: "FAQ's",
      title: "You Asked, We Answered",
      subtitle:
        "Still got questions? Feel free to reach out to our support team",
      items: [
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
      ],
    },
    cta: {
      title: "Ready to Get Started?",
      subtitle:
        "Join the modern approach to census data management and analytics",
      button: "Access Platform",
    },
    footer: {
      title: "Census Portal",
      description:
        "Empowering governance through intelligent data management and analytics",
      pages: {
        title: "Pages",
        features: "Features",
        about: "About",
      },
      resources: {
        title: "Resources",
        faq: "FAQ",
        documentation: "Documentation",
      },
      legal: {
        title: "Legal",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
      },
      copyright: "Census Intelligence System. All rights reserved.",
    },
  },
  hi: {
    nav: {
      title: "जनगणना पोर्टल",
      features: "विशेषताएं",
      about: "के बारे में",
      faq: "सामान्य प्रश्न",
      signIn: "साइन इन",
    },
    hero: {
      badge: "सबसे कुशल",
      title: "जनगणना डेटा तक पहुंच",
      titleHighlight: "आसानी से",
      description:
        "प्रशासकों और विश्लेषकों के लिए एक एकीकृत पोर्टल जो दस्तावेजों का प्रबंधन करने, पहचान सत्यापित करने और रीयल-टाइम विश्लेषण और नीति सिमुलेशन के साथ जनगणना डेटा को सुरक्षित रूप से संसाधित करने के लिए है।",
      getStarted: "शुरू करें",
      learnMore: "और जानें",
    },
    stats: [
      { value: "3x", label: "तेज़ ऑनबोर्डिंग" },
      { value: "100%", label: "डेटा उपलब्धता" },
      { value: "24/7", label: "कहीं से भी एक्सेस" },
    ],
    features: {
      badge: "विशेषताएं",
      title: "आपको जो कुछ चाहिए",
      subtitle:
        "हर किसी के लिए आश्वस्त उपलब्धता के साथ कहीं से भी दक्षता का लाभ उठाना",
      items: [
        {
          title: "एकीकृत दस्तावेज़",
          description:
            "सुरक्षित संग्रहण और आसान पुनर्प्राप्ति के साथ सभी जनगणना रिकॉर्ड के लिए केंद्रीकृत दस्तावेज़ प्रबंधन प्रणाली।",
        },
        {
          title: "सुरक्षित सत्यापन",
          description:
            "डेटा अखंडता और सुरक्षा सुनिश्चित करने वाली बहु-स्तरीय प्रमाणीकरण और भूमिका-आधारित पहुंच नियंत्रण।",
        },
        {
          title: "तेज़ आवेदन",
          description:
            "रीयल-टाइम अपडेट के साथ जनगणना रिकॉर्ड बनाने और संसाधित करने के लिए सुव्यवस्थित कार्यप्रवाह।",
        },
        {
          title: "पारदर्शी ट्रैकिंग",
          description:
            "विस्तृत लॉगिंग और जवाबदेही उपायों के साथ सभी गतिविधियों का पूर्ण ऑडिट ट्रेल।",
        },
      ],
    },
    capabilities: [
      {
        title: "रीयल-टाइम विश्लेषण",
        description:
          "इंटरैक्टिव चार्ट और अंतर्दृष्टि के साथ राज्य-वार और क्षेत्र-वार डेटा विज़ुअलाइज़ेशन।",
      },
      {
        title: "भूमिका-आधारित पहुंच",
        description:
          "पर्यवेक्षकों, जिला प्रशासकों, राज्य विश्लेषकों और नीति निर्माताओं के लिए विस्तृत अनुमतियां।",
      },
      {
        title: "इंटरैक्टिव मानचित्र",
        description:
          "राज्य-वार विवरण और ड्रिल-डाउन क्षमताओं के साथ जनगणना डेटा को भौगोलिक रूप से कल्पना करें।",
      },
      {
        title: "नीति सिमुलेशन",
        description:
          "जनसांख्यिकीय फ़िल्टर के आधार पर नीति पात्रता मानदंड का परीक्षण और प्रभाव का अनुकरण करें।",
      },
    ],
    about: {
      badge: "मंच के बारे में",
      title: "आधुनिक शासन के लिए निर्मित",
      description1:
        "जनगणना खुफिया प्रणाली जनसांख्यिकीय डेटा को प्रबंधित करने, सत्यापित करने और विश्लेषण करने के लिए अत्याधुनिक तकनीक का लाभ उठाती है। हम पारदर्शी, कुशल और सटीक जनगणना प्रबंधन सुनिश्चित करने के लिए सुरक्षित प्रमाणीकरण, भूमिका-आधारित पहुंच नियंत्रण और रीयल-टाइम विश्लेषण को जोड़ते हैं।",
      description2:
        "हमारा मंच सरकारी अधिकारियों और विश्लेषकों को डेटा-संचालित निर्णय लेने, नीति सिमुलेशन और व्यापक ऑडिट ट्रेल्स के लिए शक्तिशाली उपकरणों के साथ सशक्त बनाता है।",
      highlights: {
        title: "मंच की मुख्य बातें",
        items: [
          {
            title: "इन-मेमोरी आर्किटेक्चर",
            description: "बाहरी डेटाबेस निर्भरता के बिना तेज़, स्थानीय संग्रहण",
          },
          {
            title: "RESTful API",
            description:
              "निर्बाध एकीकरण के लिए स्वच्छ, अच्छी तरह से प्रलेखित API एंडपॉइंट",
          },
          {
            title: "आधुनिक UI",
            description:
              "React, Tailwind CSS और shadcn/ui घटकों के साथ निर्मित",
          },
        ],
      },
      features: [
        "OAuth2 सुरक्षित प्रमाणीकरण",
        "पूर्ण ऑडिट लॉगिंग",
        "रीयल-टाइम डेटा विज़ुअलाइज़ेशन",
        "नीति प्रभाव सिमुलेशन",
        "मोबाइल-उत्तरदायी डिज़ाइन",
      ],
    },
    video: {
      badge: "वीडियो ट्यूटोरियल",
      title: "देखें कैसे काम करता है",
      subtitle:
        "जनगणना पोर्टल की सभी सुविधाओं को नेविगेट करने और उपयोग करने का तरीका जानने के लिए हमारी व्यापक गाइड देखें",
      steps: [
        {
          title: "प्रमाणीकरण",
          description:
            "OAuth2 या विकास क्रेडेंशियल का उपयोग करके सुरक्षित रूप से साइन इन करें",
        },
        {
          title: "डैशबोर्ड नेविगेट करें",
          description: "जनगणना रिकॉर्ड, विश्लेषण और नीति उपकरणों तक पहुंचें",
        },
        {
          title: "डेटा प्रबंधित करें",
          description:
            "जनगणना डेटा को कुशलतापूर्वक बनाएं, समीक्षा करें और विश्लेषण करें",
        },
      ],
    },
    faq: {
      badge: "सामान्य प्रश्न",
      title: "आपने पूछा, हमने उत्तर दिया",
      subtitle:
        "अभी भी प्रश्न हैं? हमारी सहायता टीम से संपर्क करने के लिए स्वतंत्र महसूस करें",
      items: [
        {
          question: "इस मंच का उपयोग कौन कर सकता है?",
          answer:
            "अधिकृत पहुंच के साथ सरकारी अधिकारी, जनगणना प्रशासक, राज्य विश्लेषक और नीति निर्माता।",
        },
        {
          question: "क्या डेटा सुरक्षित है?",
          answer:
            "हां, हम अधिकतम सुरक्षा के लिए OAuth2 प्रमाणीकरण, भूमिका-आधारित पहुंच नियंत्रण और पूर्ण ऑडिट लॉगिंग लागू करते हैं।",
        },
        {
          question: "क्या मैं इसे मोबाइल उपकरणों से एक्सेस कर सकता हूं?",
          answer:
            "बिल्कुल! प्लेटफ़ॉर्म पूरी तरह से उत्तरदायी है और किसी भी डिवाइस, कहीं से भी, 24/7 एक्सेस करने योग्य है।",
        },
        {
          question: "समीक्षा कतार कैसे काम करती है?",
          answer:
            "रिकॉर्ड को समीक्षा के लिए चिह्नित किया जा सकता है और अंतिम रूप देने से पहले अधिकृत कर्मियों द्वारा अनुमोदित किया जाना चाहिए।",
        },
      ],
    },
    cta: {
      title: "शुरू करने के लिए तैयार हैं?",
      subtitle:
        "जनगणना डेटा प्रबंधन और विश्लेषण के आधुनिक दृष्टिकोण में शामिल हों",
      button: "मंच तक पहुंचें",
    },
    footer: {
      title: "जनगणना पोर्टल",
      description:
        "बुद्धिमान डेटा प्रबंधन और विश्लेषण के माध्यम से शासन को सशक्त बनाना",
      pages: {
        title: "पृष्ठ",
        features: "विशेषताएं",
        about: "के बारे में",
      },
      resources: {
        title: "संसाधन",
        faq: "सामान्य प्रश्न",
        documentation: "प्रलेखन",
      },
      legal: {
        title: "कानूनी",
        privacy: "गोपनीयता नीति",
        terms: "सेवा की शर्तें",
      },
      copyright: "जनगणना खुफिया प्रणाली। सर्वाधिकार सुरक्षित।",
    },
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState("en");
  const tourRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize Shepherd tour
  useEffect(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: "shepherd-theme-custom",
        scrollTo: { behavior: "smooth", block: "center" },
      },
    });

    // Define tour steps
    const steps = [
      {
        id: "welcome",
        title:
          language === "en"
            ? "Welcome to Census Portal"
            : "जनगणना पोर्टल में आपका स्वागत है",
        text:
          language === "en"
            ? "Let's take a quick tour to show you all the amazing features we offer."
            : "आइए हम आपको सभी अद्भुत सुविधाओं को दिखाने के लिए एक त्वरित दौरा करें।",
        buttons: [
          {
            text: language === "en" ? "Skip" : "छोड़ें",
            action: tour.cancel,
            secondary: true,
          },
          {
            text: language === "en" ? "Next" : "अगला",
            action: tour.next,
          },
        ],
      },
      {
        id: "hero",
        attachTo: { element: ".hero-section", on: "bottom" },
        title:
          language === "en"
            ? "Powerful Census Management"
            : "शक्तिशाली जनगणना प्रबंधन",
        text:
          language === "en"
            ? "Access and manage census data effortlessly with our unified portal designed for administrators and analysts."
            : "प्रशासकों और विश्लेषकों के लिए डिज़ाइन किए गए हमारे एकीकृत पोर्टल के साथ जनगणना डेटा तक आसानी से पहुंचें और प्रबंधित करें।",
        buttons: [
          {
            text: language === "en" ? "Back" : "पीछे",
            action: tour.back,
            secondary: true,
          },
          {
            text: language === "en" ? "Next" : "अगला",
            action: tour.next,
          },
        ],
      },
      {
        id: "language",
        attachTo: { element: ".language-selector", on: "bottom" },
        title: language === "en" ? "Language Selector" : "भाषा चयनकर्ता",
        text:
          language === "en"
            ? "Switch between English and Hindi anytime. All content updates instantly!"
            : "किसी भी समय अंग्रेजी और हिंदी के बीच स्विच करें। सभी सामग्री तुरंत अपडेट हो जाती है!",
        buttons: [
          {
            text: language === "en" ? "Back" : "पीछे",
            action: tour.back,
            secondary: true,
          },
          {
            text: language === "en" ? "Next" : "अगला",
            action: tour.next,
          },
        ],
      },
      {
        id: "features",
        attachTo: { element: "#features", on: "top" },
        title: language === "en" ? "Core Features" : "मुख्य विशेषताएं",
        text:
          language === "en"
            ? "Discover our unified document management, secure verification, fast applications, and transparent tracking systems."
            : "हमारे एकीकृत दस्तावेज़ प्रबंधन, सुरक्षित सत्यापन, तेज़ आवेदन और पारदर्शी ट्रैकिंग सिस्टम का पता लगाएं।",
        buttons: [
          {
            text: language === "en" ? "Back" : "पीछे",
            action: tour.back,
            secondary: true,
          },
          {
            text: language === "en" ? "Next" : "अगला",
            action: tour.next,
          },
        ],
      },
      {
        id: "about",
        attachTo: { element: "#about", on: "top" },
        title:
          language === "en" ? "About the Platform" : "मंच के बारे में",
        text:
          language === "en"
            ? "Built for modern governance with cutting-edge technology, OAuth2 authentication, and real-time analytics."
            : "अत्याधुनिक तकनीक, OAuth2 प्रमाणीकरण और रीयल-टाइम विश्लेषण के साथ आधुनिक शासन के लिए निर्मित।",
        buttons: [
          {
            text: language === "en" ? "Back" : "पीछे",
            action: tour.back,
            secondary: true,
          },
          {
            text: language === "en" ? "Next" : "अगला",
            action: tour.next,
          },
        ],
      },
      {
        id: "video",
        attachTo: { element: ".video-section", on: "top" },
        title: language === "en" ? "Video Tutorial" : "वीडियो ट्यूटोरियल",
        text:
          language === "en"
            ? "Watch our comprehensive guide to learn how to navigate and use all features effectively."
            : "सभी सुविधाओं को प्रभावी ढंग से नेविगेट करने और उपयोग करने का तरीका जानने के लिए हमारी व्यापक गाइड देखें।",
        buttons: [
          {
            text: language === "en" ? "Back" : "पीछे",
            action: tour.back,
            secondary: true,
          },
          {
            text: language === "en" ? "Next" : "अगला",
            action: tour.next,
          },
        ],
      },
      {
        id: "faq",
        attachTo: { element: "#faq", on: "top" },
        title: language === "en" ? "Frequently Asked Questions" : "सामान्य प्रश्न",
        text:
          language === "en"
            ? "Find answers to common questions about platform usage, security, and accessibility."
            : "प्लेटफ़ॉर्म उपयोग, सुरक्षा और पहुंच के बारे में सामान्य प्रश्नों के उत्तर खोजें।",
        buttons: [
          {
            text: language === "en" ? "Back" : "पीछे",
            action: tour.back,
            secondary: true,
          },
          {
            text: language === "en" ? "Finish" : "समाप्त",
            action: tour.complete,
          },
        ],
      },
    ];

    steps.forEach((step) => tour.addStep(step));
    tourRef.current = tour;

    return () => {
      if (tourRef.current) {
        tourRef.current.complete();
      }
    };
  }, [language]);

  const startTour = () => {
    if (tourRef.current) {
      tourRef.current.start();
    }
  };

  const t = translations[language];

  const featureIcons = [
    <FileText className="w-8 h-8 text-[#EA9000]" />,
    <Shield className="w-8 h-8 text-[#EA9000]" />,
    <Zap className="w-8 h-8 text-[#EA9000]" />,
    <Eye className="w-8 h-8 text-[#EA9000]" />,
  ];

  const capabilityIcons = [
    <BarChart3 className="w-6 h-6" />,
    <Users className="w-6 h-6" />,
    <Map className="w-6 h-6" />,
    <Lock className="w-6 h-6" />,
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
                {t.nav.title}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-[#EA9000] transition-colors"
              >
                {t.nav.features}
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-[#EA9000] transition-colors"
              >
                {t.nav.about}
              </a>
              <a
                href="#faq"
                className="text-gray-700 hover:text-[#EA9000] transition-colors"
              >
                {t.nav.faq}
              </a>

              {/* Language Selector */}
              <div className="language-selector flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Languages className="h-4 w-4 text-gray-600" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                </select>
              </div>

              {/* Tour Button */}
              <Button
                onClick={startTour}
                variant="outline"
                className="border-[#EA9000] text-[#EA9000] hover:bg-[#EA9000] hover:text-white"
              >
                <Compass className="h-4 w-4 mr-2" />
                {language === "en" ? "Take Tour" : "दौरा करें"}
              </Button>

              <Button
                onClick={() => navigate("/login")}
                className="bg-[#EA9000] hover:bg-[#d18000]"
              >
                {t.nav.signIn}
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
                  {t.nav.features}
                </a>
                <a href="#about" className="text-gray-700 hover:text-[#EA9000]">
                  {t.nav.about}
                </a>
                <a href="#faq" className="text-gray-700 hover:text-[#EA9000]">
                  {t.nav.faq}
                </a>

                {/* Mobile Language Selector */}
                <div className="language-selector flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <Languages className="h-4 w-4 text-gray-600" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer w-full"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                  </select>
                </div>

                <Button
                  onClick={startTour}
                  variant="outline"
                  className="w-full border-[#EA9000] text-[#EA9000] hover:bg-[#EA9000] hover:text-white"
                >
                  <Compass className="h-4 w-4 mr-2" />
                  {language === "en" ? "Take Tour" : "दौरा करें"}
                </Button>

                <Button onClick={() => navigate("/login")} className="w-full">
                  {t.nav.signIn}
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-4 bg-orange-100 text-[#EA9000] hover:bg-orange-200">
              {t.hero.badge}
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t.hero.title}
              <br />
              <span className="bg-gradient-to-r from-[#EA9000] to-[#ff8800] bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#EA9000] hover:bg-[#d18000] text-lg px-8 py-6"
                onClick={() => navigate("/login")}
              >
                {t.hero.getStarted} <ArrowRight className="ml-2 h-5 w-5" />
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
                {t.hero.learnMore}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.stats.map((stat, index) => (
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
              {t.features.badge}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.items.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="mb-4">{featureIcons[index]}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Additional Capabilities */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.capabilities.map((capability, index) => (
              <Card
                key={index}
                className="p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg text-[#EA9000]">
                  {capabilityIcons[index]}
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
                {t.about.badge}
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {t.about.title}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t.about.description1}
              </p>
              <p className="text-lg text-gray-600 mb-6">
                {t.about.description2}
              </p>
              <ul className="space-y-3">
                {t.about.features.map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-[#EA9000] mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#EA9000] to-[#ff8800] rounded-2xl p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">
                  {t.about.highlights.title}
                </h3>
                <div className="space-y-4">
                  {t.about.highlights.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur rounded-lg p-4"
                    >
                      <div className="font-semibold mb-1">{item.title}</div>
                      <div className="text-sm text-white/80">
                        {item.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section className="video-section py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-100 text-[#EA9000]">
              {t.video.badge}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.video.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.video.subtitle}
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
            {t.video.steps.map((step, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-3xl font-bold text-[#EA9000] mb-2">
                  {language === "en" ? `Step ${index + 1}` : `चरण ${index + 1}`}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-[#EA9000]">
              {t.faq.badge}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.faq.title}
            </h2>
            <p className="text-lg text-gray-600">{t.faq.subtitle}</p>
          </div>

          <div className="space-y-6">
            {t.faq.items.map((faq, index) => (
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
          <h2 className="text-4xl font-bold mb-6">{t.cta.title}</h2>
          <p className="text-xl mb-8 text-white/90">{t.cta.subtitle}</p>
          <Button
            size="lg"
            className="bg-white text-[#EA9000] hover:bg-gray-100 text-lg px-8 py-6"
            onClick={() => navigate("/login")}
          >
            {t.cta.button} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{t.footer.title}</h3>
              <p className="text-gray-400">{t.footer.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.footer.pages.title}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    {t.footer.pages.features}
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="hover:text-white transition-colors"
                  >
                    {t.footer.pages.about}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.footer.resources.title}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    {t.footer.resources.faq}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t.footer.resources.documentation}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal.title}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t.footer.legal.privacy}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t.footer.legal.terms}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Tour Button */}
      <button
        onClick={startTour}
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-[#EA9000] to-[#ff8800] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
        aria-label="Start Tour"
      >
        <Compass className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
      </button>
      
      {/* Chatbot for general questions on landing page */}
      <ChatbotWidget userRole="state_analyst" />
    </div>
  );
};

export default LandingPage;
