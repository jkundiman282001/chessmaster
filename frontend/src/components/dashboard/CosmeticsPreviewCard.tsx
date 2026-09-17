import { Sparkles, Palette, CheckCircle2 } from 'lucide-react'

export function CosmeticsPreviewCard() {
  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-400" />
          <span>Equipped Loadout</span>
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-400 border border-white/5">
          Default Tier
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#769656] border border-[#eeeed2]/40 flex items-center justify-center text-xs shadow-sm">
              🏁
            </div>
            <div>
              <div className="font-bold text-slate-200">Classic Emerald</div>
              <div className="text-[11px] text-slate-400">Tournament Vinyl Board</div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Equipped
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shadow-sm font-serif">
              ♚
            </div>
            <div>
              <div className="font-bold text-slate-200">Classic Pieces</div>
              <div className="text-[11px] text-slate-400">White &amp; Black Classic Set</div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Equipped
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Custom board skins & piece sets ready for Phase 5 cosmetics update.</span>
      </div>
    </div>
  )
}
