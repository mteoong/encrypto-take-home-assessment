"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CreditCard, DollarSign } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Loans",
    href: "/",
    icon: DollarSign,
  },
  {
    name: "Card",
    href: "/card",
    icon: CreditCard,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Profile Section */}
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-accent-green text-black font-medium">JD</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-sidebar-foreground">John Doe</span>
          <span className="text-xs text-sidebar-foreground/60">Premium Member</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12 text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
