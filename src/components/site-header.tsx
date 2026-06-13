import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

const publicLinks: NavLink[] = [
  { href: "/grupper", label: "Grupper" },
  { href: "/bli-med", label: "Bli med" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader({
  active,
  variant = "public",
}: {
  active?: string;
  variant?: "public" | "admin";
}) {
  const isAdmin = variant === "admin";

  return (
    <header
      className={cn(
        "border-b backdrop-blur",
        isAdmin
          ? "border-white/10 bg-forest-950 text-white"
          : "border-forest-900/10 bg-paper/90",
      )}
    >
      <div className="bb-container flex h-16 items-center justify-between gap-6">
        <Link
          className="bb-focus-ring flex items-center gap-3"
          href={isAdmin ? "/admin" : "/"}
        >
          {isAdmin ? (
            <>
              <Image
                alt=""
                className="size-7"
                height={28}
                src="/brand/aa-mark.svg"
                width={28}
              />
              <span className="font-black font-display text-lg tracking-tight">
                Bibelbølgen
                <Badge className="ml-2 bg-white/15 align-middle font-bold text-[0.6rem] text-white uppercase">
                  Admin
                </Badge>
              </span>
            </>
          ) : (
            <Image
              alt="Hjelp meg å lese Bibelen"
              className="h-8 w-auto"
              height={49}
              src="/brand/hjelp-meg-lese-bibelen-wordmark.svg"
              width={160}
            />
          )}
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {(isAdmin ? [] : publicLinks).map((link) => {
            const isActive = active === link.href;

            return (
              <Button
                asChild
                className={cn(
                  "font-semibold",
                  isActive
                    ? "bg-sage-100 text-forest-900 hover:bg-sage-100"
                    : "text-forest-950/70 hover:bg-sage-50 hover:text-forest-900",
                )}
                key={link.href}
                size="sm"
                variant={isActive ? "secondary" : "ghost"}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            );
          })}
          {isAdmin && (
            <>
              <Button
                asChild
                className="font-semibold text-white/70 hover:bg-white/10 hover:text-white"
                size="sm"
                variant="ghost"
              >
                <Link href="/">Til nettsiden</Link>
              </Button>
              <Badge className="ml-2 h-auto gap-2 rounded-md bg-white/10 px-3 py-1.5 text-white/85">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-sage-300 font-bold text-forest-950 text-xs">
                    SE
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">Global admin</span>
              </Badge>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
