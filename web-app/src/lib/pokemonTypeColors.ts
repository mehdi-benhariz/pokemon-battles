/** Tailwind classes for type filter chips (light selected / unselected). */
const TYPE_CHIP: Record<string, { selected: string; idle: string }> = {
  normal: { selected: 'bg-stone-500 text-white ring-stone-600', idle: 'bg-stone-200 text-stone-800 hover:bg-stone-300' },
  fire: { selected: 'bg-orange-500 text-white ring-orange-600', idle: 'bg-orange-100 text-orange-900 hover:bg-orange-200' },
  water: { selected: 'bg-blue-500 text-white ring-blue-600', idle: 'bg-blue-100 text-blue-900 hover:bg-blue-200' },
  electric: { selected: 'bg-yellow-400 text-slate-900 ring-yellow-500', idle: 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200' },
  grass: { selected: 'bg-green-500 text-white ring-green-600', idle: 'bg-green-100 text-green-900 hover:bg-green-200' },
  ice: { selected: 'bg-cyan-400 text-slate-900 ring-cyan-500', idle: 'bg-cyan-100 text-cyan-900 hover:bg-cyan-200' },
  fighting: { selected: 'bg-red-700 text-white ring-red-800', idle: 'bg-red-100 text-red-900 hover:bg-red-200' },
  poison: { selected: 'bg-purple-500 text-white ring-purple-600', idle: 'bg-purple-100 text-purple-900 hover:bg-purple-200' },
  ground: { selected: 'bg-amber-700 text-white ring-amber-800', idle: 'bg-amber-100 text-amber-900 hover:bg-amber-200' },
  flying: { selected: 'bg-indigo-400 text-white ring-indigo-500', idle: 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200' },
  psychic: { selected: 'bg-pink-500 text-white ring-pink-600', idle: 'bg-pink-100 text-pink-900 hover:bg-pink-200' },
  bug: { selected: 'bg-lime-600 text-white ring-lime-700', idle: 'bg-lime-100 text-lime-900 hover:bg-lime-200' },
  rock: { selected: 'bg-amber-800 text-white ring-amber-900', idle: 'bg-amber-100 text-amber-950 hover:bg-amber-200' },
  ghost: { selected: 'bg-violet-600 text-white ring-violet-700', idle: 'bg-violet-100 text-violet-900 hover:bg-violet-200' },
  dragon: { selected: 'bg-indigo-700 text-white ring-indigo-800', idle: 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200' },
  dark: { selected: 'bg-slate-700 text-white ring-slate-800', idle: 'bg-slate-200 text-slate-900 hover:bg-slate-300' },
  steel: { selected: 'bg-slate-500 text-white ring-slate-600', idle: 'bg-slate-100 text-slate-800 hover:bg-slate-200' },
  fairy: { selected: 'bg-rose-400 text-slate-900 ring-rose-500', idle: 'bg-rose-100 text-rose-900 hover:bg-rose-200' },
};

const defaultChip = {
  selected: 'bg-orange-500 text-white ring-orange-600',
  idle: 'bg-amber-100 text-slate-800 hover:bg-amber-200',
};

export function typeChipClasses(typeName: string, selected: boolean): string {
  const palette = TYPE_CHIP[typeName] ?? defaultChip;
  const base =
    'rounded-full min-h-11 px-3.5 py-2 capitalize text-sm font-medium transition-all duration-200 cursor-pointer ring-2 ring-transparent focus-visible:outline-none focus-visible:ring-orange-500 focus-visible:ring-offset-2';
  return `${base} ${selected ? `${palette.selected} shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]` : palette.idle}`;
}
