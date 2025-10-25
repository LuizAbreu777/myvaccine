import {
  AppShell,
  Avatar,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  UnstyledButton,
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
} from "@tabler/icons-react";
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Home", icon: IconHome, href: "/" },
    { label: "Postos de Vacinação", icon: IconMapPin, href: "/posts" },
    {
      label: "Histórico de Vacinas",
      icon: IconHistory,
      href: "/vaccination-history",
    },
  ];

  const adminNavItems = [
    { label: "Dashboard", icon: IconShield, href: "/admin" },
    { label: "Gestão de Vacinas", icon: IconVaccine, href: "/admin/vaccines" },
    { label: "Postos & Estoque", icon: IconBuilding, href: "/admin/posts-stocks" },
    { label: "Histórico de Estoque", icon: IconTimeline, href: "/admin/stock-history" },
    {
      label: "Aplicação de Vacinas",
      icon: IconUserPlus,
      href: "/admin/vaccination-application",
    },
    {
      label: "Vacinas Aplicadas",
      icon: IconHistory,
      href: "/admin/applied-vaccines",
    },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
                  <Group gap="xs">
                    <Avatar 
                      size="sm" 
                      color="gray"
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontWeight: '600',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text size="sm" c="dark" fw={500}>
                      {user?.name}
                    </Text>
                    <IconChevronDown size={14} color="#64748b" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Conta</Menu.Label>
                <Menu.Item component={Link} to="/profile">
                  Meu Perfil
                </Menu.Item>
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

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text size="sm" fw={500} c="dimmed" mb="xs">
            Menu Principal
          </Text>

          {navItems.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              to={item.href}
              label={item.label}
              leftSection={<item.icon size={16} />}
              active={location.pathname === item.href}
            />
          ))}

          {user?.role === "admin" && (
            <>
              <Text size="sm" fw={500} c="dimmed" mt="md" mb="xs">
                Administração
              </Text>

              {adminNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  component={Link}
                  to={item.href}
                  label={item.label}
                  leftSection={<item.icon size={16} />}
                  active={location.pathname === item.href}
                />
              ))}
            </>
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;
