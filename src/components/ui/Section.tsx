import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";
import { Reveal } from "./Reveal";

export function Section({
  id,
  children,
  className,
  tone = "paper",
  size = "md",
  labelledBy,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "paper" | "soft" | "ink";
  size?: "sm" | "md" | "lg";
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={clsx(
        "relative",
        {
          "bg-paper text-ink-900": tone === "paper",
          "bg-paper-soft text-ink-900": tone === "soft",
          "bg-ink-950 text-white": tone === "ink",
        },
        {
          "py-14 md:py-20": size === "sm",
          "py-18 md:py-28": size === "md",
          "py-24 md:py-36": size === "lg",
        },
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  align = "start",
  tone = "dark",
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  align?: "start" | "center";
  tone?: "dark" | "light";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        action && "lg:flex-row lg:items-end lg:justify-between lg:gap-12",
        className,
      )}
    >
      <Reveal className="max-w-3xl">
        {eyebrow && (
          <p
            className={clsx(
              "altor-eyebrow mb-5",
              tone === "light" ? "text-white/45" : "text-ink-400",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className={clsx(
            "text-[clamp(1.75rem,1.15rem+2.4vw,2.875rem)] leading-[1.08]",
            tone === "light" ? "text-white" : "text-ink-900",
          )}
        >
          {title}
        </h2>
        {intro && (
          <p
            className={clsx(
              "mt-5 max-w-2xl text-[1.0625rem] leading-relaxed",
              tone === "light" ? "text-white/65" : "text-ink-500",
            )}
          >
            {intro}
          </p>
        )}
      </Reveal>

      {action && (
        <Reveal delay={80} className="shrink-0">
          {action}
        </Reveal>
      )}
    </div>
  );
}
