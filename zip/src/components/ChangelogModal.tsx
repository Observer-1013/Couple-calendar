import { History, X } from 'lucide-react';
import { CHANGELOG_ENTRIES } from '../data/changelog';

interface ChangelogModalProps {
  onClose: () => void;
}

export function ChangelogModal({ onClose }: ChangelogModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191c1e]/25 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[86vh] overflow-y-auto no-scrollbar rounded-2xl border border-white/70 bg-white shadow-lg">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#eceef0] bg-white/95 px-5 py-4 backdrop-blur-md">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-[#446172]">
              <History className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Update Log</span>
            </div>
            <h2 className="text-xl font-display font-semibold text-[#191c1e]">What's New</h2>
            <p className="mt-0.5 text-xs text-[#72787c]">A quick record of recent CoupleSync changes.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#72787c] hover:bg-black/5 transition-colors"
            title="Close update log"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {CHANGELOG_ENTRIES.map(entry => (
            <section key={entry.id} className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#191c1e]">{entry.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#72787c]">{entry.summary}</p>
                </div>
                <span className="shrink-0 rounded-md bg-[#446172]/10 px-2 py-1 text-[10px] font-semibold text-[#446172]">
                  {entry.date}
                </span>
              </div>
              <ul className="space-y-2">
                {entry.items.map(item => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-[#42474c]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8cb3a1]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="sticky bottom-0 flex justify-end border-t border-[#eceef0] bg-white/95 px-5 py-4 backdrop-blur-md">
          <button onClick={onClose} className="h-9 rounded-lg bg-[#446172] px-4 text-sm font-semibold text-white hover:bg-[#446172]/90 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
