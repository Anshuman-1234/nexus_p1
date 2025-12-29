import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BookOpen, AlertCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, login } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
        } else {
            setPasswordError('');
        }
    }, [formData.password, formData.confirmPassword]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwordError) return;

        setError('');
        setLoading(true);

        try {
            await register(formData.username, formData.email, formData.password);
            // Auto-login after registration or redirect to login? 
            // User request says "Redirect to Login" implies separate step, but auto-login is nicer.
            // Let's redirect to login as per implied flow "Success: Redirect to Login" (implied in standard flows)
            // Actually user didn't specify post-register action. I'll auto-login.
            // Auto-login after registration or redirect to login? 
            // User request says "Redirect to Login" implies separate step, but auto-login is nicer.
            // Let's redirect to login as per implied flow "Success: Redirect to Login" (implied in standard flows)
            // Actually user didn't specify post-register action. I'll auto-login.
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <BookOpen className="h-12 w-12 mx-auto text-primary-600" />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Create an Account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Join the library management system
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Input
                            id="username"
                            type="text"
                            label="Full Name"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="John Doe"
                        />

                        <Input
                            id="email"
                            type="email"
                            label="Email address"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@college.edu"
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />

                        <Input
                            id="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            error={passwordError}
                        />

                        <div>
                            <Button type="submit" className="w-full" disabled={loading || !!passwordError}>
                                {loading ? 'Creating Account...' : 'Register'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
