import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Doctor {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  specialization: string;
  experience: string;
  rating: number;
  consultations: number;
  nextSlot: string;
  fee: number;
}

const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Ramesh Sharma",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD5FhilzMbqehSDtSVZMX2F0C9df8BG518sMmKED7sX7tML_WVabp2ODdxYI1FG23zEgrTB7MFDpncPioDDIVotAqKLEaV85LQo1nmGVmKUNw8NW0nkejDcPj7fPS189kpH_d9ePUYd-zk3fPrpVUTNf062Mmc8S6dNKr3XEEfFYz-BWfposbLbETeLHENtmxXRnTirH2ju8U1xCHg5db0GBzL-fPdzyYfFVxBICb0If-oopt4nhT2rOneAGuOkt3IaDp333BsY0aw",
    imageAlt: "A professional headshot of a middle-aged male doctor of Indian descent, wearing a white coat and stethoscope, smiling warmly against a clinical light blue background. High-key lighting, modern corporate medical style.",
    specialization: "Cardiologist",
    experience: "12 years experience",
    rating: 4.8,
    consultations: 342,
    nextSlot: "Today 2:30 PM",
    fee: 400
  },
  {
    id: "2",
    name: "Dr. Ananya Iyer",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDb5AkXStvMsTDlk0pwMJiLEl6R_Eq-X6xf1vE9VUNdGFtRD67x6Yx35FkA7SN1N81YzxiV6loyBGox36HT149-fxYNepMnWDPro71My2ORDenu6Qqftyb0VPkTQo8f5x2HVaAS-iuW0oW78ncKesD4--6jdfCBIaseU18j-OCau3uWemSYIzPQTBrHk3Jxj3dneJvk7DVyxWmUrxOGYlIIVwWfaInJTPHarva6CkvX3_KSL7yiA-Dj06jRpn-Aleiy5dBB7qhIUr5q",
    imageAlt: "A professional headshot of a younger female doctor of Indian descent, wearing a white coat and glasses, looking confident and approachable against a clean, light-filled clinical background. Modern corporate medical style.",
    specialization: "Cardiologist",
    experience: "8 years experience",
    rating: 4.2,
    consultations: 124,
    nextSlot: "Today 3:00 PM",
    fee: 300
  }
];

export default function FindDoctor() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{specialisation: string, reason: string} | null>(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('All Specialisations');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('swasth_token');
        const response = await fetch('http://localhost:3001/api/doctors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          console.log("🏥 Raw Doctors List from Backend:", data);
          
          // Unwrap the data if the backend nested it inside a 'data' or 'doctors' key
          const doctorsArray = data.data || data.doctors || (Array.isArray(data) ? data : []);
          setDoctors(doctorsArray);
        } else {
          console.error("Failed to fetch doctors, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleListen = () => {
    // @ts-ignore - SpeechRecognition is not fully typed in standard React setups
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Defaulting to Indian English to handle mixed keywords
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSearch = async () => {
    if (!symptoms.trim()) return;
    
    setIsMatching(true);
    setMatchResult(null);
    
    try {
      const token = localStorage.getItem('swasth_token');
      const response = await fetch('http://localhost:3001/api/doctors/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symptoms })
      });
      
      if (response.ok) {
        const responseJson = await response.json();
        console.log("🔥 Raw Data from Llama 70B Backend:", responseJson);
        
        // Unwrap the 'data' payload if the backend nested it
        const payload = responseJson.data || responseJson;

        // Attempt to grab the keys from the unwrapped payload
        const spec = payload.specialisation || payload.specialty || payload.Specialisation;
        const rsn = payload.reason || payload.explanation || payload.Reason;

        if (spec) {
          setMatchResult({
            specialisation: spec,
            reason: rsn || "Please consult a specialist for these symptoms."
          });
          setSelectedSpeciality(spec); 
        } else {
          console.error("❌ Still missing 'specialisation' key after unwrapping.", responseJson);
          alert("The model didn't return the expected JSON format. Open your browser console to see what it sent!");
        }
      }
    } catch (error) {
      console.error("AI Match failed:", error);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center h-20 px-margin-desktop max-w-7xl mx-auto">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed" data-icon="health_and_safety" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">SwasthConnect</span>
          </div>
          <div className="hidden md:flex items-center gap-md font-body-md text-body-md">
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors hover:bg-primary-container/10 dark:hover:bg-primary-container/20 rounded-lg px-sm py-xs transition-all duration-300 ease-in-out hover:scale-105 active:scale-95" href="#">How it Works</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors hover:bg-primary-container/10 dark:hover:bg-primary-container/20 rounded-lg px-sm py-xs transition-all duration-300 ease-in-out hover:scale-105 active:scale-95" href="#">Features</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors hover:bg-primary-container/10 dark:hover:bg-primary-container/20 rounded-lg px-sm py-xs transition-all duration-300 ease-in-out hover:scale-105 active:scale-95" href="#">For Doctors</a>
          </div>
          <div className="flex items-center gap-sm">
            <button className="hidden md:block text-primary dark:text-primary-fixed font-label-bold text-label-bold hover:bg-primary-container/10 dark:hover:bg-primary-container/20 rounded-lg px-sm py-xs transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">Patient Login</button>
            <button className="bg-primary text-on-primary font-label-bold text-label-bold rounded-lg px-sm py-xs shadow-soft-medical transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">Join as Doctor</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-xl pb-xl px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full mt-20">
        {/* Top Search Section */}
        <section className="bg-surface-container-lowest rounded-xl shadow-soft-medical overflow-hidden relative mb-lg">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary"></div>
          <div className="p-lg text-center max-w-3xl mx-auto">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">Find the Right Doctor for You</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">Describe your symptoms and we'll recommend the right specialist</p>
            <div className="relative w-full mb-md group">
              <input
                className="w-full bg-surface py-sm px-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-container/30 transition-all text-body-md font-body-md placeholder:text-outline shadow-sm h-14"
                placeholder="e.g. I have chest pain and shortness of breath since 2 days..."
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
            <div className="flex flex-col items-center justify-center mb-lg">
              <button 
                onClick={handleListen}
                className={`transition-colors flex items-center justify-center w-16 h-16 rounded-full relative group mb-sm ${isListening ? 'text-red-500 bg-red-50' : 'text-brand-orange hover:text-brand-orange/80 hover:bg-brand-orange/10'}`}
              >
                <div className={`absolute inset-0 rounded-full border-2 ${isListening ? 'border-red-500 opacity-100 pulse-ring' : 'border-brand-orange opacity-0 group-hover:opacity-100 transition-opacity'}`}></div>
                <span className="material-symbols-outlined z-10 text-3xl" style={{ fontVariationSettings: "'FILL' 1", fontSize: "32px" }}>mic</span>
              </button>
              <div className="flex items-center justify-center gap-xs text-on-surface-variant font-caption text-caption">
                <span className="material-symbols-outlined text-outline" data-icon="translate" style={{ fontSize: '16px' }}>translate</span>
                <span>Speak in Hindi, Kannada, Tamil, Telugu or Bengali — we understand all</span>
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={isMatching}
              className="w-full bg-tertiary-container text-on-tertiary-container font-label-bold text-label-bold py-sm px-lg rounded-lg shadow-soft-medical hover:bg-tertiary transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isMatching ? 'Analyzing...' : 'Find My Doctor'}
            </button>
          </div>
        </section>

        {/* Conditional Rendering based on recommendation */}
        {matchResult && matchResult.specialisation && (
          <div className="bg-primary-fixed/30 border border-primary-fixed-dim rounded-xl p-md mb-lg flex gap-4 animate-fade-in">
            <div className="text-primary mt-1">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>
            <div>
              <h3 className="font-label-bold text-label-bold text-on-surface mb-1">
                Suggested Specialist: {matchResult.specialisation}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {matchResult.reason}
              </p>
            </div>
          </div>
        )}

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-sm mb-lg">
          <div className="flex gap-sm">
            <select 
              className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl pl-4 pr-10 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors appearance-none" 
              value={selectedSpeciality}
              onChange={(e) => setSelectedSpeciality(e.target.value)}
            >
              <option>All Specialisations</option>
              <option>Cardiologist</option>
              <option>Dermatologist</option>
              <option>Endocrinologist</option>
              <option>Gastroenterologist</option>
              <option>General Physician</option>
              <option>Gynecologist</option>
              <option>Neurologist</option>
              <option>Oncologist</option>
              <option>Orthopedic Surgeon</option>
              <option>Pediatrician</option>
              <option>Psychiatrist</option>
              <option>Pulmonologist</option>
              <option>Urologist</option>
            </select>
            <select className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl pl-4 pr-10 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors appearance-none" defaultValue="Any Experience">
              <option>Any Experience</option>
              <option>5+ Years</option>
              <option>10+ Years</option>
              <option>15+ Years</option>
              <option>20+ Years</option>
              <option>25+ Years</option>
            </select>
          </div>
          <div className="flex items-center gap-xs font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Sort by:</span>
            <select className="bg-transparent border-none font-label-bold text-primary cursor-pointer focus:ring-0 py-1 pl-2 pr-8 hover:bg-primary-container/10 rounded-lg transition-colors appearance-none text-right">
              <option>Quality Score</option>
              <option>Earliest Availability</option>
              <option>Experience (High to Low)</option>
              <option>Consultation Fee (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {isLoadingDoctors ? (
            <div className="col-span-1 md:col-span-2 p-md text-center text-on-surface-variant animate-pulse">Loading doctors...</div>
          ) : doctors.filter(d => selectedSpeciality === 'All Specialisations' || d.specialization === selectedSpeciality || d.specialisation === selectedSpeciality).length > 0 ? (
            doctors.filter(d => selectedSpeciality === 'All Specialisations' || d.specialization === selectedSpeciality || d.specialisation === selectedSpeciality).map((doctor) => (
              <div key={doctor.id || doctor._id} className="bg-surface-container-lowest rounded-xl shadow-soft-medical overflow-hidden hover:-translate-y-1 transition-transform duration-300 relative group">
                <div className="h-[60px] bg-gradient-to-r from-primary-fixed to-primary w-full relative"></div>
                <div className="p-md relative pt-12">
                  <div className="absolute -top-10 left-md w-20 h-20 rounded-full border-4 border-surface-container-lowest overflow-hidden bg-surface-container">
                    <img alt={doctor.name} className="w-full h-full object-cover" data-alt={doctor.imageAlt || "Doctor Profile"} src={doctor.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCD5FhilzMbqehSDtSVZMX2F0C9df8BG518sMmKED7sX7tML_WVabp2ODdxYI1FG23zEgrTB7MFDpncPioDDIVotAqKLEaV85LQo1nmGVmKUNw8NW0nkejDcPj7fPS189kpH_d9ePUYd-zk3fPrpVUTNf062Mmc8S6dNKr3XEEfFYz-BWfposbLbETeLHENtmxXRnTirH2ju8U1xCHg5db0GBzL-fPdzyYfFVxBICb0If-oopt4nhT2rOneAGuOkt3IaDp333BsY0aw"} />
                  </div>
                  <div className="flex justify-between items-start mb-sm">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
                        {doctor.name}
                        <span className="material-symbols-outlined text-primary text-sm" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>verified</span>
                      </h3>
                      <span className="inline-block bg-secondary-fixed text-on-secondary-fixed-variant font-caption text-caption px-xs py-[2px] rounded-full mt-xs">{doctor.specialization || doctor.specialisation}</span>
                    </div>
                  </div>
                  <div className="space-y-sm mb-md text-on-surface-variant font-body-sm text-body-sm">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-outline" data-icon="work_history" style={{ fontSize: '18px' }}>work_history</span>
                      <span>{doctor.experience_years ? `${doctor.experience_years} Years` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-tertiary-container" data-icon="star" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>star</span>
                      <span className="font-label-bold text-on-surface">{doctor.avg_overall ? doctor.avg_overall : 'N/A'}</span>
                      <span className="text-outline text-caption">({doctor.total_ratings || 0} consultations)</span>
                    </div>
                    <div className="flex items-center gap-xs text-secondary">
                      <span className="material-symbols-outlined" data-icon="event_available" style={{ fontSize: '18px' }}>event_available</span>
                      <span className="font-label-bold">Next slot: {doctor.next_available_slot ? new Date(doctor.next_available_slot).toLocaleString() : 'Contact for slot'}</span>
                    </div>
                    <div className="flex items-center gap-xs font-label-bold text-on-surface">
                      <span className="material-symbols-outlined text-outline" data-icon="payments" style={{ fontSize: '18px' }}>payments</span>
                      <span>₹ {doctor.consultation_fee ? doctor.consultation_fee : 'N/A'}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/patient/doctors/${doctor.id || doctor._id}`)} className="w-full border-2 border-primary text-primary font-label-bold text-label-bold py-sm rounded-lg hover:bg-primary-container/10 transition-colors duration-200">Book Consultation</button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 p-md text-center text-on-surface-variant border border-surface-variant rounded-xl">No doctors found for the selected specialisation.</div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg bg-surface-container dark:bg-surface-container-high mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-md px-margin-desktop max-w-7xl mx-auto">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed" data-icon="health_and_safety" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">SwasthConnect</span>
          </div>
          <div className="flex flex-wrap justify-center gap-sm font-body-sm text-body-sm">
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed transition-opacity duration-200 hover:opacity-80" href="#">Terms of Service</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed transition-opacity duration-200 hover:opacity-80" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed transition-opacity duration-200 hover:opacity-80" href="#">HIPAA Compliance</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed transition-opacity duration-200 hover:opacity-80" href="#">Contact Us</a>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-right">
            © 2024 SwasthConnect. Made for rural India.
          </div>
        </div>
      </footer>
    </div>
  );
}
