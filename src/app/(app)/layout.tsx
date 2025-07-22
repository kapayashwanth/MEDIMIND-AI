
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { AppLogo } from '@/components/layout/AppLogo';
import { Button } from '@/components/ui/button';
import { Moon, Sun, X } from 'lucide-react'; // Added X icon
import { Chatbot } from '@/components/chatbot/Chatbot';
// import { ModeToggle } from '@/components/ModeToggle'; // Assuming you might add this later

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          {/* <ModeToggle /> You can add a theme toggle here */}
          <div className="flex items-center justify-between rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground">
            <span>N 1 Issue</span>
            <Button variant="ghost" size="icon" className="h-5 w-5 -mr-1 text-destructive-foreground hover:bg-destructive/80 hover:text-destructive-foreground">
              <X className="h-3 w-3" />
              <span className="sr-only">Dismiss issue</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col">
          {children}
          <Chatbot />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Placeholder for ModeToggle if you decide to implement it
// function ModeToggle() {
//   // const { setTheme, theme } = useTheme(); // if using next-themes
//   return (
//     <Button variant="ghost" size="icon" onClick={() => { /* toggle theme */ }}>
//       <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//       <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//       <span className="sr-only">Toggle theme</span>
//     </Button>
//   );
// }
