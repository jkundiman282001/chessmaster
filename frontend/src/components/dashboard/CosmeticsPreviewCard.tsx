import { Sparkles, Palette } from 'lucide-react'

export function CosmeticsPreviewCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-400" />
          Equipped Loadout
        </h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          Default Tier
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-[#769656] border border-[#eeeed2]/40 flex items-center justify-center text-[10px] shadow-sm">
              🏁
            </span>
            <div>
              <div className="font-semibold text-slate-200">Classic Emerald</div>
              <div className="text-[10px] text-slate-500">Standard Tournament Board</div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400">Equipped</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs shadow-sm">
              ♚
            </span>
            <div>
              <div className="font-semibold text-slate-200">Staunton Classical</div>
              <div className="text-[10px] text-slate-500">Standard Vector Pieces</div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400">Equipped</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-500">
        <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>Cosmetics system & skins inventory will unlock in future update.</span>
      </div>
    </div>
  )
}
