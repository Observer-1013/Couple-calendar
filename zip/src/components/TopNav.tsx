import { ViewMode, UserNames } from '../types';
import { Bell, LogOut, Settings, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopNavProps {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  userNames: UserNames;
  changeNames: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onSignOut?: () => void;
}

export function TopNav({ viewMode, setViewMode, userNames, changeNames, onOpenSearch, onOpenNotifications, onSignOut }: TopNavProps) {
  const views: ViewMode[] = ['Day', 'Week', 'Month', 'Year'];

  return (
    <header className="min-h-16 flex flex-wrap items-center justify-between gap-y-2 px-3 md:px-6 py-2 md:py-0 bg-white/40 backdrop-blur-md border-b border-white/50 shrink-0 z-10 relative">
      <div className="order-1 flex items-center gap-3 md:gap-12">
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#446172] tracking-tight">Union</h1>
      </div>

      <div className="order-2 md:order-3 flex items-center gap-1 md:gap-4 text-[#72787c]">
        <button onClick={onOpenSearch} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Search" aria-label="Search"><Search className="w-5 h-5" /></button>
        <button onClick={onOpenNotifications} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Notifications" aria-label="Notifications"><Bell className="w-5 h-5" /></button>
        <button onClick={changeNames} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Change User Names"><Settings className="w-5 h-5" /></button>
        {onSignOut && (
          <button onClick={onSignOut} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-[32px] h-8 rounded-full overflow-hidden ml-1 md:ml-2 border border-white/60 shadow-sm bg-blue-100 flex items-center justify-center px-2">
          <span className="text-xs font-semibold text-blue-700">{userNames.him.charAt(0)}</span>
          <span className="text-xs text-blue-700/50 mx-0.5">&</span>
          <span className="text-xs font-semibold text-blue-700">{userNames.her.charAt(0)}</span>
        </div>
      </div>

      <nav className="order-last md:order-2 basis-full md:basis-auto flex items-center gap-1 md:gap-6 bg-black/5 px-1 md:px-4 py-1 md:py-1.5 rounded-full">
        {views.map(v => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={cn(
              "flex-1 md:flex-none text-xs md:text-sm font-medium transition-colors py-1 px-2 md:px-4 rounded-full",
              viewMode === v ? "bg-white text-[#446172] shadow-sm" : "text-[#72787c] hover:text-[#446172]"
            )}
          >
            {v === 'Day' ? '日' : v === 'Week' ? '周' : v === 'Month' ? '月' : '年'}
          </button>
        ))}
      </nav>
    </header>
  );
}
