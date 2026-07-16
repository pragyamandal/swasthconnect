import React, { useState } from 'react';
import api from '../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
           const response = await api.post('/api/auth/login', formData);
            const { token, user } = response.data.data;
localStorage.setItem('swasth_token', token);
console.log('Login response:', { token, user }); // ADD THIS
localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
            else navigate('/patient/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen font-body-md text-on-surface antialiased flex flex-col md:flex-row">
            {/* Left Panel */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-center items-center bg-gradient-to-br from-[#1a6db5] via-[#005492] to-[#a0c9ff] p-16">
                <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
                    <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="w-full flex justify-center">
                        <img alt="Dashboard" className="w-full h-auto object-contain drop-shadow-2xl mb-12" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFxpqvUOnwWyfk4Bgd73XsISE5dsg3wSs_juUhHFAB7q2pZmS3ACaHO1XM6NAQZSK3BmmFIQ5TpGJLVzm8Ugwt815grzjgpAxmz_fLPsogsEy53FoTB55ndbxGnqN3IuU2PQheWb_kJbmmPYnioM-u3XoMUMYgvadqQawO4ml_92O58h6BUciPTUl3iHGVHt-CB1gRxNwGVRyZ4-A8vVZOv1pV2pOrLIa_KtoyDQzPf0OfHgyH-y4gKMb6Mh5rxQ0i03OiHQJXT1j3" />
                    </motion.div>
                    <h1 className="font-bold text-4xl text-white text-center">Welcome Back</h1>
                    <p className="text-[#a0c9ff] text-center mt-4 max-w-md">Securely access your clinical insights and continue providing exceptional care.</p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-16 bg-[#f7f9fc] min-h-screen">
                <motion.div className="w-full max-w-md space-y-12" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                        <img src="/logo.jpg" alt="SwasthConnect Logo" className="h-12 md:h-14 w-auto object-contain mix-blend-multiply mb-4" />
                        <div>
                            <h2 className="font-bold text-3xl text-[#191c1e]">Welcome Back</h2>
                            <p className="text-[#414751] mt-1">Login to continue your healthcare journey</p>
                        </div>
                    </div>

                    {error && <div className="p-3 bg-[#ffdad6] text-[#93000a] text-sm rounded-lg">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="block font-semibold text-sm text-[#191c1e]" htmlFor="email">Email Address</label>
                            <input className="block w-full px-4 py-3 bg-white border border-[#c1c7d2] rounded-lg text-[#191c1e] focus:ring-2 focus:ring-[#005492]" id="email" name="email" type="email" placeholder="doctor@clinic.com" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="space-y-1">
                            <label className="block font-semibold text-sm text-[#191c1e]" htmlFor="password">Password</label>
                            <input className="block w-full px-4 py-3 bg-white border border-[#c1c7d2] rounded-lg text-[#191c1e] focus:ring-2 focus:ring-[#005492]" id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="flex justify-end">
                            <a className="font-semibold text-sm text-[#005492] hover:underline" href="#">Forgot password?</a>
                        </div>
                        <motion.button type="submit" disabled={isLoading} className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-[#8e3718] hover:bg-[#ad4e2d] transition-all disabled:opacity-70" whileHover={{ scale: 1.02, boxShadow: "0px 4px 15px rgba(0,0,0,0.1)" }} whileTap={{ scale: 0.98 }}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </motion.button>
                    </form>
                    <div className="text-center text-sm text-[#414751]">
                        Don't have an account? <Link className="font-semibold text-[#005492] hover:underline" to="/register/patient">Register</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
