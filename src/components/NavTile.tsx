import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type Props = {
  href: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
};

export function NavTile({ href, title, description, icon: Icon, className }: Props) {
  return (
    <Link href={href} className="group">
      <Card
        className={cn(
          "h-32 w-full sm:h-36 p-4 flex flex-col items-start justify-between transition-all hover:shadow-md hover:-translate-y-0.5",
          "bg-background border",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" /> : null}
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </Card>
    </Link>
  );
}