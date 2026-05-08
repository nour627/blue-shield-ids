import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, Lock, User as UserIcon } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Math CAPTCHA state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: num1 + num2 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check CAPTCHA if needed
    if (failedAttempts >= 3 && parseInt(captchaInput) !== captcha.answer) {
      setError('Incorrect CAPTCHA verification');
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
      setFailedAttempts(prev => prev + 1);
      if (failedAttempts + 1 >= 3) {
        generateCaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#131B2B] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative z-10">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <ShieldCheck className="text-blue-500 w-8 h-8" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">Secure Access</h2>
          <p className="text-gray-400 text-center mb-8 text-sm">Aegis Threat Intelligence Platform</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#0F1522] border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0F1522] border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
              />
            </div>

            {/* Simulated CAPTCHA */}
            {failedAttempts >= 3 && (
              <div className="bg-[#0F1522] border border-orange-500/30 rounded-xl p-4 space-y-3">
                <p className="text-orange-400 text-xs font-medium uppercase tracking-wider text-center">Verification Required</p>
                <div className="flex items-center gap-3">
                  <div className="bg-[#1A2333] text-white px-4 py-2 rounded-lg border border-gray-700 font-mono text-lg flex-1 text-center">
                    {captcha.num1} + {captcha.num2} = ?
                  </div>
                  <input
                    type="number"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Result"
                    required
                    className="w-24 bg-[#0F1522] border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 text-center font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex justify-between text-sm text-gray-400">
            <Link to="/register" className="hover:text-white transition-colors">Create Account</Link>
            <Link to="/forgot-password" className="hover:text-white transition-colors">Forgot Password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
