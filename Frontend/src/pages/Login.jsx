import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { AlertCircle, ArrowRight } from 'lucide-react';
import SpotlightBackground from '../components/SpotlightBackground.jsx';

import soaLogo from '../assets/soa_logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credentials = { role };
      if (role === 'student') {
        credentials.regNo = email; // Using email state for RegNo
        credentials.password = password;
      } else if (role === 'librarian') {
        credentials.librarianPassword = password;
      } else if (role === 'admin') {
        credentials.adminPassword = password;
      }

      const data = await login(credentials);

      const userRole = data.user?.role || role;

      if (userRole === 'admin') navigate('/admin-dashboard');
      else if (userRole === 'librarian') navigate('/librarian-dashboard');
      else navigate('/student-dashboard');

    } catch (err) {
      console.error("Login Error:", err);
      let msg = 'Invalid credentials. Please try again.';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message) {
        msg = `Network/Request Error: ${err.message}`;
      }
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0f2442]">
      <SpotlightBackground />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-[#16325C]/20 to-transparent opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f2442] via-transparent to-[#0f2442]/50" />
      </div>

      <div
        className="relative z-10 w-full max-w-[95%] md:max-w-4xl lg:max-w-5xl mx-auto flex flex-col md:flex-row h-auto md:h-[min(650px,90vh)] max-h-[90vh] my-4 md:my-6 rounded-2xl overflow-hidden glass-card shadow-2xl border border-white/10 group transition-all duration-500"
      >

        <div className="w-full md:w-1/2 relative bg-gradient-to-b md:bg-gradient-to-br from-[#16325C]/90 to-[#0a1a30]/90 p-4 md:p-8 flex flex-col justify-between text-white overflow-hidden backdrop-blur-sm transition-all duration-300">

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center justify-center space-x-3 mb-4 md:mb-8 perspective-1000">
              <img
                src={soaLogo}
                alt="Siksha 'O' Anusandhan Logo"
                className="h-10 md:h-16 w-auto drop-shadow-2xl animate-float transition-all duration-300"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(20px)'
                }}
              />
            </div>

            <h1 className="text-xl md:text-3xl font-extrabold leading-tight mb-1 md:mb-3 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 transition-all duration-300 text-center">
              SIKSHA 'O' ANUSANDHAN
            </h1>
            <p className="text-base md:text-xl font-medium text-[#F39C12] mb-3 md:mb-6 flex items-center justify-center gap-2">
              <span className="h-0.5 w-4 md:w-8 bg-[#F39C12]"></span>
              Deemed to be University
            </p>

            <p className="text-sm md:text-lg text-slate-300 max-w-md leading-relaxed hidden sm:block mt-4 md:mt-6 text-center">
              Student Library Portal. <br />
              Access your academic resources seamlessy.
            </p>
          </div>

          <div className="mt-4 md:mt-12 relative z-10 hidden sm:block">
            <div className="flex items-center justify-center gap-4">
              <div className="h-1 w-8 md:w-12 bg-[#F39C12] rounded-full animate-pulse"></div>
              <p className="text-xs md:text-sm font-medium text-slate-300">Institute of Technical Education and Research</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white/5 backdrop-blur-2xl p-4 md:p-8 flex flex-col justify-center relative border-t md:border-t-0 md:border-l border-white/5 transition-all duration-300 overflow-y-auto">
          <div className="max-w-md mx-auto w-full relative z-20 py-4 md:py-0">

            <div className="mb-4 md:mb-10 text-center md:text-left">
              <h2 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">Student Portal</h2>
              <p className="text-xs md:text-base text-slate-400">Sign in with your credentials</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>

              {error && (
                <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 flex items-center gap-3 animate-pulse">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-200">{error}</p>
                </div>
              )}

              <div className="bg-slate-900/50 p-1 rounded-xl flex relative mb-6 border border-white/5">
                <div className="w-1/3 absolute top-1 bottom-1 bg-[#16325C] shadow-lg shadow-blue-500/20 rounded-lg transition-all duration-300 ease-in-out"
                  style={{ left: role === 'student' ? '4px' : role === 'librarian' ? '33%' : '66%' }} />

                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 relative z-10 py-2.5 text-xs md:text-sm font-medium text-center rounded-lg transition-colors duration-300 ${role === 'student' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('librarian')}
                  className={`flex-1 relative z-10 py-2.5 text-xs md:text-sm font-medium text-center rounded-lg transition-colors duration-300 ${role === 'librarian' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Librarian
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 relative z-10 py-2.5 text-xs md:text-sm font-medium text-center rounded-lg transition-colors duration-300 ${role === 'admin' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Admin
                </button>
              </div>

              <div className="space-y-5">
                {role === 'student' && (
                  <div className="group relative">
                    <div className="relative">
                      <Input
                        id="regNo"
                        type="text"
                        label="Registration Number"
                        required
                        value={email} // Reusing email state for regNo to minimize changes
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your Registration Number"
                        className="bg-slate-800/80 border-slate-500 text-white placeholder:text-slate-300 focus:bg-slate-700 focus:ring-2 focus:ring-[#F39C12] focus:border-transparent transition-all duration-200 h-12 shadow-sm"
                        labelClassName="text-[#F39C12] font-semibold tracking-wide"
                      />
                    </div>
                  </div>
                )}

                <div className="group relative">
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      label="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your Password"
                      className="bg-slate-800/80 border-slate-500 text-white placeholder:text-slate-300 focus:bg-slate-700 focus:ring-2 focus:ring-[#F39C12] focus:border-transparent transition-all duration-200 h-12 shadow-sm"
                      labelClassName="text-[#F39C12] font-semibold tracking-wide"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#16325C] to-[#2c5282] hover:from-[#2c5282] hover:to-[#16325C] text-white h-12 rounded-xl text-base font-semibold shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                disabled={loading}
              >
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
              &copy; 2026 Siksha 'O' Anusandhan. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
