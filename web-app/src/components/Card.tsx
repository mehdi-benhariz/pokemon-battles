import { useCallback, useState, type FC, type MouseEvent } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { useTheme } from "./ThemeContext";
import type { PokemonSummary } from "../types";

interface CardProps {
    pokemon: PokemonSummary;
    selected: boolean;
    onSelect: () => void;
}

function throttle<T extends (...args: never[]) => void>(
    func: T,
    delay: number = 100
): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = new Date().getTime();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      func(...args);
    };
}

const Card: FC<CardProps> = ({ pokemon, selected, onSelect }) => {
    const { theme } = useTheme();
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onMouseMove = useCallback(
        throttle((e: MouseEvent<HTMLButtonElement>) => {
          if (reduceMotion) return;
          const card = e.currentTarget;
          const box = card.getBoundingClientRect();
          const x = e.clientX - box.left;
          const y = e.clientY - box.top;
          const centerX = box.width / 2;
          const centerY = box.height / 2;
          const rotateX = (y - centerY) / 12;
          const rotateY = (centerX - x) / 12;

          setRotate({ x: rotateX, y: rotateY });
        }),
        [reduceMotion]
    );

    const onMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
    };

    const shell = theme === "light"
      ? "from-orange-200 via-amber-50 to-orange-200 border-orange-200"
      : "from-slate-600 via-slate-700 to-slate-600 border-slate-500";
    const inner = theme === "light" ? "bg-white/95" : "bg-slate-800/95";

    return (
        <button
        type="button"
        aria-pressed={selected}
        className={`group relative w-full max-w-[250px] cursor-pointer rounded-2xl border-[3px] bg-gradient-to-br p-1 text-left shadow-[4px_4px_0_rgba(249,115,22,0.2)] transition-shadow duration-200 hover:shadow-[6px_6px_0_rgba(249,115,22,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${shell} ${selected ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onSelect}
        style={
          reduceMotion
            ? undefined
            : {
                transform: `perspective(900px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                transition: "transform 200ms ease-out",
              }
        }
        >
            {selected && (
              <IoCheckmarkCircle
                className="absolute right-3 top-3 z-10 size-6 text-orange-500 drop-shadow"
                aria-hidden
              />
            )}
            <div className={`rounded-xl ${inner}`}>
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display text-lg font-semibold capitalize leading-tight">
                      {pokemon.name}
                    </span>
                    <span className="shrink-0 rounded-lg bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800 dark:bg-red-950 dark:text-red-200">
                      HP {pokemon.stats.HP}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pokemon.apiTypes.map((type) => (
                      <span
                        key={type.name}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs capitalize dark:bg-slate-700"
                      >
                        <img className="size-4" src={type.image} alt="" />
                        {type.name}
                      </span>
                    ))}
                  </div>
                  <div className={`mx-auto flex aspect-square w-full max-w-[140px] items-center justify-center rounded-xl ${theme === "light" ? "bg-[#FFF7ED]" : "bg-slate-900"}`}>
                    <img
                      className="h-auto max-h-[120px] w-auto max-w-full object-contain"
                      src={pokemon.image}
                      alt={pokemon.name}
                      loading="lazy"
                      decoding="async"
                      width={120}
                      height={120}
                    />
                  </div>
                  <dl className="grid grid-cols-3 gap-1 text-center text-xs font-medium">
                    <div className="rounded-lg bg-orange-50 py-1.5 dark:bg-slate-700/80">
                      <dt className="text-slate-500 dark:text-slate-400">Atk</dt>
                      <dd>{pokemon.stats.attack}</dd>
                    </div>
                    <div className="rounded-lg bg-blue-50 py-1.5 dark:bg-slate-700/80">
                      <dt className="text-slate-500 dark:text-slate-400">Def</dt>
                      <dd>{pokemon.stats.defense}</dd>
                    </div>
                    <div className="rounded-lg bg-green-50 py-1.5 dark:bg-slate-700/80">
                      <dt className="text-slate-500 dark:text-slate-400">Spd</dt>
                      <dd>{pokemon.stats.speed}</dd>
                    </div>
                  </dl>
                </div>
              </div>
        </button>
    )
}

export default Card;
