import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type TimeSlot = {
  startTime: string;
  endTime: string;
};

type DayAvailability = {
  isAvailable: boolean;
  slots: TimeSlot[];
};

type AvailabilityState = {
  [key: string]: DayAvailability;
};

const INITIAL_STATE: AvailabilityState = {
  Monday: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '13:00' }] },
  Tuesday: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '17:00' }] },
  Wednesday: { isAvailable: false, slots: [] },
  Thursday: { isAvailable: true, slots: [{ startTime: '14:00', endTime: '18:00' }] },
  Friday: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '15:00' }] },
  Saturday: { isAvailable: false, slots: [] },
  Sunday: { isAvailable: false, slots: [] },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorOnboarding: React.FC = () => {
  const [availability, setAvailability] = useState<AvailabilityState>(INITIAL_STATE);
  const navigate = useNavigate();

  const handleToggle = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: !prev[day].isAvailable,
      },
    }));
  };

  const handleAddSlot = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { startTime: '09:00', endTime: '17:00' }],
      },
    }));
  };

  const handleRemoveSlot = (day: string, index: number) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));
  };

  const handleTimeChange = (
    day: string,
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setAvailability((prev) => {
      const newSlots = [...prev[day].slots];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: newSlots,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '/api/doctors/availability',
        { availability },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        navigate('/doctor/dashboard');
      }
    } catch (error) {
      console.error('Failed to save availability', error);
      // Optional: Handle error state in UI here
    }
  };

  const formatTime = (time24: string) => {
    if (!time24) return '';
    const [hour, min] = time24.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${min} ${ampm}`;
  };

  return (
    <div className="antialiased text-on-surface font-body-md flex flex-col min-h-screen bg-white">
      <style dangerouslySetInnerHTML={{__html: `
        .toggle-checkbox:checked {
            right: 0;
            border-color: #1a6db5;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #1a6db5;
        }
      `}} />

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md shadow-sm transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-xs">
            <img src="/logo.jpg" alt="SwasthConnect Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
          </div>
          {/* Links (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-gutter">
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#">How it Works</a>
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#">Features</a>
            <a className="font-body-md text-body-md text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed pb-1" href="#">For Doctors</a>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-sm">
            <button className="hidden md:block font-body-md text-body-md text-primary dark:text-primary-fixed font-semibold hover:bg-primary-container/10 dark:hover:bg-primary-container/20 rounded-lg px-4 py-2 transition-all">Patient Login</button>
            <button className="bg-primary hover:bg-primary-container text-on-primary font-label-bold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">Join as Doctor</button>
          </div>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="flex-grow pt-20 flex flex-col md:flex-row min-h-screen">
        {/* Left Side (60%) */}
        <section className="w-full md:w-3/5 px-margin-mobile md:px-margin-desktop py-lg flex flex-col items-center">
          {/* Progress Indicator */}
          <div className="w-full max-w-[600px] mb-lg">
            <div className="flex items-center justify-between mb-xs">
              <span className="font-label-bold text-label-bold text-primary flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">check_circle</span> Step 1: Account Created
              </span>
              <span className="font-label-bold text-label-bold text-on-surface">
                Step 2: Set Availability
              </span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden flex">
              <div className="h-full bg-primary w-1/2"></div>
              <div className="h-full bg-primary/20 w-1/2 rounded-r-full"></div>
            </div>
          </div>

          {/* Main Card */}
          <div className="w-full max-w-[600px] bg-white rounded-xl shadow-[0px_4px_20px_rgba(26,109,181,0.08)] p-md border border-surface-container-high">
            <div className="mb-md text-center">
              <h1 className="font-headline-lg text-[32px] md:text-headline-lg text-on-surface mb-xs font-bold">When Are You Available?</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Set your consultation hours. You can change these anytime.</p>
            </div>

            {/* Schedule List */}
            <div className="space-y-sm">
              {DAYS.map((day) => {
                const dayData = availability[day];
                const isAvailable = dayData.isAvailable;

                return (
                  <div key={day} className={`border border-surface-container rounded-lg p-sm ${!isAvailable ? 'opacity-60 bg-surface-container-lowest' : ''}`}>
                    <div className="flex items-center justify-between flex-wrap gap-xs">
                      <div className="flex items-center gap-sm min-w-[120px]">
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                          <input
                            checked={isAvailable}
                            onChange={() => handleToggle(day)}
                            className={`toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 top-0 transition-all duration-300 ${!isAvailable ? 'border-surface-container' : ''}`}
                            id={`toggle_${day}`}
                            name={`toggle_${day}`}
                            type="checkbox"
                          />
                          <label
                            className="toggle-label block overflow-hidden h-5 rounded-full bg-surface-container cursor-pointer transition-colors duration-300"
                            htmlFor={`toggle_${day}`}
                          ></label>
                        </div>
                        <span className="font-label-bold text-label-bold text-on-surface">{day}</span>
                      </div>

                      {!isAvailable && (
                        <div className="flex items-center gap-xs flex-grow justify-end text-on-surface-variant font-body-sm text-body-sm">
                          Unavailable
                        </div>
                      )}

                      {isAvailable && (
                        <div className="flex flex-col gap-xs flex-grow w-full md:w-auto mt-2 md:mt-0">
                          {dayData.slots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-xs justify-end flex-wrap">
                              <input
                                className="rounded border-outline-variant text-body-sm font-body-sm text-on-surface focus:ring-primary focus:border-primary p-1.5 w-28"
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleTimeChange(day, index, 'startTime', e.target.value)}
                              />
                              <span className="text-on-surface-variant">-</span>
                              <input
                                className="rounded border-outline-variant text-body-sm font-body-sm text-on-surface focus:ring-primary focus:border-primary p-1.5 w-28"
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleTimeChange(day, index, 'endTime', e.target.value)}
                              />
                              {index === 0 ? (
                                <button
                                  onClick={() => handleAddSlot(day)}
                                  aria-label="Add slot"
                                  className="ml-2 text-primary border border-primary rounded p-1.5 hover:bg-primary-container/10 transition-colors flex items-center justify-center"
                                >
                                  <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                              ) : (
                                <div className="ml-2 w-[34px]" />
                              )}
                            </div>
                          ))}
                          {dayData.slots.length === 0 && (
                            <div className="flex items-center gap-xs justify-end">
                              <button
                                onClick={() => handleAddSlot(day)}
                                aria-label="Add slot"
                                className="text-primary border border-primary rounded p-1.5 hover:bg-primary-container/10 transition-colors flex items-center"
                              >
                                <span className="material-symbols-outlined text-sm">add</span> Add Slot
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Chips */}
                    {isAvailable && dayData.slots.length > 0 && (
                      <div className="mt-xs flex flex-wrap gap-xs pl-0 md:pl-[136px]">
                        {dayData.slots.map((slot, index) => (
                          <div key={`chip-${index}`} className="inline-flex items-center bg-primary-container/10 text-primary rounded-full px-3 py-1 font-body-sm text-body-sm border border-primary/20">
                            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                            <button onClick={() => handleRemoveSlot(day, index)} className="ml-2 text-primary hover:text-on-error-container flex items-center">
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-lg">
              <button onClick={handleSave} className="w-full bg-[#F4845F] hover:bg-[#d96a45] text-white font-label-bold py-3 rounded-lg transition-colors shadow-sm text-center">
                Save & Continue
              </button>
              <p className="text-center mt-xs font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">lightbulb</span> Patients will only see slots you've marked as available
              </p>
            </div>
          </div>
        </section>

        {/* Right Side (40%) */}
        <section className="hidden md:flex w-2/5 bg-primary/5 flex-col items-center justify-center p-lg relative overflow-hidden">
          {/* Decorative blur blobs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-sm text-center flex flex-col items-center">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Manage Your Time</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Your availability controls when patients can book with you. Update your schedule anytime to maintain a healthy work-life balance.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg bg-surface-container dark:bg-surface-container-high border-t border-surface-container-high">
        <div className="flex flex-col md:flex-row justify-between items-center gap-md px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
          <div className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            © 2024 SwasthConnect. Made for rural India.
          </div>
          <div className="flex flex-wrap justify-center gap-md">
            <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed" href="#">Terms of Service</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed" href="#">Privacy Policy</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed" href="#">HIPAA Compliance</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors hover:underline decoration-secondary dark:decoration-secondary-fixed" href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DoctorOnboarding;
