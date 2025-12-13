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
} from "@tabler/icons-react";
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href, active }) => {
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
        backgroundColor: active ? '#228be6' : 'transparent',
        color: active ? 'white' : '#64748b',
        boxShadow: active ? '0 4px 12px rgba(34, 139, 230, 0.4)' : 'none',
        fontWeight: active ? 600 : 500,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#f1f5f9';
          e.currentTarget.style.color = '#228be6';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#64748b';
        }
      }}
    >
      <ThemeIcon
        size={32}
        radius="md"
        variant={active ? 'white' : 'light'}
        color={active ? 'white' : 'gray'}
        style={{
          backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
          color: active ? 'white' : '#64748b',
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
      navbar={{ width: 280, breakpoint: "sm" }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#f8fafc',
        },
      }}
    >
      <AppShell.Header
        style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <img
              src="/Name-Myvaccine.png"
              alt="MyVaccine"
              style={{ 
                height: 40,
                filter: 'drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.3))',
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

          <Group>
            <Menu shadow="lg" width={200} radius="md">
              <Menu.Target>
                <UnstyledButton
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
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
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontWeight: '600',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <Text size="sm" c="dark" fw={600} style={{ lineHeight: 1.2 }}>
                        {userName}
                      </Text>
                      {user?.role && (
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1 }}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </Text>
                      )}
                    </div>
                    <IconChevronDown size={14} color="#64748b" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
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
          backgroundColor: 'white',
          borderRight: '1px solid #e2e8f0',
        }}
      >
        <Stack gap="xs" style={{ flex: 1 }}>
          {/* Menu Principal */}
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={4} ml={4}>
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
              />
            ))}
          </Stack>

          {/* Menu Admin */}
          {user?.role === "admin" && (
            <>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" mt="xl" mb={4} ml={4}>
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
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <Group
            p="sm"
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
            }}
          >
            <Avatar 
              size="md" 
              radius="xl"
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontWeight: '600',
                border: '1px solid #e2e8f0',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} c="dark" truncate>
                {userName}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {user?.email}
              </Text>
            </div>
            <UnstyledButton
              onClick={logout}
              style={{
                padding: '8px',
                borderRadius: '8px',
                color: '#64748b',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748b';
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
