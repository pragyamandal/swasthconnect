import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const mockUser = { name: 'Priya', fullName: 'Priya Sharma', role: 'Patient' };

const mockUpcoming = {
  doctor: 'Dr. Anjali Sharma',
  spec: 'General Physician',
  time: '10:30 AM',
  status: 'Triage summary submitted ✓'
};

const mockRecent = [
  { id: 'DR', name: 'Dr. Rahul', spec: 'Pediatrician', date: '05 Nov 2024' },
  { id: 'DP', name: 'Dr. Priya', spec: 'Cardiologist', date: '28 Oct 2024' }
];

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  let userName = 'Patient';
  const token = localStorage.getItem('swasth_token');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      userName = decoded.name || 'Patient';
    } catch (error) {
      console.error("Failed to decode JWT token:", error);
    }
  }
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return "Good morning";
    if (currentHour >= 12 && currentHour < 17) return "Good afternoon";
    if (currentHour >= 17 && currentHour < 21) return "Good evening";
    return "Good night";
  };

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const upcomingAppointments = safeAppointments.filter(apt => apt?.scheduledAt && new Date(apt.scheduledAt) >= currentDate);
  const pastAppointments = safeAppointments.filter(apt => apt?.scheduledAt && new Date(apt.scheduledAt) < currentDate);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('swasth_token');
        const response = await fetch('http://localhost:3001/api/appointments/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Ensure data is an array before setting it, otherwise set empty array
          setAppointments(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch appointments, status:", response.status);
          setAppointments([]); // Fallback to empty array on error
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col md:flex-row">
      {/* Top Navigation (Mobile) & Shell Content Filter (Since this is a primary destination, we render the nav) */}
      <header className="bg-surface/80 dark:bg-surface-container-lowest/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-outline-variant/30 shadow-[0px_4px_20px_rgba(26,109,181,0.08)] md:hidden">
        <div className="flex justify-between items-center px-margin-mobile py-sm">
          <div className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary">SwasthConnect</div>
          <button className="text-on-surface p-2">
            <span className="material-symbols-outlined" data-icon="menu">menu</span>
          </button>
        </div>
      </header>

      {/* Side Navigation (Desktop Fixed Sidebar) */}
      <aside className="hidden md:block w-[240px] bg-surface-container-lowest border-r border-outline-variant/30 h-screen sticky top-0 shrink-0 z-40">
        <div className="flex flex-col h-full justify-between px-md py-lg">
          
          {/* TOP SECTION */}
          <div className="flex flex-col gap-6">
            <div className="font-headline-md text-headline-md font-bold text-primary pl-xs">SwasthConnect</div>
            <div className="flex items-center space-x-3 px-xs">
              <img className="w-12 h-12 rounded-full object-cover" alt="A professional headshot of an Indian woman in her 30s. She has a warm, reassuring smile. The lighting is bright and high-key, creating a clean, modern medical or SaaS aesthetic. The background is a soft, blurred light blue, complementing the primary brand color." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA8bbA-oEvXjsHlLZc02cNgVGG9qqOSanyp19JGMgBS2IJr_LUoPjQoqfkcq_eeTOrL0bK_oLWoNjP89FNs9_8wvKYf9KB7wmZhS9DOmVUGmxgXwoU_seMiHqb3wskjYjZ9HTM1UPlxArF0v6d_mI5qRCPPIEiGVbhM9Hti9iftmN-k8BTPwbVXTlHK2y6cueuE8pq_GnlcMgcNJYWC493uysjCHoFxHdBZf9hJUyy1Ah9C7fWi5YUbEvCwDCiNJQeuEd7nMZp_4RT" />
              <div>
                <h3 className="font-label-bold text-label-bold text-on-surface">{userName}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant rounded-full font-caption text-caption">{mockUser.role}</span>
              </div>
            </div>
            <nav className="space-y-2">
              <Link className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-bold text-label-bold transition-all duration-300" to="/patient/dashboard">
                <span className="material-symbols-outlined fill-icon" data-icon="home" data-weight="fill">home</span>
                <span>Home</span>
              </Link>
              <Link className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-300" to="/patient/find-doctor">
                <span className="material-symbols-outlined" data-icon="search">search</span>
                <span>Find a Doctor</span>
              </Link>
              <Link className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-300" to="/patient/appointments">
                <span className="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
                <span>My Appointments</span>
              </Link>
              <Link className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-300" to="/patient/timeline">
                <span className="material-symbols-outlined" data-icon="history">history</span>
                <span>Health Timeline</span>
              </Link>
              <Link className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-300 mt-lg" to="/patient/settings">
                <span className="material-symbols-outlined" data-icon="settings">settings</span>
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          {/* BOTTOM SECTION */}
          <div className="mt-auto pt-4">
            <button className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-outline-variant/50 text-on-surface-variant font-label-bold text-label-bold hover:bg-surface-container-low transition-colors">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[18px]" data-icon="language">language</span>
                <span>English</span>
              </div>
              <span className="material-symbols-outlined text-[18px]" data-icon="expand_more">expand_more</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-lg md:py-xl mt-[64px] md:mt-0 w-full max-w-[1200px] mx-auto pb-32 md:pb-xl">
        {/* Top Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-lg space-y-4 sm:space-y-0">
          <div>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{getGreeting()}, {userName} 👋</h1>
            <p className="text-on-surface-variant font-body-sm text-body-sm mt-1">{dateString}</p>
          </div>
          <button className="p-3 bg-surface-container-lowest rounded-full soft-shadow hover:shadow-md transition-shadow relative">
            <span className="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-lowest"></span>
          </button>
        </header>

        {/* Follow-up Banner */}
        <section>
          {pastAppointments.length > 0 ? (
            <div className="bg-tertiary-fixed-dim/20 rounded-xl p-md mb-lg flex justify-between items-center border border-tertiary-fixed">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">stethoscope</span>
                </div>
                <div>
                  <h3 className="font-label-bold text-label-bold text-on-surface mb-1">Post-Consultation Check-in</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    How are you feeling after your consultation with {pastAppointments[0].doctorName} on {new Date(pastAppointments[0].scheduledAt).toLocaleDateString()}?
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-surface-container-lowest px-4 py-2 rounded-lg font-label-bold text-on-surface border border-surface-variant hover:bg-surface-container-low transition-colors">😊 Better</button>
                <button className="bg-surface-container-lowest px-4 py-2 rounded-lg font-label-bold text-on-surface border border-surface-variant hover:bg-surface-container-low transition-colors">😐 Same</button>
                <button className="bg-surface-container-lowest px-4 py-2 rounded-lg font-label-bold text-on-surface border border-surface-variant hover:bg-surface-container-low transition-colors">😟 Worse</button>
              </div>
            </div>
          ) : (
            <div className="bg-primary-fixed/30 rounded-xl p-md mb-lg flex items-center gap-4 border border-primary-fixed-dim">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">waving_hand</span>
              </div>
              <div>
                <h3 className="font-label-bold text-label-bold text-on-surface mb-1">Welcome back, {userName}!</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">How are you feeling today? Use the AI symptom checker to find the right specialist.</p>
              </div>
            </div>
          )}
        </section>

        {/* Bento Grid Layout for Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Upcoming Appointment (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Upcoming Appointments</h3>
            {isLoading ? (
              <div className="p-md text-center text-on-surface-variant animate-pulse">Loading appointments...</div>
            ) : upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt, index) => (
                <div key={index} className="border border-surface-variant rounded-xl p-md mb-md">
                  <div className="flex justify-between items-start mb-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden">
                        {/* Placeholder Avatar */}
                        <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-on-surface-variant">person</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface">{apt.doctorName || 'Doctor'}</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{apt.specialisation || 'Specialist'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {/* Formatting the date/time nicely if scheduledAt is available, otherwise generic */}
                      <div className="font-label-bold text-label-bold text-primary">
                        {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString() : 'Upcoming'}
                      </div>
                      <div className="font-headline-md text-headline-md text-primary">
                        {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </div>
                    </div>
                  </div>
                  
                  {/* Triage Summary Badge */}
                  {apt.triage_summary && (
                    <div className="bg-surface-container-low p-3 rounded-lg mb-4 text-sm flex gap-2 items-start">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${apt.triage_summary.urgency === 'High' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                        {apt.triage_summary.urgency || 'Normal'} Priority
                      </span>
                      <span className="text-on-surface-variant">{apt.triage_summary.chief_complaint}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-surface-variant">
                    <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                      <span className="material-symbols-outlined text-[18px]">videocam</span> Video Consultation
                    </div>
                    <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-bold hover:bg-primary/90 transition-colors">
                      Join Waiting Room
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-md text-center text-on-surface-variant border border-surface-variant rounded-xl">
                No upcoming appointments found.
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              <Link to="/patient/find-doctor" className="bg-surface-container-lowest p-4 rounded-xl soft-shadow flex items-center space-x-4 hover:shadow-md transition-shadow group text-left border border-transparent hover:border-primary/20">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary" data-icon="search">search</span>
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Find a Doctor</p>
                  <p className="text-on-surface-variant font-caption text-caption mt-1">Book a new consultation</p>
                </div>
              </Link>
              <button className="bg-surface-container-lowest p-4 rounded-xl soft-shadow flex items-center space-x-4 hover:shadow-md transition-shadow group text-left border border-transparent hover:border-secondary-container/50">
                <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-secondary" data-icon="timeline">timeline</span>
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Health Timeline</p>
                  <p className="text-on-surface-variant font-caption text-caption mt-1">View your medical history</p>
                </div>
              </button>
              <button className="bg-surface-container-lowest p-4 rounded-xl soft-shadow flex items-center space-x-4 hover:shadow-md transition-shadow group text-left border border-transparent hover:border-outline-variant">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-surface-variant" data-icon="prescriptions">prescriptions</span>
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Download Prescriptions</p>
                  <p className="text-on-surface-variant font-caption text-caption mt-1">Access recent documents</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Consultations */}
        <section className="mt-xl">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Recent Consultations</h3>
          <div className="bg-surface-container-lowest rounded-xl soft-shadow overflow-hidden">
            {pastAppointments.length > 0 ? (
              <div className="divide-y divide-outline-variant/30">
                {pastAppointments.map((apt, index) => (
                  <div key={index} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed/50 flex items-center justify-center text-primary font-label-bold">
                        {apt.doctorName ? apt.doctorName.substring(0, 2).toUpperCase() : 'DR'}
                      </div>
                      <div>
                        <p className="font-label-bold text-label-bold text-on-surface group-hover:text-primary transition-colors">{apt.doctorName || 'Doctor'}</p>
                        <p className="text-on-surface-variant font-caption text-caption mt-0.5">
                          {apt.specialisation || 'Specialist'} • {apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-highest">
                      <span className="material-symbols-outlined" data-icon="download">download</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-on-surface-variant p-md text-center">No recent consultations found.</div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0px_-4px_20px_rgba(26,109,181,0.08)] z-50 pb-safe">
        <div className="flex justify-around items-center px-4 py-2">
          <Link className="flex flex-col items-center p-2 text-primary" to="/patient/dashboard">
            <span className="material-symbols-outlined fill-icon mb-1" data-icon="home" data-weight="fill">home</span>
            <span className="font-caption text-caption text-[10px]">Home</span>
          </Link>
          <Link className="flex flex-col items-center p-2 text-on-surface-variant hover:text-primary" to="/patient/find-doctor">
            <span className="material-symbols-outlined mb-1" data-icon="search">search</span>
            <span className="font-caption text-caption text-[10px]">Search</span>
          </Link>
          <Link className="flex flex-col items-center p-2 text-on-surface-variant hover:text-primary" to="/patient/appointments">
            <span className="material-symbols-outlined mb-1" data-icon="calendar_month">calendar_month</span>
            <span className="font-caption text-caption text-[10px]">Appointments</span>
          </Link>
          <Link className="flex flex-col items-center p-2 text-on-surface-variant hover:text-primary" to="/patient/settings">
            <span className="material-symbols-outlined mb-1" data-icon="settings">settings</span>
            <span className="font-caption text-caption text-[10px]">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
