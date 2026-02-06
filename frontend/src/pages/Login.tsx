import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react';

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: any) => any;
                };
            };
        };
    }
}

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleDemoLogin = () => {
        setEmail('demo@example.com');
        setPassword('demo123');
        setIsLogin(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, name);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // For demo purposes - in production, use Google Sign-In library
        // This requires setting up Google OAuth in index.html
        if (window.google) {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                scope: 'email profile',
                callback: async (response: any) => {
                    if (response.access_token) {
                        try {
                            await loginWithGoogle(response.access_token);
                            navigate('/');
                        } catch (err: any) {
                            setError(err.message || 'Google login failed');
                        }
                    }
                },
            });
            client.requestAccessToken();
        } else {
            setError('Google Sign-In not available. Please use email/password.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-3xl" />
                <div className="absolute top-20 left-[10%] w-48 h-48 rounded-full bg-amber-500/10 blur-3xl animate-breathe" />
                <div className="absolute bottom-20 right-[10%] w-56 h-56 rounded-full bg-amber-400/10 blur-2xl animate-breathe" style={{ animationDelay: "2s" }} />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <div className="relative inline-block">
                            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 blur-xl animate-breathe" />
                            <div className="w-20 h-20 relative rounded-full overflow-hidden golden-glow border-2 border-amber-400/50">
                                <img src="/abimanyu_logo.png" alt="Abimanyu" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold abimanyu-title mt-4">Abimanyu</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Divine Wisdom Awaits</p>
                </div>

                {/* Form Card */}
                <div className="glass-card rounded-2xl p-8 shadow-divine">
                    <div className="flex mb-6">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-sm font-medium transition-all ${isLogin ? 'text-amber-400 border-b-2 border-amber-400' : 'text-muted-foreground border-b border-border/50'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-medium transition-all ${!isLogin ? 'text-amber-400 border-b-2 border-amber-400' : 'text-muted-foreground border-b border-border/50'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-border/50"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-border/50"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full pl-11 pr-11 py-3 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-border/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 gradient-divine rounded-xl text-primary-foreground font-medium transition-all hover:scale-[1.02] hover:shadow-glow active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-border/50" />
                        <span className="text-xs text-muted-foreground">or continue with</span>
                        <div className="flex-1 h-px bg-border/50" />
                    </div>

                    {/* Demo Login Button */}
                    {isLogin && (
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="w-full py-2 mb-4 glass-card rounded-xl border border-amber-500/30 text-amber-400 font-medium transition-all hover:bg-amber-500/10 text-sm"
                        >
                            Try Demo Account (demo@example.com)
                        </button>
                    )}

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-3 glass-card rounded-xl border border-border/50 font-medium transition-all hover:bg-white/5 flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-6">
                    By continuing, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
};

export default Login;
