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
  IconPackage,
  IconShield,
  IconUserPlus,
  IconVaccine,
  IconBuildingStore,
  IconTimeline,
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
    { label: "Gestão de Postos", icon: IconBuilding, href: "/admin/posts" },
    { label: "Controle de Estoque", icon: IconPackage, href: "/admin/stocks" },
    { label: "Estoque por Posto", icon: IconBuildingStore, href: "/admin/post-stocks" },
    { label: "Histórico de Estoque", icon: IconTimeline, href: "/admin/stock-history" },
    {
      label: "Aplicação de Vacinas",
      icon: IconUserPlus,
      href: "/admin/vaccination-application",
    },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Text size="xl" fw={700} c="blue">
              MyVaccine
            </Text>
          </Group>

          <Group>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group>
                    <Avatar size="sm" color="blue">
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text size="sm">{user?.name}</Text>
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
