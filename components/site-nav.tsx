"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/strategies", label: "Strategies" },
  { href: "/speaking", label: "Speaking" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/writing", label: "Writing" },
  { href: "/evaluation", label: "Evaluation" },
  { href: "/conversation", label: "Conversation" },
  { href: "/history", label: "History" }
];

export function SiteNav() {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav className="nav" aria-label="Primary">
      {items.map((item) => (
        <Link
          key={item.href}
          ref={pathname === item.href ? activeRef : null}
          href={item.href}
          className={pathname === item.href ? "active" : ""}
          aria-current={pathname === item.href ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
