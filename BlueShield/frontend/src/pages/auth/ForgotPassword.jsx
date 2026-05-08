import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call for password reset
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#131B2B] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative z-10">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <ShieldCheck className="text-blue-500 w-8 h-8" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">Account Recovery</h2>
          <p className="text-gray-400 text-center mb-8 text-sm px-4">
            Enter your registered email address to receive reset instructions.
          </p>

          {submitted ? (
            <div className="text-center space-y-6">
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl text-sm">
                If an account exists with {email}, you will receive a password reset link shortly.
              </div>
              <Link to="/login" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0F1522] border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Request...' : 'Send Reset Link'}
              </button>
              
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
