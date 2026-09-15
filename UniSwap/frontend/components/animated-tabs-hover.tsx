'use client';

import { AnimatedBackground } from '@/components/motion-primitives/animated-background';

interface Tab {
  label: string;
  href: string;
}

export function AnimatedTabsHover() {
  const TABS: Tab[] = [
    { label: 'Marketplace', href: '#marketplace' },
    { label: 'Categories', href: '#categories' },
    { label: 'Request an Item', href: '/request-item' },
    { label: 'How it works', href: '#how-it-works' },
  ];

  return (
    <div className="flex flex-row">
      <AnimatedBackground
        defaultValue={TABS[0].label}
        className="rounded-md bg-brand-soft"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
        enableHover
      >
        {TABS.map((tab, index) => (
          <a
            key={index}
            href={tab.href}
            data-id={tab.label}
            className="relative px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-brand"
          >
            {tab.label}
          </a>
        ))}
      </AnimatedBackground>
    </div>
  );
}
