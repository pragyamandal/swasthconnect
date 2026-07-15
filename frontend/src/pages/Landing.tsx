import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 shadow-[0px_4px_20px_rgba(26,109,181,0.08)]">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-md max-w-7xl mx-auto">
          {/* Brand */}
          <Link className="flex items-center gap-2 hover:opacity-80 transition-all duration-300" to="/">
            <img src="/logo.jpg" alt="SwasthConnect Logo" className="h-10 md:h-12 w-auto object-contain mix-blend-multiply" />
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary hidden sm:block">SwasthConnect</span>
          </Link>
          {/* Navigation Links */}
          <ul className="hidden md:flex gap-8 font-body-md text-body-md">
            <li><a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors" href="#how-it-works">How it Works</a></li>
            <li><a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors" href="#features">Features</a></li>
            <li><a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors" href="#for-doctors">For Doctors</a></li>
          </ul>
          {/* Actions */}
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
              <Link className="font-label-bold text-label-bold text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-container/10 transition-colors block" to="/login">Log In</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
              <Link className="font-label-bold text-label-bold text-white bg-hero-orange px-6 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-[0px_4px_20px_rgba(244,132,95,0.3)] block" to="/register/patient">Get Started</Link>
            </motion.div>
          </div>
        </div>
      </nav>
      <main className="pt-24">
        {/* HERO SECTION */}
        <section className="relative px-margin-mobile md:px-margin-desktop py-xl max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center">
            {/* Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
              className="z-10 flex flex-col gap-md"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/10 text-primary-container rounded-full w-fit">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span className="font-caption text-caption">Trusted by 10,000+ Doctors</span>
              </div>
              <h1 className="font-display-hero-mobile text-display-hero-mobile md:font-display-hero md:text-display-hero text-on-surface">
                Quality Healthcare, <br/><span className="text-primary">Wherever You Are</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Connect with verified doctors from home. Get AI-powered triage, video consultations, and prescriptions — in your own language.
              </p>
              <div className="flex flex-wrap gap-4 mt-sm">
                <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                  <Link className="inline-flex items-center justify-center font-label-bold text-label-bold text-white bg-hero-orange px-8 py-4 rounded-lg hover:opacity-90 transition-opacity shadow-[0px_4px_20px_rgba(244,132,95,0.3)] block" to="/register/patient">
                    Consult a Doctor
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                  <Link className="inline-flex items-center justify-center font-label-bold text-label-bold text-primary border-2 border-primary px-8 py-4 rounded-lg hover:bg-primary-container/10 transition-colors block" to="/register/doctor">
                    Join as Doctor
                  </Link>
                </motion.div>
              </div>
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-lg border-t border-outline-variant/30 pt-md">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined">lock</span>
                  <span className="font-body-sm text-body-sm">Secure &amp; Private</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined">language</span>
                  <span className="font-body-sm text-body-sm">6 Regional Languages</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined">bolt</span>
                  <span className="font-body-sm text-body-sm">AI-Powered Triage</span>
                </div>
              </div>
            </motion.div>
            {/* Illustration */}
            <div className="relative w-full h-[500px] flex items-center justify-center mt-lg lg:mt-0">
              <div className="absolute inset-0 blob-bg rounded-full scale-150 transform -translate-y-10"></div>
              <motion.img 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                alt="Doctor Consultation Illustration" 
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgNXXdSDz-9mcLBfe6CAgIIfuLfUuwvk3583LmqVT2_yaLpo8BVd8DkjWUIyuuKIPHuY4zzC1SoMz3FNORpwDCzc_pR9NRclnw7TIlm78nOU6gx1DCk5dpys8tS0thv8uxQRdVJsBWD-sh-iVyBBzkokqF5gSvIonEFOw9C7g4CEBO4-5MWDSHoNXlXInxbTMkNH4H5AWy-k6_2U8W-ptua3bgkpULYhC8TIULzrdWdu6PF4SJvTMXRZDDkaHsHdR6g0VC6dTNohF7"
              />
            </div>
          </div>
        </section>
        {/* STATS BAR */}
        <section className="bg-primary text-white py-lg">
          <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
              <motion.div 
                initial={{ opacity: 0, x: -50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                className="py-4 md:py-0 px-4"
              >
                <span className="material-symbols-outlined text-4xl mb-2">translate</span>
                <h3 className="font-headline-md text-headline-md mb-1">5 Regional Languages</h3>
                <p className="font-body-sm text-body-sm text-white/80">Support for diverse communities</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className="py-4 md:py-0 px-4"
              >
                <span className="material-symbols-outlined text-4xl mb-2">smart_toy</span>
                <h3 className="font-headline-md text-headline-md mb-1">AI Triage Before Every Call</h3>
                <p className="font-body-sm text-body-sm text-white/80">Faster, smarter diagnoses</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                className="py-4 md:py-0 px-4"
              >
                <span className="material-symbols-outlined text-4xl mb-2">encrypted</span>
                <h3 className="font-headline-md text-headline-md mb-1">End-to-End Encrypted Video</h3>
                <p className="font-body-sm text-body-sm text-white/80">Your privacy is our priority</p>
              </motion.div>
            </div>
          </div>
        </section>
        {/* HOW IT WORKS */}
        <section className="py-xl bg-surface px-margin-mobile md:px-margin-desktop" id="how-it-works">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">From Symptoms to Prescription in Minutes</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">A seamless, guided journey for better health outcomes.</p>
            </div>
            <div className="relative">
              {/* Dotted Line (Desktop only) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-[2px] dotted-line z-0"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {/* Step 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ duration: 0.5, delay: 0 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center shadow-[0px_4px_20px_rgba(26,109,181,0.08)] mb-6 border-4 border-white">
                    <span className="material-symbols-outlined text-4xl text-primary">mic</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Describe Symptoms</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Use voice input in your local language.</p>
                </motion.div>
                {/* Step 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center shadow-[0px_4px_20px_rgba(26,109,181,0.08)] mb-6 border-4 border-white">
                    <span className="material-symbols-outlined text-4xl text-primary">robot_2</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">AI Recommends Specialist</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Smart matching based on symptoms.</p>
                </motion.div>
                {/* Step 3 */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center shadow-[0px_4px_20px_rgba(26,109,181,0.08)] mb-6 border-4 border-white">
                    <span className="material-symbols-outlined text-4xl text-primary">videocam</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Video Consultation</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Connect with a verified doctor securely.</p>
                </motion.div>
                {/* Step 4 */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center shadow-[0px_4px_20px_rgba(26,109,181,0.08)] mb-6 border-4 border-white">
                    <span className="material-symbols-outlined text-4xl text-primary">prescriptions</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Prescription Delivered</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Instant digital prescription to your app.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        {/* FEATURES SECTION */}
        <section className="py-xl bg-surface-container-low px-margin-mobile md:px-margin-desktop" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Built to Fix What Existing Platforms Get Wrong</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Feature 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 0.5, delay: 0 }}
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
                className="glass-panel p-md rounded-xl shadow-[0px_4px_20px_rgba(26,109,181,0.08)] border border-white/50 flex flex-col gap-4"
              >
                <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center text-primary mb-2">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">AI Pre-Consultation Triage</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Doctor knows your symptoms before the call starts, saving time and improving accuracy.</p>
              </motion.div>
              {/* Feature 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 0.5, delay: 0.15 }}
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
                className="glass-panel p-md rounded-xl shadow-[0px_4px_20px_rgba(26,109,181,0.08)] border border-white/50 flex flex-col gap-4"
              >
                <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center text-primary mb-2">
                  <span className="material-symbols-outlined">record_voice_over</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Regional Language Support</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Full app in Hindi, Kannada, Tamil, Telugu, Bengali. Seamless voice input available.</p>
              </motion.div>
              {/* Feature 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
                className="glass-panel p-md rounded-xl shadow-[0px_4px_20px_rgba(26,109,181,0.08)] border border-white/50 flex flex-col gap-4"
              >
                <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center text-primary mb-2">
                  <span className="material-symbols-outlined">manage_search</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Smart Doctor Matching</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Describe symptoms in plain language — AI automatically recommends the right specialist.</p>
              </motion.div>
            </div>
          </div>
        </section>
        {/* FOR DOCTORS SECTION */}
        <section className="py-xl bg-surface px-margin-mobile md:px-margin-desktop overflow-hidden" id="for-doctors">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
              {/* Illustration Left */}
              <div className="order-2 lg:order-1 relative flex justify-center items-center h-[500px]">
                <div className="absolute inset-0 bg-secondary-fixed/20 rounded-full blur-3xl scale-125"></div>
                <img alt="Doctor Dashboard Mockup" className="relative z-10 w-full h-full object-contain drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD43ab1jGs7SQ2ZYx13XMDs56dScpnjKh1Sjdj8Iv6izZiWiW6EWNTjy80YSVj2KQWvcF-xhycGvBstiod483EQ1ti9UXx0IcMhcp3ol8kuKYQhsP5-2qcXSmrLwrh8VbH_Ux3TJrbrs3UbV42o83mNdPUHQptap9WChtQdR052FtHbhMYToTmQG-ctqamgxsA75fOpn9mZBBk8KsevYjD70qjZl17k8YjxckvhA0udr-mfORzIUTRLlV8AUEU1LsipNW5VxpicLBlR"/>
              </div>
              {/* Content Right */}
              <div className="order-1 lg:order-2 flex flex-col gap-md">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Built for Doctors Too</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">A streamlined dashboard designed to reduce administrative burden and focus on patient care.</p>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary mt-1">summarize</span>
                    <div>
                      <h4 className="font-headline-md text-headline-md text-on-surface text-[18px]">AI Patient Summaries</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Instant triage notes before the consultation begins.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary mt-1">queue</span>
                    <div>
                      <h4 className="font-headline-md text-headline-md text-on-surface text-[18px]">Real-time Queue Management</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Efficiently handle patient flow and waiting times.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary mt-1">warning</span>
                    <div>
                      <h4 className="font-headline-md text-headline-md text-on-surface text-[18px]">Smart Condition Alerts</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Automated highlighting of critical symptoms or interactions.</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-sm">
                  <Link className="inline-flex items-center gap-2 font-label-bold text-label-bold text-primary hover:text-primary-container transition-colors" to="/register/doctor">
                    Explore Doctor Features <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="w-full bg-[#0F2D56] text-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-lg space-y-md md:space-y-0 max-w-7xl mx-auto">
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="SwasthConnect Logo" className="h-8 w-auto object-contain brightness-0 invert" />
              <span className="font-headline-sm text-headline-sm font-bold">SwasthConnect</span>
            </div>
            <p className="font-caption text-caption text-surface-variant/70">Quality Healthcare, Wherever You Are</p>
            <p className="font-caption text-caption text-surface-variant/70 mt-4">© 2024 SwasthConnect. Made for rural India 🇮🇳</p>
          </div>
          {/* Links */}
          <ul className="flex flex-wrap justify-center gap-6 font-caption text-caption">
            <li><a className="text-surface-variant/70 hover:text-secondary-fixed transition-colors" href="#">Privacy Policy</a></li>
            <li><a className="text-surface-variant/70 hover:text-secondary-fixed transition-colors" href="#">Terms of Service</a></li>
            <li><a className="text-surface-variant/70 hover:text-secondary-fixed transition-colors" href="#">Cookie Policy</a></li>
            <li><a className="text-surface-variant/70 hover:text-secondary-fixed transition-colors" href="#">Contact Support</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
