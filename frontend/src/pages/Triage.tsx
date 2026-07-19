import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const Triage: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('1-2 days');
  const [severity, setSeverity] = useState('Moderate');
  const [conditions, setConditions] = useState<string[]>(['Diabetes', 'Heart Disease']);
  const [medications, setMedications] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCondition, setCustomCondition] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [triageResult, setTriageResult] = useState<any>(null);
  
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [doctorName, setDoctorName] = useState('Dr. Sharma, Cardiologist');
  const [doctorDate, setDoctorDate] = useState('15 Nov, 3:00 PM');

  const languageMap: Record<string, string> = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'kn': 'kn-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN'
  };

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = localStorage.getItem('swasth_token');
        if (!token) return;
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const appointment = result.data.find((a: any) => a.id === appointmentId);
            if (appointment) {
              setDoctorName(`Dr. ${appointment.doctor?.name || 'Doctor'}, ${appointment.doctor?.doctor_profile?.specialisation || ''}`);
              const date = new Date(appointment.scheduled_at);
              setDoctorDate(date.toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
              }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch appointment:', error);
      }
    };
    
    fetchAppointment();
  }, [appointmentId]);

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input is not supported in this browser.");
    
    const recognition = new SpeechRecognition();
    recognition.lang = languageMap[selectedLanguage]; 
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return alert("Please describe your symptoms.");

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('swasth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/triage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId,
          chiefComplaint: symptoms,
          duration,
          severity: severity.toUpperCase(),
          existingConditions: conditions,
          currentMedications: medications,
          additionalNotes,
          inputLanguage: selectedLanguage
        })
      });

      if (!response.ok) throw new Error('Triage submission failed');

      const data = await response.json();
      setTriageResult(data.data);
    } catch (err) {
      alert('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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

  if (triageResult) {
    return (
      <div className="bg-surface min-h-screen flex flex-col antialiased">
        <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop">
          <div className="bg-surface-container-lowest rounded-xl w-full max-w-[600px] p-lg flex flex-col items-center text-center relative overflow-hidden"
            style={{ boxShadow: '0px 4px 20px rgba(26, 109, 181, 0.08)' }}>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
            <div className="mb-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/10 rounded-full mb-md">
                <span className="material-symbols-outlined text-secondary text-[40px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Health Summary Sent</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Your details have been shared with {doctorName}.
              </p>
            </div>
            <div className="w-full bg-surface-container-low rounded-lg p-md text-left mb-lg border border-outline-variant/20 shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg
                ${triageResult.urgency === 'EMERGENCY' ? 'bg-error' :
                  triageResult.urgency === 'PRIORITY' ? 'bg-tertiary' : 'bg-secondary'}`}></div>
              <div className="flex justify-between items-start mb-sm">
                <h2 className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider">
                  What your doctor will see
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full font-label-bold text-label-bold
                  ${triageResult.urgency === 'EMERGENCY' ? 'bg-error text-on-error' :
                    triageResult.urgency === 'PRIORITY' ? 'bg-tertiary text-on-tertiary' :
                    'bg-secondary text-on-secondary'}`}>
                  <span className="material-symbols-outlined text-[16px] mr-1">priority_high</span>
                  {triageResult.urgency}
                </span>
              </div>
              <div className="space-y-sm">
                <div>
                  <span className="font-caption text-caption text-on-surface-variant block mb-1">Chief Complaint</span>
                  <p className="font-body-md text-body-md text-on-surface">{triageResult.chief_complaint}</p>
                </div>
                <div>
                  <span className="font-caption text-caption text-on-surface-variant block mb-1">Duration</span>
                  <p className="font-body-md text-body-md text-on-surface">{triageResult.raw_symptoms?.duration}</p>
                </div>
                <div className="bg-surface-container rounded-md p-sm mt-md">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                    <span className="font-label-bold text-label-bold text-primary">AI Summary</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface italic">"{triageResult.ai_summary}"</p>
                </div>
              </div>
            </div>
            <div className="w-full text-left mb-xl">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-md">What happens next?</h3>
              <ul className="space-y-sm">
                <li className="flex items-start gap-sm">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center mt-1">
                    <span className="font-label-bold text-label-bold text-on-primary-container">1</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">{doctorName} will review your summary before the call.</p>
                </li>
                <li className="flex items-start gap-sm">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center mt-1">
                    <span className="font-label-bold text-label-bold text-on-primary-container">2</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">Join the Waiting Room on the day of your appointment.</p>
                </li>
              </ul>
            </div>
            <div className="w-full flex flex-col sm:flex-row gap-sm justify-center items-center">
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3 rounded-lg font-label-bold text-label-bold shadow-md hover:bg-on-primary-fixed-variant hover:shadow-lg transition-all duration-200"
              >
                Go to Dashboard
              </button>
              <button disabled
                className="w-full sm:w-auto px-8 py-3 rounded-lg font-label-bold text-label-bold text-outline cursor-not-allowed flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Join Waiting Room
              </button>
            </div>
            <p className="font-caption text-caption text-on-surface-variant mt-sm text-center">
              The waiting room link will become active on the day of your appointment.
            </p>
          </div>
        </main>
      </div>
    );
  }

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
                  <h3 className="font-label-bold text-label-bold text-on-background">{doctorName}</h3>
                  <div className="flex items-center gap-1 text-on-surface-variant font-caption text-caption mt-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    Appointment: {doctorDate}
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
                    {Object.keys(languageMap).map(lang => {
                      const labels: Record<string, string> = { en: 'EN', hi: 'हि', kn: 'ಕ', ta: 'த', te: 'తె', bn: 'বা' };
                      return (
                        <button 
                          key={lang}
                          className={`px-3 py-1 rounded-full font-caption text-caption border border-outline-variant transition-colors ${selectedLanguage === lang ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant'}`} 
                          type="button"
                          onClick={() => setSelectedLanguage(lang)}
                        >
                          {labels[lang]}
                        </button>
                      );
                    })}
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
                    {['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma'].map(condition => (
                      <label key={condition} className="cursor-pointer">
                        <input
                          checked={conditions.includes(condition)}
                          onChange={() => toggleCondition(condition)}
                          className="peer sr-only"
                          type="checkbox"
                        />
                        <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-sm text-body-sm peer-checked:bg-secondary-container peer-checked:text-on-secondary-container peer-checked:border-secondary-container transition-all shadow-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] hidden peer-checked:block">check</span>
                          {condition}
                        </div>
                      </label>
                    ))}

                    {conditions
                      .filter(c => !['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma'].includes(c))
                      .map(custom => (
                        <div key={custom}
                          className="px-4 py-2 rounded-full border bg-secondary-container text-on-secondary-container border-secondary-container font-body-sm text-body-sm flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                          {custom}
                          <button type="button" onClick={() => toggleCondition(custom)}
                            className="ml-1 hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))
                    }

                    {showCustomInput ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={customCondition}
                          onChange={(e) => setCustomCondition(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = customCondition.trim();
                              if (trimmed && !conditions.includes(trimmed)) setConditions([...conditions, trimmed]);
                              setCustomCondition('');
                              setShowCustomInput(false);
                            }
                            if (e.key === 'Escape') {
                              setCustomCondition('');
                              setShowCustomInput(false);
                            }
                          }}
                          placeholder="Type condition..."
                          className="px-3 py-2 rounded-full border border-primary text-on-background font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim w-36 shadow-sm"
                        />
                        <button type="button"
                          onClick={() => {
                            const trimmed = customCondition.trim();
                            if (trimmed && !conditions.includes(trimmed)) setConditions([...conditions, trimmed]);
                            setCustomCondition('');
                            setShowCustomInput(false);
                          }}
                          className="px-3 py-2 rounded-full bg-primary text-on-primary font-body-sm text-body-sm shadow-sm hover:bg-on-primary-fixed-variant transition-colors">
                          Add
                        </button>
                        <button type="button"
                          onClick={() => { setCustomCondition(''); setShowCustomInput(false); }}
                          className="px-3 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-sm text-body-sm hover:bg-surface-container-low transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setShowCustomInput(true)}
                        className="px-4 py-2 rounded-full border border-dashed border-outline text-on-surface-variant font-body-sm text-body-sm hover:bg-surface-container-low transition-all flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">add</span> Add Custom
                      </button>
                    )}
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

                {/* Additional Notes */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-label-bold text-on-background">
                    Additional Notes 
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-normal ml-2">(optional)</span>
                  </label>
                  <textarea
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all shadow-sm resize-none"
                    placeholder="e.g. Pain gets worse when climbing stairs, symptoms started after a meal..."
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                </div>

                {/* Submit Area */}
                <div className="mt-6 flex flex-col gap-3">
                  <button 
                    className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary py-4 rounded-xl font-headline-md text-[20px] font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
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
