import { Github, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  loading: boolean;
  error: string | null;
  signInWithGitHub: () => void;
}

export function AuthScreen({ loading, error, signInWithGitHub }: AuthScreenProps) {
  return (
    <div className="min-h-screen w-screen bg-[#f7f9fb] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white/60 backdrop-blur-md shadow-sm p-6">
        <div className="mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#446172] text-white flex items-center justify-center font-display font-semibold text-xl mb-4">
            U
          </div>
          <h1 className="text-2xl font-display font-semibold text-[#191c1e]">CoupleSync</h1>
          <p className="text-sm text-[#72787c] mt-1">Sign in to your shared calendar space.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[#a65d5d]/20 bg-[#a65d5d]/10 px-3 py-2 text-xs text-[#7b3f3f]">
            {error}
          </div>
        )}

        <button
          onClick={signInWithGitHub}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-[#191c1e] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#303437] disabled:opacity-60 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
          Continue with GitHub
        </button>

        <p className="text-[11px] leading-relaxed text-[#72787c] mt-4">
          GitHub login requires the GitHub provider to be enabled in Supabase Auth settings.
        </p>
      </div>
    </div>
  );
}
