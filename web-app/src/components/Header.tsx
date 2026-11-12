import { useTheme } from "./ThemeContext";
import ThemeSwitcher from "./ThemeSwitcher";

export function Header() {
    const { theme } = useTheme();

    return (
        <header className={`${theme === "light" ? "bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]" : "bg-slate-900 text-white border-slate-700"} sticky top-0 z-20 w-full border-b-[3px] shadow-[0_4px_24px_rgba(249,115,22,0.12)]`}>
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">Gotta battle &apos;em all</p>
                    <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">PokeBattle</h1>
                </div>
                <ThemeSwitcher/>
            </div>
        </header>
    );
}
