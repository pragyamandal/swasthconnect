import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DoctorRegistration() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        specialisation: '',
        experience: '',
        license: '',
        fee: '',
        bio: '',
        terms: false
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const value =
            e.target.type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : e.target.value;

        setFormData({
            ...formData,
            [e.target.id]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match.');
        }

        if (!formData.terms) {
            return setError('Agree to terms required.');
        }

        setIsLoading(true);

        try {
            const payload = {
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: 'DOCTOR',
                specialisation: formData.specialisation,
                experience_years: parseInt(formData.experience, 10),
                license_number: formData.license,
                consultation_fee: parseFloat(formData.fee),
                bio: formData.bio,
            };

            const response = await axios.post(
                'http://localhost:3001/api/auth/register',
                payload
            );

            const { token, user } = response.data.data;

            localStorage.setItem('swasth_token', token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/doctor/onboarding');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Registration failed.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#f7f9fc] min-h-screen flex text-[#191c1e]">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-2/5 flex-col relative overflow-hidden bg-[#005492] p-16 justify-end">
                <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        alt="Doctor"
                        className="w-full h-full object-cover opacity-70 mix-blend-overlay"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl6l8zz1MIQtgr1DkOnMcUpbPZx370_RzWink_8ybrrEejeZHzYRHmkI12xonGCyFwrPcBZDIqEnZ4a8GDvnt8eVClwsLpTGxY5nhoElboL9xwIF4w1jOkpQnOWG1BtPL2lTH_HTaGtLuG3imAeDtco1BWXhoWkG4xnFgoLrPemw5B3eZyE_rJHp4no1PevRwCgBMLaYjjCeeivJTRoIUPlLLW7wM0LWBxrlnS5h8ECYmlvy_VMiv20hZKGA59Mpo-l6z8Epc0g5jN"
                    />
                </motion.div>

                <div className="relative z-10 bg-gradient-to-t from-[#001c37] to-transparent pt-32">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Join Our Network of Verified Doctors
                    </h1>

                    <p className="text-[#a0c9ff]">
                        Expand your practice, connect with more patients, and
                        deliver premium telemedicine care.
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-3/5 p-8 md:p-16 overflow-y-auto">
                <motion.div
                    className="max-w-2xl mx-auto"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <img
                        src="/logo.jpg"
                        alt="SwasthConnect Logo"
                        className="h-12 md:h-14 w-auto object-contain mix-blend-multiply mb-4"
                    />

                    <h2 className="text-3xl font-bold mb-2">
                        Create Doctor Account
                    </h2>

                    <p className="text-[#414751] mb-8">
                        Please provide your professional details to register.
                    </p>

                    {error && (
                        <div className="p-3 mb-4 bg-[#ffdad6] text-[#93000a] rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1" htmlFor="fullName">
                                    Full Name
                                </label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1" htmlFor="confirmPassword">
                                    Confirm Password
                                </label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1" htmlFor="specialisation">
                                    Specialisation
                                </label>

                                <select
                                    className="w-full p-3 border rounded-lg"
                                    id="specialisation"
                                    value={formData.specialisation}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Specialisation</option>
                                    <option value="General Physician">General Physician</option>
                                    <option value="Cardiologist">Cardiologist</option>
                                    <option value="Dermatologist">Dermatologist</option>
                                    <option value="Orthopaedist">Orthopaedist</option>
                                    <option value="Neurologist">Neurologist</option>
                                    <option value="Gynaecologist">Gynaecologist</option>
                                    <option value="Paediatrician">Paediatrician</option>
                                    <option value="Psychiatrist">Psychiatrist</option>
                                    <option value="ENT Specialist">ENT Specialist</option>
                                    <option value="Ophthalmologist">Ophthalmologist</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1" htmlFor="experience">
                                    Years of Experience
                                </label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    id="experience"
                                    type="number"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1" htmlFor="license">
                                    License Number
                                </label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    id="license"
                                    value={formData.license}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1" htmlFor="fee">
                                    Consultation Fee (₹)
                                </label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    id="fee"
                                    type="number"
                                    value={formData.fee}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1" htmlFor="bio">
                                Professional Bio
                            </label>
                            <textarea
                                className="w-full p-3 border rounded-lg"
                                id="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={formData.terms}
                                onChange={handleChange}
                                className="w-4 h-4"
                            />
                            <label htmlFor="terms" className="text-sm">
                                I agree to the Terms
                            </label>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 mt-6 bg-[#1a6db5] text-white font-bold rounded-lg hover:bg-[#005492] disabled:opacity-70"
                            whileHover={{
                                scale: 1.02,
                                boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? 'Registering...' : 'Register as Doctor'}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        Already have an account?{' '}
                        <Link className="text-[#005492] font-bold" to="/login">
                            Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}