"use client";

import { useMemo, useState } from "react";

const AVATAR_COLORS = [
  "37,99,235",
  "220,38,38",
  "22,163,74",
  "217,119,6",
  "124,58,237",
  "8,145,178",
  "194,65,12",
  "13,148,136",
];

export default function Avatar({
  name,
  src,
  size = 40,
  className = "",
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const [error, setError] = useState(false);

  const initials = useMemo(() => {
    const parts = (name || "?").trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "?";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }, [name]);

  const color = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }, [name]);

  if (src && !error) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={`avatar ${className}`}
        style={{ width: size, height: size }}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <span
      className={`avatar avatar-fallback ${className}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, size * 0.36),
        background: `linear-gradient(135deg, rgba(${color},0.95), rgba(${color},0.75))`,
      }}
    >
      {initials}
    </span>
  );
}
