import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { logoutAdminAction } from "~/app/admin/login/actions";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

const secondaryPublicLinks: NavLink[] = [
  { href: "/grupper", label: "Grupper" },
  { href: "/start-gruppe", label: "Start gruppe" },
  { href: "/admin", label: "Admin" },
];

function BrandWaves() {
  return (
    <Image
      alt=""
      className="h-5 w-6 shrink-0 sm:h-6 sm:w-6"
      height={64}
      src="/favicon.svg"
      width={64}
    />
  );
}

function BrandLink({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="inline-flex items-center gap-2">
      <Link
        className="bb-focus-ring inline-flex items-center gap-2 py-1 font-bold text-forest-900 text-lg sm:text-xl"
        href="/"
      >
        <BrandWaves />
        Bibelbølgen
      </Link>
      {isAdmin && (
        <Badge
          asChild
          className="bg-sage-100 align-middle font-bold text-[0.6rem] text-forest-900 uppercase hover:bg-sage-200"
        >
          <Link className="bb-focus-ring" href="/admin">
            Admin
          </Link>
        </Badge>
      )}
    </div>
  );
}

export async function SiteHeader({
  active,
  showAdminSessionActions = true,
  variant = "public",
}: {
  active?: string;
  showAdminSessionActions?: boolean;
  variant?: "public" | "admin";
}) {
  const isAdmin = variant === "admin";

  return (
    <header className="relative z-10">
      <div className="bb-container flex items-center justify-between gap-6 py-6">
        <BrandLink isAdmin={isAdmin} />

        <nav className="flex items-center gap-1 text-sm">
          {(isAdmin ? [] : secondaryPublicLinks).map((link) => {
            const isActive = active === link.href;
            const responsiveClass =
              link.href === "/start-gruppe"
                ? "hidden md:inline-flex"
                : "hidden sm:inline-flex";

            return (
              <Button
                asChild
                className={cn(
                  "font-semibold",
                  responsiveClass,
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
          {!isAdmin && (
            <Button asChild className="min-h-11" variant="secondary">
              <Link href="/bli-med">Bli med</Link>
            </Button>
          )}
          {isAdmin && showAdminSessionActions && (
            <>
              <form action={logoutAdminAction}>
                <Button
                  className="font-semibold text-forest-950/70 hover:bg-sage-50 hover:text-forest-900"
                  size="sm"
                  type="submit"
                  variant="ghost"
                >
                  <LogOut />
                  Logg ut
                </Button>
              </form>
              <Badge
                asChild
                className="ml-2 h-auto gap-2 rounded-md bg-sage-100 px-3 py-1.5 text-forest-900 hover:bg-sage-200"
              >
                <Link href="/admin">
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-sage-300 font-bold text-forest-950 text-xs">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">Admin</span>
                </Link>
              </Badge>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
