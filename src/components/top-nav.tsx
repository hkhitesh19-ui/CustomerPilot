import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopNav() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-8">
      <SidebarTrigger className="-ml-2 md:hidden" />
      <div className="flex flex-1 items-center justify-end space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <ModeToggle />
      </div>
    </header>
  )
}
