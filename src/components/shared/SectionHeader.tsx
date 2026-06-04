import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?:       string;
  title:          string;
  subtitle?:      string;
  align?:         "left" | "center";
  className?:     string;
  titleClassName?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && <span className="label-sm">{eyebrow}</span>}
      <h2
        className={cn(
          "text-display-md text-brand-black text-balance",
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          "text-body-md text-brand-ash max-w-xl",
          align === "center" && "mx-auto"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
