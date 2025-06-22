"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Settings,
  Users,
  LogOut,
  Activity,
  Package,
  UserCheck,
  ShoppingCart,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/AuthProvider'

interface SidebarProps {
  className?: string
}

const navigationItems = [
  {
    title: 'Главная',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Каталог',
    href: '/dashboard/catalog',
    icon: Package,
  },
  {
    title: 'Заказы',
    href: '/dashboard/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Клиенты',
    href: '/dashboard/clients',
    icon: UserCheck,
  },
  {
    title: 'Счета',
    href: '/dashboard/invoices',
    icon: Receipt,
  },
  {
    title: 'Менеджеры',
    href: '/dashboard/managers',
    icon: Users,
  },
  {
    title: 'Аудит',
    href: '/dashboard/audit',
    icon: Activity,
  },
  {
    title: 'Настройки',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="mb-8">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                ProtekAuto CMS
              </h2>
              <div className="px-4 text-sm text-muted-foreground">
                {user?.firstName} {user?.lastName}
              </div>
            </div>
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-muted font-medium"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 border-t">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  )
} 