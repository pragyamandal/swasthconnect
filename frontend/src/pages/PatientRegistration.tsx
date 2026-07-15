import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
export default function PatientRegistration() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '', email: '', password: '', confirmPassword: '', age: '', gender: '', bloodGroup: '', language: 'en', terms: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.id]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
        if (!formData.terms) return setError("Agree to terms required.");
        
        setIsLoading(true);
        try {
            const payload = {
                name: formData.fullName, email: formData.email, password: formData.password, role: 'PATIENT',
                age: formData.age ? parseInt(formData.age, 10) : null, gender: formData.gender, bloodGroup: formData.bloodGroup, preferredLanguage: formData.language
            };
            const response = await axios.post('http://localhost:5000/api/auth/register', payload);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/patient/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#f7f9fc] min-h-screen flex text-[#191c1e]">
            {/* Left Panel */}
            <div className="hidden md:flex md:w-2/5 flex-col relative overflow-hidden bg-[#0F2D56] p-16 justify-center">
                 <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 w-full h-full">
                     <img alt="Patient" className="w-full h-full object-cover opacity-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN_jXVOuxi2ff6UvRYYkFMllzAel8WF38gEiZcZ9fnObm2nGozZwqkGksctSCrSAUA00pY45FG9B3nGAXn0gYivvYy--427zD2ctlfKCycYwyx_HMO_F7T3wMhchovPMGPXfz8I73YlZ7p3mAP8_y5LjrrXqUr511VMMNxoCm_IO2H0j8I4rVqpjrnHRcfWgEzFTUAW5NFiIUOPioIjzM_mejOx6feK9sxPigA5pVOI2UqFHl1MMFRqS75Iugtp_VNXD4pS5cM8gWu" />
                 </motion.div>
                 <div className="relative z-10">
                     <h1 className="text-4xl font-bold text-white mb-4">Your Health Journey Starts Here</h1>
                     <p className="text-[#a0c9ff]">Connect with top healthcare professionals from the comfort of your home.</p>
                 </div>
            </div>
            {/* Right Panel */}
            <div className="w-full md:w-3/5 p-8 md:p-16 overflow-y-auto">
                <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <img src="/logo.jpg" alt="SwasthConnect Logo" className="h-12 md:h-14 w-auto object-contain mix-blend-multiply mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Create Patient Account</h2>
                    <p className="text-[#414751] mb-8">Join thousands getting quality care from home</p>
                    
                    {error && <div className="p-3 mb-4 bg-[#ffdad6] text-[#93000a] rounded-lg">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm font-semibold mb-1" htmlFor="fullName">Full Name</label><input className="w-full p-3 border rounded-lg" id="fullName" value={formData.fullName} onChange={handleChange} required /></div>
                            <div><label className="block text-sm font-semibold mb-1" htmlFor="email">Email Address</label><input className="w-full p-3 border rounded-lg" id="email" type="email" value={formData.email} onChange={handleChange} required /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm font-semibold mb-1" htmlFor="password">Password</label><input className="w-full p-3 border rounded-lg" id="password" type="password" value={formData.password} onChange={handleChange} required /></div>
                            <div><label className="block text-sm font-semibold mb-1" htmlFor="confirmPassword">Confirm Password</label><input className="w-full p-3 border rounded-lg" id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="block text-sm font-semibold mb-1" htmlFor="age">Age</label><input className="w-full p-3 border rounded-lg" id="age" type="number" value={formData.age} onChange={handleChange} /></div>
                            <div><label className="block text-sm font-semibold mb-1" htmlFor="gender">Gender</label><select className="w-full p-3 border rounded-lg" id="gender" value={formData.gender} onChange={handleChange}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                            <div><label className="block text-sm font-semibold mb-1" htmlFor="bloodGroup">Blood Group</label><select className="w-full p-3 border rounded-lg" id="bloodGroup" value={formData.bloodGroup} onChange={handleChange}><option value="">Select</option><option value="O+">O+</option><option value="A+">A+</option></select></div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <input id="terms" type="checkbox" checked={formData.terms} onChange={handleChange} className="w-4 h-4" />
                            <label htmlFor="terms" className="text-sm">I agree to the Terms</label>
                        </div>
                        <motion.button type="submit" disabled={isLoading} className="w-full py-4 mt-6 bg-[#F4845F] text-white font-bold rounded-lg hover:bg-[#E07652] disabled:opacity-70" whileHover={{ scale: 1.02, boxShadow: "0px 4px 15px rgba(0,0,0,0.1)" }} whileTap={{ scale: 0.98 }}>{isLoading ? 'Registering...' : 'Register'}</motion.button>
                    </form>
                    <div className="mt-8 text-center text-sm">Already have an account? <Link className="text-[#005492] font-bold" to="/login">Login</Link></div>
                </motion.div>
            </div>
        </div>
    );
}
