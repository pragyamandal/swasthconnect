import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { id } = useParams(); // To potentially fetch specific doctor data in the future

  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Tue');
  const [selectedTime, setSelectedTime] = useState('3:00 PM');
  const [isBooking, setIsBooking] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const times = ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'];

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem('swasth_token');
        const response = await fetch(`http://localhost:3001/api/doctors/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Handle potential nesting like we did on the previous page
          setDoctor(data.data || data); 
        }
      } catch (error) {
        console.error("Failed to fetch doctor details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchDoctor();
  }, [id]);

  const handleBookAppointment = async () => {
    if (!selectedTime) {
      alert("Please select a time slot first.");
      return;
    }
  
    setIsBooking(true);
    try {
      const token = localStorage.getItem('swasth_token');
      
      // Create a date object and parse the selected time (assuming format like "10:00 AM")
      const scheduledDate = new Date(); 
      const [time, modifier] = selectedTime.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
      scheduledDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  
      const response = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: id,
          scheduledAt: scheduledDate.toISOString(),
          status: 'SCHEDULED'
        })
      });
  
      if (response.ok) {
        const responseData = await response.json();
        
        // Handle potential nesting from the backend (e.g., data.data or data directly)
        const appointmentData = responseData.data || responseData;
        
        // The backend should return the new appointment ID (could be 'id' or 'appointmentId')
        const newAppointmentId = appointmentData.appointmentId || appointmentData.id;
  
        if (newAppointmentId) {
          console.log("✅ Booking successful, redirecting to triage:", newAppointmentId);
          navigate(`/patient/triage/${newAppointmentId}`);
        } else {
          console.warn("Booking succeeded, but couldn't find appointment ID in response:", responseData);
          // Fallback to dashboard if the ID is missing for some reason
          navigate('/patient/dashboard');
        }
      } else {
        const errorData = await response.json();
        console.error("Booking failed:", errorData);
        alert("Failed to book appointment. Please try another time slot.");
      }
    } catch (error) {
      console.error("Error during booking:", error);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md min-h-screen flex flex-col">
      {/* Suppressed TopNavBar due to transactional/deep-dive nature of doctor profile per Source of Truth instructions */}
      <main className="flex-grow relative">
        {/* Header Gradient */}
        <div className="h-[200px] w-full bg-gradient-to-r from-primary to-primary-container relative">
          <div className="absolute top-sm left-sm md:top-md md:left-margin-desktop z-10">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </div>
          {/* Decorative medical pattern subtle overlay could go here */}
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto px-sm md:px-md pb-xl">
          {/* Doctor Profile Card (Overlap) */}
          <div className="bg-surface-container-lowest rounded-t-xl md:rounded-xl shadow-lg -mt-16 md:-mt-24 relative pt-16 px-md pb-md soft-shadow">
            {/* Avatar */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-surface-container-lowest shadow-md overflow-hidden bg-surface-container">
                <img 
                  alt="Dr. Rahul Mehra" 
                  className="w-full h-full object-cover" 
                  data-alt="A highly detailed, professional headshot of an Indian male doctor in his 40s wearing a crisp white lab coat over a blue shirt. The background is a soft, blurred clinical setting. Bright, modern light-mode lighting, exuding trust and medical expertise." 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR5EOWsAlna_667ac5dSrjb2At7u04GLF5HvZmnhNgdfjBL37ZpHJ8wBUC4GXiNLq-oS61K6Bv3gUrVXFO9MahXqsjX0KBZdNrXO45d2sb4cIXicuNvqbBhnMnVbV1UrX-nsxMDIAlrDFmoX2_ue6CNd-2hueNlRvVffuU1692hjsHju7vg-xh1RcXiXnhm3T9HlKrzFTicf-ulGyySX2T5gW8UbKZcPYRKH4M_4Kv-oplq-Lvz1qDliDWhUM3Dq_ZbroF2W_0wjzK" 
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="text-center mt-2 mb-md">
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs flex items-center justify-center gap-2">
                {doctor?.name || "Loading..."}
                <span className="material-symbols-outlined text-primary" data-weight="fill">verified</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">{doctor?.specialisation}</p>
              <div className="flex items-center justify-center gap-2 mt-xs">
                <span className="bg-surface-container-low px-3 py-1 rounded-full font-label-bold text-label-bold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">workspace_premium</span>
                  {doctor?.experience_years ? `${doctor.experience_years}+ Years Experience` : 'Experience N/A'}
                </span>
                <span className="bg-primary-fixed/20 text-primary-container px-3 py-1 rounded-full font-label-bold text-label-bold flex items-center gap-1">
                  Medical License Verified ✓
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {/* Left Column: About & Quality */}
              <div className="md:col-span-2 flex flex-col gap-md">
                {/* About Section */}
                <section className="bg-surface-container-lowest p-md rounded-lg border border-surface-variant">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">About</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {doctor?.bio || "No bio available."}
                  </p>
                </section>

                {/* Quality Score Section */}
                <section className="bg-surface-container-lowest p-md rounded-lg border border-surface-variant">
                  <div className="flex items-center justify-between mb-sm">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Quality Score</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-tertiary text-xl">★★★★☆</span>
                      <span className="font-headline-md text-headline-md text-on-surface">4.2</span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-md text-right">(124 total consultations)</p>
                  <div className="space-y-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Clarity of Explanation</span>
                      <div className="flex items-center gap-2">
                        <div className="text-tertiary text-sm tracking-widest">████░</div>
                        <span className="font-label-bold text-label-bold w-6 text-right">4.3</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Time Given</span>
                      <div className="flex items-center gap-2">
                        <div className="text-tertiary text-sm tracking-widest">████░</div>
                        <span className="font-label-bold text-label-bold w-6 text-right">4.1</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Prescription Quality</span>
                      <div className="flex items-center gap-2">
                        <div className="text-tertiary text-sm tracking-widest">█████</div>
                        <span className="font-label-bold text-label-bold w-6 text-right">4.6</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Overall</span>
                      <div className="flex items-center gap-2">
                        <div className="text-tertiary text-sm tracking-widest">████░</div>
                        <span className="font-label-bold text-label-bold w-6 text-right">4.2</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Availability & Booking */}
              <div className="md:col-span-1">
                <section className="bg-surface p-md rounded-lg sticky top-md shadow-sm border border-surface-variant">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">Available Slots</h2>
                  
                  {/* Days */}
                  <div className="flex overflow-x-auto gap-2 pb-2 mb-md scrollbar-hide">
                    {days.map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-full font-label-bold text-label-bold flex-shrink-0 ${
                          selectedDay === day
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-low'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-2 mb-md">
                    {times.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-lg font-label-bold text-label-bold transition-all ${
                          selectedTime === time
                            ? 'bg-tertiary text-on-tertiary border border-transparent shadow-md transform scale-[1.02]'
                            : 'bg-primary-fixed/20 text-primary-container border border-transparent hover:bg-primary-fixed/40 transition-colors'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-surface-variant pt-md">
                    <div className="flex justify-between items-center mb-md">
                      <span className="font-body-md text-body-md text-on-surface-variant">Consultation Fee</span>
                      <span className="font-headline-md text-headline-md text-on-surface">₹ {doctor?.consultation_fee || "N/A"}</span>
                    </div>
                    <button
                      onClick={handleBookAppointment}
                      disabled={isBooking || !selectedTime}
                      className="w-full bg-tertiary text-on-tertiary font-label-bold text-label-bold py-3 px-4 rounded-lg hover:bg-tertiary-container transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isBooking ? 'Booking Appointment...' : 'Book & Continue to Triage'}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg bg-surface-container dark:bg-surface-container-high flex flex-col md:flex-row justify-between items-center gap-md px-margin-desktop max-w-7xl mx-auto flat no shadows">
        <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
          SwasthConnect
        </div>
        <div className="text-on-surface-variant dark:text-surface-variant font-body-sm text-body-sm">
          © 2024 SwasthConnect. Made for rural India.
        </div>
        <div className="flex flex-wrap gap-md justify-center">
          <a className="text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed transition-opacity duration-200 hover:opacity-80 font-body-sm text-body-sm" href="#">Terms of Service</a>
          <a className="text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed transition-opacity duration-200 hover:opacity-80 font-body-sm text-body-sm" href="#">Privacy Policy</a>
          <a className="text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed transition-opacity duration-200 hover:opacity-80 font-body-sm text-body-sm" href="#">HIPAA Compliance</a>
          <a className="text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed transition-opacity duration-200 hover:opacity-80 font-body-sm text-body-sm" href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
