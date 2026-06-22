import { useState } from 'react';
import { Copy, History, Moon, RotateCcw, Sun } from 'lucide-react';
import { CoupleWorkspace, HabitDefinition, Layer, UserNames } from '../types';
import { cn } from '../lib/utils';
import { CHANGELOG_ENTRIES } from '../data/changelog';

type ThemeMode = 'light' | 'dark';

interface SettingsModalProps {
  userNames: UserNames;
  workspace: CoupleWorkspace | null;
  layers: Layer[];
  habitDefinitions: HabitDefinition[];
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  changeNames: (names: UserNames) => void;
  updateLayerColor: (id: string, color: string) => void;
  updateHabitDefinition: (id: string, updates: Partial<Pick<HabitDefinition, 'name' | 'color' | 'active'>>) => void;
  openChangelog: () => void;
  onClose: () => void;
}

export function SettingsModal({
  userNames,
  workspace,
  layers,
  habitDefinitions,
  theme,
  setTheme,
  changeNames,
  updateLayerColor,
  updateHabitDefinition,
  openChangelog,
  onClose,
}: SettingsModalProps) {
  const [nameDraft, setNameDraft] = useState<UserNames>(userNames);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [layerColorDrafts, setLayerColorDrafts] = useState(() => (
    Object.fromEntries(layers.map(layer => [layer.id, layer.color || '#c8e6d9'])) as Record<string, string>
  ));
  const [habitDrafts, setHabitDrafts] = useState(() => (
    Object.fromEntries(habitDefinitions.map(habit => [habit.id, {
      name: habit.name,
      color: habit.color,
      active: habit.active,
    }])) as Record<string, Pick<HabitDefinition, 'name' | 'color' | 'active'>>
  ));

  const getLayerName = (layer: Layer) => {
    if (layer.id === 'him_schedule') return `${userNames.him}'s Schedule`;
    if (layer.id === 'her_schedule') return `${userNames.her}'s Schedule`;
    return layer.name;
  };

  const copyInviteCode = async () => {
    if (!workspace?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(workspace.inviteCode);
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 1400);
    } catch {
      setCopiedInvite(false);
    }
  };

  const saveSettings = () => {
    changeNames(nameDraft);
    layers.forEach(layer => {
      const nextColor = layerColorDrafts[layer.id];
      if (nextColor && nextColor !== layer.color) updateLayerColor(layer.id, nextColor);
    });
    habitDefinitions.forEach(habit => {
      const draft = habitDrafts[habit.id];
      if (!draft) return;
      if (draft.name !== habit.name || draft.color !== habit.color || draft.active !== habit.active) {
        updateHabitDefinition(habit.id, draft);
      }
    });
    onClose();
  };
  const latestChangelog = CHANGELOG_ENTRIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191c1e]/25 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl border border-white/70 bg-white shadow-lg">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#eceef0] bg-white/95 px-5 py-4 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-display font-semibold text-[#191c1e]">Settings</h2>
            <p className="text-xs text-[#72787c] mt-0.5">Names, invite code, theme, colors, and habit setup.</p>
          </div>
          <button onClick={onClose} className="h-8 rounded-lg px-3 text-xs font-semibold text-[#72787c] hover:bg-black/5 transition-colors">
            Close
          </button>
        </div>

        <div className="p-5 space-y-5">
          <section className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-[#191c1e]">Couple Space</h3>
              <p className="text-xs text-[#72787c] mt-0.5">{workspace?.coupleName || 'Local Demo Workspace'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">His Name</span>
                <input
                  value={nameDraft.him}
                  onChange={event => setNameDraft(previous => ({ ...previous, him: event.target.value }))}
                  className="w-full h-10 rounded-lg border border-[#eceef0] bg-white px-3 text-sm outline-none focus:border-[#446172]"
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-semibold tracking-widest text-[#a0a5a9] uppercase mb-1.5">Her Name</span>
                <input
                  value={nameDraft.her}
                  onChange={event => setNameDraft(previous => ({ ...previous, her: event.target.value }))}
                  className="w-full h-10 rounded-lg border border-[#eceef0] bg-white px-3 text-sm outline-none focus:border-[#446172]"
                />
              </label>
            </div>
            {workspace?.inviteCode && (
              <button
                onClick={copyInviteCode}
                className="mt-3 h-9 rounded-lg bg-[#446172]/10 px-3 text-xs font-semibold text-[#446172] flex items-center gap-1.5 hover:bg-[#446172]/20 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedInvite ? 'Invite code copied' : `Invite code: ${workspace.inviteCode}`}
              </button>
            )}
          </section>

          <section className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-4">
            <h3 className="text-sm font-semibold text-[#191c1e] mb-3">Appearance</h3>
            <div className="inline-flex rounded-lg border border-[#eceef0] bg-white p-1">
              <button
                onClick={() => setTheme('light')}
                className={cn("h-8 rounded-md px-3 text-xs font-semibold flex items-center gap-1.5", theme === 'light' ? "bg-[#446172] text-white" : "text-[#72787c] hover:bg-black/5")}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn("h-8 rounded-md px-3 text-xs font-semibold flex items-center gap-1.5", theme === 'dark' ? "bg-[#446172] text-white" : "text-[#72787c] hover:bg-black/5")}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          </section>

          {latestChangelog && (
            <section className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#191c1e]">更新日志</h3>
                  <p className="mt-0.5 text-xs text-[#72787c]">{latestChangelog.date} · {latestChangelog.title}</p>
                </div>
                <button
                  onClick={openChangelog}
                  className="h-8 shrink-0 rounded-lg bg-[#446172]/10 px-3 text-xs font-semibold text-[#446172] flex items-center gap-1.5 hover:bg-[#446172]/20 transition-colors"
                >
                  <History className="h-3.5 w-3.5" />
                  查看
                </button>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-[#191c1e]">Layer Colors</h3>
              <p className="text-xs text-[#72787c] mt-0.5">These colors drive personal schedules, custom layers, and calendar event chips.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {layers.map(layer => (
                <label key={layer.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#eceef0] bg-white px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-[#42474c]">{getLayerName(layer)}</span>
                  <input
                    type="color"
                    value={layerColorDrafts[layer.id] || layer.color || '#c8e6d9'}
                    onChange={event => setLayerColorDrafts(previous => ({ ...previous, [layer.id]: event.target.value }))}
                    className="h-8 w-10 shrink-0 cursor-pointer rounded border border-[#eceef0] bg-white"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#eceef0] bg-[#fbfcfd] p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-[#191c1e]">Habits</h3>
              <p className="text-xs text-[#72787c] mt-0.5">Rename habits, change their dot color, or remove them from future logging.</p>
            </div>
            <div className="space-y-2">
              {habitDefinitions.map(habit => {
                const draft = habitDrafts[habit.id] || habit;
                return (
                  <div key={habit.id} className={cn("rounded-lg border border-[#eceef0] bg-white p-3", !draft.active && "opacity-60")}>
                    <div className="flex items-center gap-2">
                      <input
                        value={draft.name}
                        onChange={event => setHabitDrafts(previous => ({
                          ...previous,
                          [habit.id]: { ...draft, name: event.target.value },
                        }))}
                        className="min-w-0 flex-1 h-9 rounded-lg border border-[#eceef0] bg-[#fbfcfd] px-3 text-sm outline-none focus:border-[#446172]"
                      />
                      <input
                        type="color"
                        value={draft.color}
                        onChange={event => setHabitDrafts(previous => ({
                          ...previous,
                          [habit.id]: { ...draft, color: event.target.value },
                        }))}
                        className="h-9 w-10 shrink-0 cursor-pointer rounded border border-[#eceef0] bg-white"
                      />
                      <button
                        onClick={() => setHabitDrafts(previous => ({
                          ...previous,
                          [habit.id]: { ...draft, active: !draft.active },
                        }))}
                        className="h-9 rounded-lg px-2 text-xs font-semibold text-[#72787c] hover:bg-black/5 transition-colors"
                      >
                        {draft.active ? 'Remove' : <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Restore</span>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-[#eceef0] bg-white/95 px-5 py-4 backdrop-blur-md">
          <button onClick={onClose} className="h-9 rounded-lg px-3 text-sm font-medium text-[#72787c] hover:bg-black/5 transition-colors">Cancel</button>
          <button onClick={saveSettings} className="h-9 rounded-lg bg-[#446172] px-4 text-sm font-semibold text-white hover:bg-[#446172]/90 transition-colors">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
