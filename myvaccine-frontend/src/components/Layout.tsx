import {
  AppShell,
  Avatar,
  Group,
  Menu,
  Stack,
  Text,
  UnstyledButton,
  Box,
  ThemeIcon,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconBuilding,
  IconHistory,
  IconHome,
  IconLogout,
  IconMapPin,
  IconShield,
  IconUserPlus,
  IconVaccine,
  IconTimeline,
  IconChevronDown,
  IconUsers,
  IconChevronRight,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useDisclosure } from "@mantine/hooks";
import { IconMenu2 } from "@tabler/icons-react";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
  isDark: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href, active, isDark }) => {
  // Cores baseadas no modo
  const colors = isDark ? {
    activeBg: '#2563eb',
    activeShadow: 'rgba(37, 99, 235, 0.4)',
    hoverBg: '#334155',
    hoverText: '#60a5fa',
    inactiveText: '#94a3b8',
    iconBg: '#334155',
    iconActiveText: 'white',
  } : {
    activeBg: '#228be6',
    activeShadow: 'rgba(34, 139, 230, 0.4)',
    hoverBg: '#f1f5f9',
    hoverText: '#228be6',
    inactiveText: '#64748b',
    iconBg: '#f1f5f9',
    iconActiveText: 'white',
  };

  return (
    <UnstyledButton
      component={Link}
      to={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        backgroundColor: active ? colors.activeBg : 'transparent',
        color: active ? 'white' : colors.inactiveText,
        boxShadow: active ? `0 4px 12px ${colors.activeShadow}` : 'none',
        fontWeight: active ? 600 : 500,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = colors.hoverBg;
          e.currentTarget.style.color = colors.hoverText;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = colors.inactiveText;
        }
      }}
    >
      <ThemeIcon
        size={32}
        radius="md"
        variant={active ? 'white' : 'light'}
        color={active ? 'white' : 'gray'}
        style={{
          backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : colors.iconBg,
          color: active ? 'white' : colors.inactiveText,
        }}
      >
        <Icon size={18} />
      </ThemeIcon>
      <Text size="sm" style={{ flex: 1 }}>
        {label}
      </Text>
      {active && (
        <Box
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'white',
          }}
        />
      )}
    </UnstyledButton>
  );
};

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { colorScheme, toggleColorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const [opened, { toggle }] = useDisclosure(true);

  
  // Cores do tema
  const themeColors = isDark ? {
    headerBg: '#0f172a',
    headerBorder: '#1e293b',
    navbarBg: '#020617',
    navbarBorder: '#1e293b',
    mainBg: '#0f172a',
    cardBg: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    avatarBg: '#334155',
    avatarBorder: '#475569',
    divider: '#334155',
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    logoutHoverBg: '#7f1d1d',
  } : {
    headerBg: 'white',
    headerBorder: '#e2e8f0',
    navbarBg: 'white',
    navbarBorder: '#e2e8f0',
    mainBg: '#f8fafc',
    cardBg: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    avatarBg: '#f1f5f9',
    avatarBorder: '#e2e8f0',
    divider: '#e2e8f0',
    hoverBg: 'rgba(0, 0, 0, 0.05)',
    logoutHoverBg: '#fee2e2',
  };

  // Obter nome do usuário do estado ou do localStorage
  const getUserName = () => {
    if (user?.name) return user.name;
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.name || 'Usuário';
      } catch {
        return 'Usuário';
      }
    }
    return 'Usuário';
  };
  
  const userName = getUserName();

  const navItems = [
    { label: "Visão Geral", icon: IconHome, href: "/" },
    { label: "Postos de Vacinação", icon: IconMapPin, href: "/posts" },
    { label: "Dependentes", icon: IconUsers, href: "/dependents" },
    { label: "Histórico de Vacinas", icon: IconHistory, href: "/vaccination-history" },
  ];

  const adminNavItems = [
    { label: "Visão Geral", icon: IconHome, href: "/" },
    { label: "Dashboard", icon: IconShield, href: "/admin" },
    { label: "Gestão de Vacinas", icon: IconVaccine, href: "/admin/vaccines" },
    { label: "Postos & Estoque", icon: IconBuilding, href: "/admin/posts-stocks" },
    { label: "Histórico de Estoque", icon: IconTimeline, href: "/admin/stock-history" },
    { label: "Aplicar Vacina", icon: IconUserPlus, href: "/admin/vaccination-application" },
    { label: "Vacinas Aplicadas", icon: IconHistory, href: "/admin/applied-vaccines" },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
      width: 280,
      breakpoint: "sm",
      collapsed: { mobile: !opened, desktop: !opened }
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: themeColors.mainBg,
        },
      }}
    >
      <AppShell.Header
        style={{
          background: themeColors.headerBg,
          borderBottom: `1px solid ${themeColors.headerBorder}`,
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >

        <Group h="100%" px="md" justify="space-between">
          <Group>
            <ActionIcon variant="subtle" size="lg" onClick={toggle}>
             <IconMenu2 size={26} color={isDark ? '#003AF1' : '#05164F'} />
            </ActionIcon>
            <img
              src={isDark ? "/Name-MyvaccineDark.png" : "/Name-Myvaccine.png"}
              alt="MyVaccine"
              style={{ 
                height: 40,
                filter: isDark ? 'brightness(1.2) drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.5))' : 'drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.3))',
                cursor: 'pointer',
                imageRendering: 'auto',
                objectFit: 'contain',
                width: 'auto',
                transition: 'transform 0.2s ease',
              }}
              onClick={() => window.location.href = '/'}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Group>

          <Group gap="sm">
            {/* Botão de alternar tema */}
            <Tooltip label={isDark ? 'Modo Claro' : 'Modo Escuro'} withArrow>
              <ActionIcon
                variant="subtle"
                size="lg"
                radius="md"
                onClick={toggleColorScheme}
                style={{
                  color: isDark ? '#fbbf24' : '#64748b',
                  backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                }}
              >
                {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>
            </Tooltip>

            <Menu shadow="lg" width={200} radius="md">
              <Menu.Target>
                <UnstyledButton
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Group gap="sm">
                    <Avatar 
                      size="md" 
                      color="gray"
                      style={{
                        backgroundColor: themeColors.avatarBg,
                        color: themeColors.textSecondary,
                        fontWeight: '600',
                        border: `1px solid ${themeColors.avatarBorder}`,
                      }}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={600} style={{ lineHeight: 1.2, color: themeColors.textPrimary }}>
                        {userName}
                      </Text>
                      {user?.role && (
                        <Text size="xs" style={{ lineHeight: 1, color: themeColors.textMuted }}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </Text>
                      )}
                    </div>
                    <IconChevronDown size={14} color={themeColors.textMuted} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown style={{ backgroundColor: isDark ? '#1e293b' : undefined }}>
                <Menu.Label>Conta</Menu.Label>
                <Menu.Item 
                  component={Link} 
                  to="/profile"
                  rightSection={<IconChevronRight size={14} />}
                >
                  Meu Perfil
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  onClick={logout}
                  color="red"
                >
                  Sair
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar 
        p="md"
        style={{
          backgroundColor: themeColors.navbarBg,
          borderRight: `1px solid ${themeColors.navbarBorder}`,
        }}
      >
        <Stack gap="xs" style={{ flex: 1 }}>
  {user?.role === "admin" ? (
    <>
      <Text size="xs" fw={600} tt="uppercase" mb={4} ml={4} style={{ color: themeColors.textMuted }}>
        Administração
      </Text>

      <Stack gap={6}>
        {adminNavItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={location.pathname === item.href}
            isDark={isDark}
          />
        ))}
      </Stack>
    </>
  ) : (
    <>
      <Text size="xs" fw={600} tt="uppercase" mb={4} ml={4} style={{ color: themeColors.textMuted }}>
        Menu Principal
      </Text>

      <Stack gap={6}>
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={location.pathname === item.href}
            isDark={isDark}
          />
        ))}
      </Stack>
    </>
  )}
</Stack>


        {/* Card do Usuário no rodapé */}
        <Box
          mt="auto"
          pt="md"
          style={{
            borderTop: `1px solid ${themeColors.divider}`,
          }}
        >
          <Group
            p="sm"
            style={{
              backgroundColor: themeColors.cardBg,
              borderRadius: '12px',
            }}
          >
            <Avatar 
              size="md" 
              radius="xl"
              style={{
                backgroundColor: themeColors.avatarBg,
                color: themeColors.textSecondary,
                fontWeight: '600',
                border: `1px solid ${themeColors.avatarBorder}`,
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} truncate style={{ color: themeColors.textPrimary }}>
                {userName}
              </Text>
              <Text size="xs" truncate style={{ color: themeColors.textMuted }}>
                {user?.email}
              </Text>
            </div>
            <UnstyledButton
              onClick={logout}
              style={{
                padding: '8px',
                borderRadius: '8px',
                color: themeColors.textMuted,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.logoutHoverBg;
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = themeColors.textMuted;
              }}
            >
              <IconLogout size={18} />
            </UnstyledButton>
          </Group>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;
