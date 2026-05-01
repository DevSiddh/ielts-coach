"use client";

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

  return (
    <nav className="nav">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
