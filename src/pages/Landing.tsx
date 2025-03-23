
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-reptile-100 to-white">
      {/* Hero section */}
      <header className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-reptile-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-reptile-900">ReptileNurture</h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-reptile-800 hover:text-reptile-600 transition">Features</a>
            <a href="#how-it-works" className="text-reptile-800 hover:text-reptile-600 transition">How it works</a>
            <a href="#testimonials" className="text-reptile-800 hover:text-reptile-600 transition">Testimonials</a>
            <Link to="/login">
              <Button variant="outline" className="border-reptile-500 text-reptile-700 hover:bg-reptile-100">
                Sign in
              </Button>
            </Link>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="text-reptile-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
                <line x1="4" x2="20" y1="12" y2="12"/>
                <line x1="4" x2="20" y1="6" y2="6"/>
                <line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-reptile-900 tracking-tight">
              Create the perfect habitat for your reptiles
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-reptile-700 max-w-3xl mx-auto">
              Monitor and control your reptile enclosures with precision from anywhere in the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-reptile-900">
              Everything you need for perfect reptile care
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="glass-card border-0">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-reptile-100 text-reptile-700 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thermometer">
                      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-reptile-900">Temperature Monitoring</h3>
                  <p className="text-muted-foreground">
                    Real-time temperature tracking with historical data and alerts for any deviations.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-0">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-reptile-100 text-reptile-700 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-droplets">
                      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
                      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-reptile-900">Humidity Control</h3>
                  <p className="text-muted-foreground">
                    Precise humidity management customized for each species and environment.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-0">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-reptile-100 text-reptile-700 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                      <line x1="16" x2="16" y1="2" y2="6"/>
                      <line x1="8" x2="8" y1="2" y2="6"/>
                      <line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-reptile-900">Feeding Schedules</h3>
                  <p className="text-muted-foreground">
                    Customize and track feeding routines with reminders and history.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-reptile-900">
              How ReptileNurture works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-reptile-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-semibold">1</div>
                <h3 className="text-xl font-semibold mb-2 text-reptile-900">Connect your devices</h3>
                <p className="text-muted-foreground">
                  Easily connect your SensorPush and other IoT devices to the platform.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-reptile-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-semibold">2</div>
                <h3 className="text-xl font-semibold mb-2 text-reptile-900">Customize your setup</h3>
                <p className="text-muted-foreground">
                  Set your preferences for each enclosure based on species needs.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-reptile-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-semibold">3</div>
                <h3 className="text-xl font-semibold mb-2 text-reptile-900">Monitor and control</h3>
                <p className="text-muted-foreground">
                  Get real-time data and alerts while controlling your environment remotely.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section id="testimonials" className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-reptile-900">
              What our customers say
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="glass-card border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-sand-300 flex items-center justify-center mr-4">JD</div>
                    <div>
                      <h4 className="font-semibold text-reptile-900">Jane Doe</h4>
                      <p className="text-sm text-muted-foreground">Reptile Hobbyist</p>
                    </div>
                  </div>
                  <p className="italic text-muted-foreground">
                    "This system has completely transformed how I care for my reptiles. I can now monitor everything from anywhere and feel confident my pets are always in the perfect environment."
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-sand-300 flex items-center justify-center mr-4">MS</div>
                    <div>
                      <h4 className="font-semibold text-reptile-900">Mike Smith</h4>
                      <p className="text-sm text-muted-foreground">Professional Breeder</p>
                    </div>
                  </div>
                  <p className="italic text-muted-foreground">
                    "As a professional breeder, precision is everything. This system gives me the control and data I need to maintain perfect conditions and keep extensive records."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 bg-reptile-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to elevate your reptile care?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of reptile enthusiasts who have transformed their husbandry with our smart system.
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-reptile-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-reptile-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-reptile-900">ReptileNurture</h3>
              </div>
              <p className="text-sm text-reptile-700">
                Smart technology for reptile care professionals and enthusiasts.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-reptile-900">Product</h4>
              <ul className="space-y-2 text-sm text-reptile-700">
                <li><a href="#" className="hover:text-reptile-500">Features</a></li>
                <li><a href="#" className="hover:text-reptile-500">Pricing</a></li>
                <li><a href="#" className="hover:text-reptile-500">Testimonials</a></li>
                <li><a href="#" className="hover:text-reptile-500">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-reptile-900">Company</h4>
              <ul className="space-y-2 text-sm text-reptile-700">
                <li><a href="#" className="hover:text-reptile-500">About</a></li>
                <li><a href="#" className="hover:text-reptile-500">Blog</a></li>
                <li><a href="#" className="hover:text-reptile-500">Careers</a></li>
                <li><a href="#" className="hover:text-reptile-500">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-reptile-900">Legal</h4>
              <ul className="space-y-2 text-sm text-reptile-700">
                <li><a href="#" className="hover:text-reptile-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-reptile-500">Terms of Service</a></li>
                <li><a href="#" className="hover:text-reptile-500">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-reptile-200 text-center text-sm text-reptile-700">
            <p>© {new Date().getFullYear()} ReptileNurture. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
