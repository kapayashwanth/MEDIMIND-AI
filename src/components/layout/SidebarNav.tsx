
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileScan, ScrollText, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports/analysis', label: 'Report Analysis', icon: FileScan },
  { href: '/prescriptions/interpret', label: 'Prescription Interpretation', icon: ScrollText },
  { href: '/medicines/search', label: 'Medicine Search', icon: Pill },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();


  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} asChild>
            <SidebarMenuButton
              asChild
              variant="default"
              size="default"
              isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
              tooltip={item.label}
              onClick={() => setOpenMobile(false)}
            >
              <>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
