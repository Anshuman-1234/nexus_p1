import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AlertCircle, ArrowRight } from 'lucide-react';
import soaLogo from '../assets/soa_logo.png';
import NeuralBackground from '../components/NeuralBackground';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    setMousePosition({ x, y });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0f2442]">
      {/* Neural Background */}
      <NeuralBackground />

      {/* Deep Space Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-[#16325C]/20 to-transparent opacity-50" />
      </div>

      {/* Main Container with Spotlight Effect */}
      <div
        className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row h-auto min-h-[600px] m-4 rounded-3xl overflow-hidden glass-card shadow-2xl border border-white/10 group"
        onMouseMove={handleMouseMove}
        style={{
          '--mouse-x': mousePosition.x,
          '--mouse-y': mousePosition.y
        }}
      >
        {/* Spotlight Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at calc(var(--mouse-x) * 100%) calc(var(--mouse-y) * 100%), rgba(255,255,255,0.06), transparent 40%)`
          }}
        />

        {/* Left Side - Visual & Branding */}
        <div className="w-full md:w-1/2 relative bg-gradient-to-br from-[#16325C]/90 to-[#0a1a30]/90 p-12 flex flex-col justify-between text-white overflow-hidden backdrop-blur-sm">

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8 perspective-1000">
              <img
                src={soaLogo}
                alt="Siksha 'O' Anusandhan Logo"
                className="h-24 w-auto drop-shadow-2xl animate-float"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(20px)'
                }}
              />
            </div>

            <h1 className="text-5xl font-extrabold leading-tight mb-4 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
              SIKSHA 'O' ANUSANDHAN
            </h1>
            <p className="text-xl font-medium text-[#F39C12] mb-6 flex items-center gap-2">
              <span className="h-0.5 w-8 bg-[#F39C12]"></span>
              Deemed to be University
            </p>

            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              Student Library Portal. <br />
              Access your academic resources seamlessy.
            </p>
          </div>

          <div className="mt-12 relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-1 w-12 bg-[#F39C12] rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-slate-300">Institute of Technical Education and Research</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 bg-white/5 backdrop-blur-2xl p-12 flex flex-col justify-center relative border-l border-white/5">
          <div className="max-w-md mx-auto w-full relative z-20">

            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Student Portal</h2>
              <p className="text-slate-400">Sign in with your credentials</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>

              {error && (
                <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 flex items-center gap-3 animate-pulse">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-200">{error}</p>
                </div>
              )}

              {/* Custom Role Selector with Glow */}
              <div className="bg-slate-900/50 p-1 rounded-xl flex relative mb-6 border border-white/5">
                <div className="w-1/2 absolute top-1 bottom-1 bg-[#16325C] shadow-lg shadow-blue-500/20 rounded-lg transition-all duration-300 ease-in-out"
                  style={{ left: role === 'student' ? '4px' : '50%' }} />

                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 relative z-10 py-2.5 text-sm font-medium text-center rounded-lg transition-colors duration-300 ${role === 'student' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 relative z-10 py-2.5 text-sm font-medium text-center rounded-lg transition-colors duration-300 ${role === 'admin' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Librarian
                </button>
              </div>

              <div className="space-y-5">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#16325C] to-[#F39C12] rounded-xl opacity-0 group-hover:opacity-75 transition duration-500 blur-sm"></div>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      label="Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="regd_no@soa.ac.in"
                      className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900 focus:ring-2 focus:ring-[#F39C12]/50 focus:border-transparent transition-all duration-300 h-12"
                      labelClassName="text-slate-300"
                    />
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#16325C] to-[#F39C12] rounded-xl opacity-0 group-hover:opacity-75 transition duration-500 blur-sm"></div>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      label="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900 focus:ring-2 focus:ring-[#F39C12]/50 focus:border-transparent transition-all duration-300 h-12"
                      labelClassName="text-slate-300"
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <a href="#" className="text-xs font-medium text-[#F39C12] hover:text-[#e67e22] transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#16325C] to-[#2c5282] hover:from-[#2c5282] hover:to-[#16325C] text-white h-12 rounded-xl text-base font-semibold shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                disabled={loading}
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />

                {loading ? (
                  <span className="flex items-center gap-2 relative z-20">
                    <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 relative z-20">
                    Sign In
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="text-center mt-8 text-xs text-slate-500">
              &copy; 2024 Siksha 'O' Anusandhan. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
