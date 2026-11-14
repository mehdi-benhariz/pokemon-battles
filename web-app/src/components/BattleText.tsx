import type { FC, ReactNode } from 'react';
import { inlinePlain, parseBattleText, type Inline } from '../lib/battleText';

function renderInline(nodes: Inline[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    if (node.type === 'text') return <span key={key}>{node.value}</span>;
    const children = renderInline(node.children, key);
    if (node.type === 'strong') {
      return (
        <strong key={key} className="font-semibold text-slate-900 dark:text-white">
          {children}
        </strong>
      );
    }
    return <em key={key}>{children}</em>;
  });
}

export const BattleText: FC<{ text: string }> = ({ text }) => {
  const blocks = parseBattleText(text);
  if (blocks.length === 0) return null;

  return (
    <article
      aria-label="Battle result"
      className="mt-4 max-w-[68ch] space-y-3 text-[15px] leading-7 text-slate-700 dark:text-slate-200"
    >
      {blocks.map((block, index) => {
        const children = renderInline(block.children, String(index));
        if (block.type === 'heading') {
          return (
            <h3
              key={index}
              className="font-display text-2xl font-semibold leading-tight text-[#9A3412] dark:text-orange-100"
            >
              {children}
            </h3>
          );
        }
        if (block.type === 'turn') {
          return (
            <p key={index} className="pt-1">
              {children}
            </p>
          );
        }
        if (block.type === 'hp') {
          return (
            <p
              key={index}
              className="border-l-[3px] border-orange-400 bg-orange-50 py-1 pl-3 text-sm font-semibold text-orange-900 dark:border-orange-500 dark:bg-orange-950/40 dark:text-orange-100"
            >
              {inlinePlain(block.children)}
            </p>
          );
        }
        if (block.type === 'winner') {
          return (
            <p
              key={index}
              className="border-t-2 border-orange-200 pt-3 font-semibold leading-snug text-blue-800 dark:border-slate-600 dark:text-blue-200 [&_strong]:text-inherit"
            >
              {children}
            </p>
          );
        }
        return <p key={index}>{children}</p>;
      })}
    </article>
  );
};
