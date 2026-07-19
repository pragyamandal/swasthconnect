import React, { useState } from 'react';

const Triage: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('1-2 days');
  const [severity, setSeverity] = useState('Moderate');
  const [conditions, setConditions] = useState<string[]>(['Diabetes', 'Heart Disease']);
  const [medications, setMedications] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input is not supported in this browser.");
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; 
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setSymptoms(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return alert("Please describe your symptoms.");
    
    setIsSubmitting(true);
    
    // Simulate loading state for UI testing
    setTimeout(() => {
      console.log("🚀 Frontend State Captured:", {
        triageInput: {
          chiefComplaint: symptoms,
          duration,
          severity: severity.toUpperCase(),
          existingConditions: conditions,
          currentMedications: medications,
          inputLanguage: 'en'
        }
      });
      alert("Frontend state logged successfully! Open console to view payload.");
      setIsSubmitting(false);
    }, 800);
  };

  const toggleCondition = (condition: string) => {
    if (conditions.includes(condition)) {
      setConditions(conditions.filter(c => c !== condition));
    } else {
      setConditions([...conditions, condition]);
    }
  };

  const handleSeverityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val < 4) setSeverity('Mild');
    else if (val > 7) setSeverity('Severe');
    else setSeverity('Moderate');
  };

  return (
    <>
      <style>{`
        .glass-panel {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            background: #F4845F;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(244, 132, 95, 0.4);
            border: 2px solid white;
        }

        input[type="range"]::-moz-range-thumb {
            width: 24px;
            height: 24px;
            background: #F4845F;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(244, 132, 95, 0.4);
            border: 2px solid white;
        }
      `}</style>
      <div className="bg-background text-on-background antialiased selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col">
        {/* TopNavBar */}
        <nav className="bg-surface-container-lowest/80 dark:bg-surface-dim/80 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm shadow-[0px_4px_20px_rgba(26,109,181,0.08)]">
          <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-7xl mx-auto">
            <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
              SwasthConnect
            </div>
            <div className="hidden md:flex gap-6 items-center">
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-low dark:hover:bg-surface-container-high rounded-lg transition-all px-3 py-2 active:scale-95 duration-200" href="#">How it Works</a>
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-low dark:hover:bg-surface-container-high rounded-lg transition-all px-3 py-2 active:scale-95 duration-200" href="#">Features</a>
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-low dark:hover:bg-surface-container-high rounded-lg transition-all px-3 py-2 active:scale-95 duration-200" href="#">For Doctors</a>
            </div>
            <div className="flex gap-4 items-center">
              <button className="hidden md:block font-body-md text-body-md text-primary font-medium hover:bg-surface-container-low px-4 py-2 rounded-lg transition-all">Log In</button>
              <button className="font-label-bold text-label-bold bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-on-primary-fixed-variant transition-colors shadow-sm">Get Started</button>
            </div>
          </div>
        </nav>

        {/* Main Content Canvas */}
        <main className="flex-grow pt-[100px] pb-xl px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full flex flex-col gap-lg">
          {/* Animated Progress Bar */}
          <div className="w-full max-w-3xl mx-auto pt-8 pb-16 px-4 relative">
            {/* Background Track */}
            <div className="absolute top-[20px] left-12 right-12 h-2 bg-surface-variant rounded-full"></div>
            
            {/* Active Fill Track - Stops at center of Step 2 */}
            <div className="absolute top-[20px] left-12 w-[33.33%] h-2 bg-primary rounded-full shadow-sm transition-all duration-1000 ease-out"></div>
            
            <div className="flex justify-between w-full relative">
              {/* Steps */}
              {[
                { label: 'Book Doctor', active: true },
                { label: 'Health Info', active: true },
                { label: 'Consultation', active: false },
                { label: 'Prescription', active: false }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg z-10 transition-all duration-300 
                    ${i === 1 ? 'bg-primary text-white ring-4 ring-primary/20 scale-110' : 
                      i === 0 ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant border-2 border-surface-variant'}`}>
                    {i === 0 ? <span className="material-symbols-outlined text-[18px]">check</span> : i + 1}
                  </div>
                  <span className={`font-caption text-caption mt-3 whitespace-nowrap font-medium ${i === 1 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    Step {i + 1}: {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-lg">
            {/* Left Panel: Form (60%) */}
            <div className="w-full md:w-[60%] flex flex-col gap-md">
              {/* Header */}
              <div>
                <h1 className="font-display-hero-mobile md:font-display-hero text-display-hero-mobile md:text-display-hero text-on-background">Tell Us How You're Feeling</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">This helps your doctor prepare before the call. Takes 2 minutes.</p>
              </div>
              
              {/* Doctor Info Card */}
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-medical flex items-center gap-4 border border-surface-variant">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-variant">
                  <img className="w-full h-full object-cover" alt="A professional headshot of an Indian male doctor in a white coat with a stethoscope, warm lighting, approachable smile, blue background, high resolution, premium medical aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCevZa3HItO7KmBcl7Cim3s1vema_Q9EnXLSZnA3RlJIeD9j83hgpIVYh5Aa2-Aft9MuVczSinF2LAdNI5xs-bQH7JDSQ2RUkCdDnDigY9reINQVZl8DQnifYki0eDWZLfVQW9QFXozZutTae3ltNgGZb8dSpgC0QYTq-r85rghVYCTNwapQcWX_647RhZaqJlY5aBiGky7HMIDWayqYZfVZQdqCn3JzBrjRH3KQOF33dUwDfuh4_XdT5jjdnQ1TGvcFfoMqqthSo8b"/>
                </div>
                <div>
                  <h3 className="font-label-bold text-label-bold text-on-background">Dr. Sharma, Cardiologist</h3>
                  <div className="flex items-center gap-1 text-on-surface-variant font-caption text-caption mt-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    Appointment: 15 Nov, 3:00 PM
                  </div>
                </div>
              </div>

              {/* Main Form */}
              <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
                {/* Primary Symptoms */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-label-bold text-on-background">Primary Symptoms <span className="text-error">*</span></label>
                  <div className="relative">
                    <textarea 
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all shadow-sm resize-none pr-12" 
                      placeholder="Describe in your own words or speak in your language..." 
                      rows={4}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                    ></textarea>
                    <button 
                      className={`absolute top-3 right-3 transition-colors p-1 rounded-full hover:bg-surface-container-low ${isListening ? 'text-error' : 'text-primary hover:text-on-primary-fixed-variant'}`} 
                      type="button"
                      onClick={handleMicClick}
                    >
                      <span className="material-symbols-outlined">mic</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <button className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high rounded-full font-caption text-caption text-on-surface-variant border border-outline-variant transition-colors" type="button">EN</button>
                    <button className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high rounded-full font-caption text-caption text-on-surface-variant border border-outline-variant transition-colors" type="button">हि</button>
                    <button className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high rounded-full font-caption text-caption text-on-surface-variant border border-outline-variant transition-colors" type="button">ಕ</button>
                    <button className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high rounded-full font-caption text-caption text-on-surface-variant border border-outline-variant transition-colors" type="button">த</button>
                    <button className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high rounded-full font-caption text-caption text-on-surface-variant border border-outline-variant transition-colors" type="button">తె</button>
                    <button className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high rounded-full font-caption text-caption text-on-surface-variant border border-outline-variant transition-colors" type="button">বা</button>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-label-bold text-on-background">How long have you felt this way?</label>
                  <div className="flex flex-wrap gap-3">
                    <label className="cursor-pointer">
                      <input 
                        checked={duration === '1-2 days'} 
                        onChange={() => setDuration('1-2 days')}
                        className="peer sr-only" 
                        name="duration" 
                        type="radio"
                      />
                      <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-sm text-body-sm peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container transition-all shadow-sm">1-2 days</div>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        checked={duration === '3-5 days'} 
                        onChange={() => setDuration('3-5 days')}
                        className="peer sr-only" 
                        name="duration" 
                        type="radio"
                      />
                      <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-sm text-body-sm peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container transition-all shadow-sm">3-5 days</div>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        checked={duration === '1 week'} 
                        onChange={() => setDuration('1 week')}
                        className="peer sr-only" 
                        name="duration" 
                        type="radio"
                      />
                      <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-sm text-body-sm peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container transition-all shadow-sm">1 week</div>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        checked={duration === 'More than a week'} 
                        onChange={() => setDuration('More than a week')}
                        className="peer sr-only" 
                        name="duration" 
                        type="radio"
                      />
                      <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-sm text-body-sm peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container transition-all shadow-sm">More than a week</div>
                    </label>
                  </div>
                </div>

                {/* Severity */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-label-bold text-on-background flex justify-between">
                    Severity
                    <span className="text-brand-orange font-normal">{severity}</span>
                  </label>
                  <div className="px-2">
                    <input 
                      className="w-full h-2 bg-primary-fixed-dim rounded-lg appearance-none cursor-pointer" 
                      id="severity-slider" 
                      max="10" 
                      min="1" 
                      onChange={handleSeverityChange}
                      type="range" 
                      defaultValue="6"
                    />
                    <div className="flex justify-between mt-2 font-caption text-caption text-on-surface-variant">
                      <span>Mild</span>
                      <span>Severe</span>
                    </div>
                  </div>
                </div>

                {/* Existing Conditions */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-label-bold text-on-background">Existing Conditions</label>
                  <div className="flex flex-wrap gap-3">
                    <label className="cursor-pointer">
                      <input 
                        checked={conditions.includes('Diabetes')} 
                        onChange={() => toggleCondition('Diabetes')}
                        className="peer sr-only" 
                        type="checkbox"
                      />
                      <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-sm text-body-sm peer-checked:bg-secondary-container peer-checked:text-on-secondary-container peer-checked:border-secondary-container transition-all shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] hidden peer-checked:block">check</span> Diabetes
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        checked={conditions.includes('Hypertension')} 
                        onChange={() => toggleCondition('Hypertension')}
                        className="peer sr-only" 
                        type="checkbox"
                      />
                      <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-sm text-body-sm peer-checked:bg-secondary-container peer-checked:text-on-secondary-container peer-checked:border-secondary-container transition-all shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] hidden peer-checked:block">check</span> Hypertension
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        checked={conditions.includes('Heart Disease')} 
                        onChange={() => toggleCondition('Heart Disease')}
                        className="peer sr-only" 
                        type="checkbox"
                      />
                      <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-sm text-body-sm peer-checked:bg-secondary-container peer-checked:text-on-secondary-container peer-checked:border-secondary-container transition-all shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] hidden peer-checked:block">check</span> Heart Disease
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        checked={conditions.includes('Asthma')} 
                        onChange={() => toggleCondition('Asthma')}
                        className="peer sr-only" 
                        type="checkbox"
                      />
                      <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-sm text-body-sm peer-checked:bg-secondary-container peer-checked:text-on-secondary-container peer-checked:border-secondary-container transition-all shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] hidden peer-checked:block">check</span> Asthma
                      </div>
                    </label>
                    <button className="px-4 py-2 rounded-full border border-dashed border-outline text-on-surface-variant font-body-sm text-body-sm hover:bg-surface-container-low transition-all flex items-center gap-1" type="button">
                      <span className="material-symbols-outlined text-[16px]">add</span> Add Custom
                    </button>
                  </div>
                </div>

                {/* Current Medications */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-label-bold text-on-background">Current Medications</label>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all shadow-sm" 
                    placeholder="e.g. Metformin 500mg" 
                    type="text"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                  />
                </div>

                {/* Submit Area */}
                <div className="mt-6 flex flex-col gap-3">
                  <button 
                    className="w-full bg-brand-orange hover:bg-tertiary-container text-on-error py-4 rounded-xl font-headline-md text-[20px] font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <span className="material-symbols-outlined">auto_awesome</span>
                    {isSubmitting ? 'Generating...' : 'Generate My Health Summary'}
                  </button>
                  <p className="text-center font-caption text-caption text-on-surface-variant flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span> This summary is only shared with your doctor
                  </p>
                </div>
              </form>
            </div>

            {/* Right Panel: Info & Preview (40%) */}
            <div className="hidden md:flex w-[40%] flex-col gap-md">
              <div className="bg-brand-light-blue rounded-2xl p-6 h-full border border-inverse-primary/30 relative overflow-hidden flex flex-col">
                {/* Decorative Background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="font-headline-md text-headline-md text-on-primary-fixed-variant mb-6">Why We Ask This</h2>
                  <ul className="flex flex-col gap-4 mb-8">
                    <li className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined">robot_2</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface pt-2">AI generates a clinical summary for your doctor before the call</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined">timer</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface pt-2">Saves time — your doctor is already prepared when you join</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined">translate</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface pt-2">Write in any language — we'll translate for your doctor</p>
                    </li>
                  </ul>

                  {/* Doctor's Preview Card (Glassmorphism) */}
                  <div className="mt-auto">
                    <p className="font-label-bold text-label-bold text-on-surface-variant mb-2 ml-2">Doctor's Preview:</p>
                    <div className="glass-panel rounded-xl p-5 shadow-medical-hover relative transform hover:-translate-y-1 transition-transform duration-300">
                      <div className="flex justify-between items-start mb-4 border-b border-surface-variant pb-3">
                        <div>
                          <div className="font-caption text-caption text-outline">Chief Complaint</div>
                          <div className="font-label-bold text-body-md text-on-background">{symptoms || 'Chest pain'}</div>
                        </div>
                        <div className="bg-error-container text-on-error-container px-3 py-1 rounded-full font-caption text-[10px] font-bold tracking-wider">
                          PRIORITY
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="font-caption text-caption text-outline">Duration</div>
                          <div className="font-body-sm text-body-sm text-on-surface">{duration}</div>
                        </div>
                        <div>
                          <div className="font-caption text-caption text-outline">History</div>
                          <div className="font-body-sm text-body-sm text-on-surface">{conditions.length > 0 ? conditions.join(', ') : 'None'}</div>
                        </div>
                      </div>

                      <div className="bg-surface/50 rounded-lg p-3">
                        <div className="font-caption text-caption text-outline mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI Summary
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                          "Patient reports sharp chest pain radiating to the left arm, ongoing for 2 days. Known history of CAD and type 2 diabetes. Currently taking Metformin..."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-surface dark:bg-surface-dim border-t border-outline-variant dark:border-outline w-full py-lg mt-xl">
          <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-md max-w-7xl mx-auto">
            <div className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">
              SwasthConnect
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant opacity-80 hover:opacity-100 transition-opacity">
              © 2024 SwasthConnect. Made for rural India.
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all" href="#">Privacy Policy</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all" href="#">Terms of Service</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all" href="#">Legal Disclaimer</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all" href="#">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Triage;
