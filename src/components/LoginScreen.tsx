import { useState } from 'react';
import { Mail, Lock, LogIn, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isSignUp ? '/api/signup' : '/api/login';
      const body = isSignUp
        ? JSON.stringify({ name, username, email, password })
        : JSON.stringify({ email, password });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setError('');
          onLogin(data.user);
        } else {
          setError(data.message || (isSignUp ? 'Sign up failed' : 'Invalid email or password'));
        }
      } else {
        setError(isSignUp ? 'Sign up failed' : 'Invalid email or password');
      }
    } catch (err) {
      setError(`An error occurred during ${isSignUp ? 'sign up' : 'login'}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 md:px-0">
      {/* Background Texture */}
      <div className="absolute inset-0 texture-overlay pointer-events-none z-0"></div>

      {/* Decorative Corner Accents */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-outline-variant opacity-50 z-0"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-outline-variant opacity-50 z-0"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-outline-variant opacity-50 z-0"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-outline-variant opacity-50 z-0"></div>

      <div className="w-full max-w-md z-10 flex flex-col gap-16">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center">
          <img
            src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/scorekeeper.png?v=1786003535"
            alt="Blackout Hockey: Master the Game"
            className="w-full max-w-sm h-auto object-contain"
          />
        </div>

        {/* Login Form Container */}
        <div className="bevel-container rounded-lg p-6 md:p-10 flex flex-col gap-6">
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="bg-error/10 border border-error/50 text-error px-4 py-2 rounded text-sm font-mono text-center">
                {error}
              </div>
            )}

            {/* Name Input (Sign Up Only) */}
            {isSignUp && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[12px] font-bold tracking-widest text-on-surface-variant uppercase" htmlFor="name">
                    Name
                  </label>
                  <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded input-focus-ring transition-all duration-200">
                    <UserIcon className="w-5 h-5 text-on-surface-variant absolute left-4 pointer-events-none" />
                    <input
                      className="w-full bg-transparent border-none text-on-surface pl-12 pr-4 py-3 focus:ring-0 placeholder:text-outline outline-none"
                      id="name"
                      placeholder="Full Name"
                      required={isSignUp}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[12px] font-bold tracking-widest text-on-surface-variant uppercase" htmlFor="username">
                    Username
                  </label>
                  <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded input-focus-ring transition-all duration-200">
                    <UserIcon className="w-5 h-5 text-on-surface-variant absolute left-4 pointer-events-none" />
                    <input
                      className="w-full bg-transparent border-none text-on-surface pl-12 pr-4 py-3 focus:ring-0 placeholder:text-outline outline-none"
                      id="username"
                      placeholder="Username"
                      required={isSignUp}
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[12px] font-bold tracking-widest text-on-surface-variant uppercase" htmlFor="email">
                Email
              </label>
              <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded input-focus-ring transition-all duration-200">
                <Mail className="w-5 h-5 text-on-surface-variant absolute left-4 pointer-events-none" />
                <input
                  className="w-full bg-transparent border-none text-on-surface pl-12 pr-4 py-3 focus:ring-0 placeholder:text-outline outline-none"
                  id="email"
                  placeholder="player@blackouthockey.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1 mt-4">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[12px] font-bold tracking-widest text-on-surface-variant uppercase" htmlFor="password">
                  Password
                </label>
                {!isSignUp && (
                  <button type="button" className="font-mono text-[12px] font-bold tracking-widest text-tertiary hover:text-tertiary-fixed-dim transition-colors uppercase">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded input-focus-ring transition-all duration-200">
                <Lock className="w-5 h-5 text-on-surface-variant absolute left-4 pointer-events-none" />
                <input
                  className="w-full bg-transparent border-none text-on-surface pl-12 pr-4 py-3 focus:ring-0 placeholder:text-outline outline-none"
                  id="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              className="btn-primary w-full py-4 mt-6 rounded font-mono text-[12px] font-bold tracking-widest uppercase text-on-tertiary flex items-center justify-center gap-2 transition-transform duration-150 active:scale-95"
              type="submit"
            >
              <LogIn className="w-4 h-4" strokeWidth={3} />
              {isSignUp ? 'SIGN UP' : 'LOGIN'}
            </button>
          </form>

            {/* Guest Login Action */}
            <button
              className="btn-secondary w-full py-3 rounded font-mono text-[12px] font-bold tracking-widest uppercase text-tertiary border border-tertiary hover:bg-tertiary/10 flex items-center justify-center gap-2 transition-transform duration-150 active:scale-95"
              type="button"
              onClick={() => onLogin({ id: 'guest', email: 'guest@blackouthockey.com', role: 'Guest' })}
            >
              CONTINUE AS GUEST
            </button>


          <div className="flex flex-col items-center gap-4 mt-2">
            <p className="text-[16px] text-on-surface-variant">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <button
                type="button"
                className="text-tertiary font-bold hover:underline underline-offset-4"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
              >
                {isSignUp ? 'Login' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
