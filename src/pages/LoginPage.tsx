import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/authStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((s) => s.signInWithMagicLink);
  const navigate = useNavigate();

  const handleDemoLogin = (role: 'inspector' | 'admin') => {
    useAuthStore.getState().setUser({
      id: role === 'admin' ? 'demo-admin' : 'demo-user',
      email: role === 'admin' ? 'manager@recc.co.uk' : 'inspector@recc.co.uk',
      fullName: role === 'admin' ? 'Demo Manager' : 'Demo Inspector',
      role,
    });
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setLoading(true);
    const result = await signIn(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <h1 className="font-headline text-5xl font-black uppercase tracking-tight text-accent leading-none">
              AUTO INSPECT PRO
            </h1>
            <p className="font-body text-sm text-white/30 mt-3">
              Vehicle inspection platform
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-pass/10 rounded-2xl flex items-center justify-center mx-auto border border-pass/20">
                <span className="text-pass text-2xl">✓</span>
              </div>
              <h2 className="font-headline text-xl font-black uppercase text-white">CHECK YOUR EMAIL</h2>
              <p className="font-body text-sm text-white/40">
                We sent a sign in link to <strong className="text-white">{email}</strong>. Click the link in the email to sign in.
              </p>
              <button
                onClick={() => setSent(false)}
                className="font-body text-sm text-accent underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.co.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              {error && (
                <p className="text-sm font-body text-fail">{error}</p>
              )}
              <Button variant="accent" fullWidth type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Sign In Link'}
              </Button>

              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-primary px-4 text-xs font-body text-white/20">or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="ghost" fullWidth onClick={() => handleDemoLogin('inspector')}>
                  Continue as Demo Inspector
                </Button>
                <Button variant="ghost" fullWidth onClick={() => handleDemoLogin('admin')} className="!border-accent/20 !text-accent/60 hover:!text-accent hover:!border-accent/40">
                  Continue as Demo Manager
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-xs font-body text-white/15">
          Really Easy Car Credit
        </p>
      </div>
    </div>
  );
}
