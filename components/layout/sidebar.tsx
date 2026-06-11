'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Calendar, Users, Scissors, UserCheck,
  CreditCard, BarChart2, Zap, Settings, Menu, X, LogOut,
  FileText, DollarSign, Receipt, MapPin, Sun, Moon, Gift, Package, GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import type { Role } from '@/lib/actions/users'

type NavItem = { href: string; label: string; icon: any; roles: Role[] }

const nav: NavItem[] = [
  { href: '/',             label: 'Dashboard',     icon: LayoutDashboard, roles: ['owner', 'manager', 'staff'] },
  { href: '/appointments', label: 'Appointments',  icon: Calendar,        roles: ['owner', 'manager', 'staff'] },
  { href: '/clients',      label: 'Clients',       icon: Users,           roles: ['owner', 'manager', 'staff'] },
  { href: '/pos',          label: 'Point of Sale', icon: CreditCard,      roles: ['owner', 'manager', 'staff'] },
  { href: '/my-schedule',  label: 'My Schedule',   icon: Sun,             roles: ['owner', 'manager', 'staff'] },
  { href: '/services',     label: 'Services',      icon: Scissors,        roles: ['owner', 'manager'] },
  { href: '/staff',        label: 'Staff',         icon: UserCheck,       roles: ['owner', 'manager'] },
  { href: '/apprentices',  label: 'Apprentices',   icon: GraduationCap,   roles: ['owner', 'manager', 'staff'] },
  { href: '/automations',  label: 'Automations',   icon: Zap,             roles: ['owner', 'manager'] },
  { href: '/analytics',    label: 'Analytics',     icon: BarChart2,       roles: ['owner', 'manager'] },
  { href: '/invoices',     label: 'Invoices',      icon: FileText,        roles: ['owner', 'manager'] },
  { href: '/payroll',      label: 'Payroll',       icon: DollarSign,      roles: ['owner', 'manager'] },
  { href: '/expenses',     label: 'Expenses',      icon: Receipt,         roles: ['owner', 'manager'] },
  { href: '/inventory',    label: 'Inventory',     icon: Package,         roles: ['owner', 'manager'] },
  { href: '/gift-cards',   label: 'Gift Cards',    icon: Gift,            roles: ['owner', 'manager'] },
  { href: '/locations',    label: 'Locations',     icon: MapPin,          roles: ['owner'] },
  { href: '/settings',     label: 'Settings',      icon: Settings,        roles: ['owner'] },
]

const ROLE_LABELS: Record<Role, string> = { owner: 'Owner', manager: 'Manager', staff: 'Staff' }

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

interface SidebarProps {
  user: { uid: string; name: string; email: string | null; role: Role }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const { theme, toggle } = useTheme()
  const [open, setOpen]         = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

  const visibleNav = nav.filter(item => item.roles.includes(user.role))

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = pathname === item.href
    const Icon   = item.icon
    return (
      <Link
        href={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
          active
            ? 'bg-teal-600 text-white'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 bg-slate-900 border-b border-slate-700">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="GlowDesk"
            width={180}
            height={60}
            className="h-11 w-auto object-contain brightness-0 invert"
            priority
          />
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white cursor-pointer">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map(item => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-700 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="h-8 w-8 rounded-full bg-teal-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
            {user ? getInitials(user.name) : '…'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? '…'}</p>
            <p className="text-xs text-slate-400">{user ? ROLE_LABELS[user.role] : ''}</p>
          </div>
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-sm"
      >
        <Menu className="h-5 w-5 text-slate-300" />
      </button>

      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={cn(
        'fixed top-0 left-0 h-full w-[220px] bg-slate-800 z-50',
        'transition-transform duration-200 -translate-x-full lg:translate-x-0',
        open && 'translate-x-0'
      )}>
        <SidebarContent />
      </aside>
    </>
  )
}
