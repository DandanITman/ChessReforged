import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type Props = {
  href: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  gradient?: string;
  badge?: string;
  badgeIcon?: LucideIcon;
};

export function NavTile({
  href,
  title,
  description,
  icon: Icon,
  className,
  gradient,
  badge,
  badgeIcon: BadgeIcon
}: Props) {
  return (
    <Link href={href} className="group">
      <Card
        className={cn(
          "h-40 w-full p-6 flex flex-col justify-between transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-2 cursor-pointer",
          gradient ? "text-white border-0" : "bg-background border hover:border-primary/20",
          gradient,
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon ? (
              <Icon className={cn(
                "size-6 transition-all duration-300",
                gradient ? "text-white" : "text-muted-foreground group-hover:text-primary"
              )} />
            ) : null}
            <h3 className={cn(
              "text-lg font-bold transition-colors",
              gradient ? "text-white" : "text-foreground"
            )}>
              {title}
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          {description ? (
            <p className={cn(
              "text-sm leading-relaxed",
              gradient ? "text-white/90" : "text-muted-foreground"
            )}>
              {description}
            </p>
          ) : null}

          {badge ? (
            <Badge
              variant="secondary"
              className={cn(
                "w-fit",
                gradient ? "bg-white/20 text-white border-0 hover:bg-white/30" : ""
              )}
            >
              {BadgeIcon ? <BadgeIcon className="h-3 w-3 mr-1" /> : null}
              {badge}
            </Badge>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}