import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Brain, 
  Satellite, 
  ShieldCheck, 
  TrendingUp, 
  Users,
  ArrowDown
} from 'lucide-react';
import heroImage from '@/assets/hero-agriculture.jpg';

const HeroSection = () => {
  const stats = [
    { label: 'Farmers Served', value: '50K+', icon: Users },
    { label: 'Crop Yield Increase', value: '30%', icon: TrendingUp },
    { label: 'Insurance Claims', value: '₹2.5Cr', icon: ShieldCheck },
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Smart crop recommendations and disease diagnosis'
    },
    {
      icon: Satellite,
      title: 'Satellite Monitoring',
      description: 'Real-time weather and crop health monitoring'
    },
    {
      icon: ShieldCheck,
      title: 'Insurance & Finance',
      description: 'Easy access to crop insurance and microfinance'
    }
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 neon-glow">
            <Leaf className="w-4 h-4 mr-2" />
            AI-Powered Agricultural Guardian
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="hero-text">KrishakSure</span>
            <br />
            <span className="text-3xl md:text-4xl text-muted-foreground">
              Empowering Indian Farmers
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in">
            Transform your farming with AI-powered crop planning, real-time disease diagnosis, 
            satellite monitoring, and seamless access to insurance & microfinance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-lg px-8 py-6 neon-glow-strong">
                Start Farming Smart
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label} 
                  className="glass-card p-6 animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title} 
                  className="agri-card animate-fade-in"
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <ArrowDown className="w-6 h-6 mx-auto text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;