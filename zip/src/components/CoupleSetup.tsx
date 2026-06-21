import { FormEvent, useState } from 'react';
import { HeartHandshake, Loader2, LogOut } from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';

interface CoupleSetupProps {
  loading: boolean;
  error: string | null;
  createCouple: (name: string, role: User) => Promise<void>;
  joinCouple: (inviteCode: string, role: User) => Promise<void>;
  signOut: () => void;
}

export function CoupleSetup({ loading, error, createCouple, joinCouple, signOut }: CoupleSetupProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('Our Calendar');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState<User>('him');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === 'create') {
      await createCouple(name.trim() || 'Our Calendar', role);
    } else {
      await joinCouple(inviteCode.trim(), role);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#f7f9fb] flex items-center justify-center p-6 font-sans">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/70 bg-white/60 backdrop-blur-md shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="w-11 h-11 rounded-xl bg-[#446172] text-white flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-display font-semibold text-[#191c1e]">Set up your space</h1>
            <p className="text-sm text-[#72787c] mt-1">Create a couple workspace or join with an invite code.</p>
          </div>
          <button type="button" onClick={signOut} className="p-2 rounded-full text-[#72787c] hover:bg-black/5 transition-colors" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mb-5 p-1 bg-white/60 rounded-lg border border-[#eceef0]">
          {(['create', 'join'] as const).map(nextMode => (
            <button
              key={nextMode}
              type="button"
              onClick={() => setMode(nextMode)}
              className={cn(
                'flex-1 text-xs py-1.5 font-medium rounded-md transition-colors',
                mode === nextMode ? 'bg-white shadow-sm text-[#191c1e]' : 'text-[#72787c]',
              )}
            >
              {nextMode === 'create' ? 'Create' : 'Join'}
            </button>
          ))}
        </div>

        {mode === 'create' ? (
          <label className="block mb-4">
            <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-2">Workspace Name</span>
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              className="w-full h-10 rounded-lg border border-[#eceef0] bg-white/80 px-3 text-sm outline-none focus:border-[#446172]"
            />
          </label>
        ) : (
          <label className="block mb-4">
            <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-2">Invite Code</span>
            <input
              value={inviteCode}
              onChange={event => setInviteCode(event.target.value)}
              className="w-full h-10 rounded-lg border border-[#eceef0] bg-white/80 px-3 text-sm outline-none focus:border-[#446172]"
              placeholder="e.g. a1b2c3d4e5"
            />
          </label>
        )}

        <div className="mb-5">
          <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-2">Your Role</span>
          <div className="grid grid-cols-2 gap-2">
            {(['him', 'her'] as const).map(nextRole => (
              <button
                key={nextRole}
                type="button"
                onClick={() => setRole(nextRole)}
                className={cn(
                  'h-10 rounded-lg border text-sm font-medium transition-colors',
                  role === nextRole ? 'border-[#446172] bg-[#c8e6d9]/60 text-[#191c1e]' : 'border-[#eceef0] bg-white/60 text-[#72787c]',
                )}
              >
                {nextRole === 'him' ? 'His side' : 'Her side'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[#a65d5d]/20 bg-[#a65d5d]/10 px-3 py-2 text-xs text-[#7b3f3f]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (mode === 'join' && !inviteCode.trim())}
          className="w-full h-11 rounded-xl bg-[#446172] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#446172]/90 disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Create Workspace' : 'Join Workspace'}
        </button>
      </form>
    </div>
  );
}
