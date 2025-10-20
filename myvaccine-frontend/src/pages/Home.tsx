import React from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Button,
  Stack,
  ThemeIcon,
  Badge,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {
  IconMapPin,
  IconHistory,
  IconShield,
  IconVaccine,
  IconBuilding,
  IconPackage,
  IconUserPlus,
} from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: IconMapPin,
      title: 'Postos de Vacinação',
      description: 'Encontre postos próximos a você',
      color: 'blue',
      action: () => navigate('/posts'),
    },
    {
      icon: IconHistory,
      title: 'Histórico de Vacinas',
      description: 'Acompanhe suas vacinas aplicadas',
      color: 'green',
      action: () => navigate('/vaccination-history'),
    },
  ];

  const adminFeatures = [
    {
      icon: IconShield,
      title: 'Dashboard',
      description: 'Visão geral do sistema',
      color: 'red',
      action: () => navigate('/admin'),
    },
    {
      icon: IconVaccine,
      title: 'Gestão de Vacinas',
      description: 'Cadastrar e gerenciar vacinas',
      color: 'orange',
      action: () => navigate('/admin/vaccines'),
    },
    {
      icon: IconBuilding,
      title: 'Gestão de Postos',
      description: 'Gerenciar postos de vacinação',
      color: 'purple',
      action: () => navigate('/admin/posts'),
    },
    {
      icon: IconPackage,
      title: 'Controle de Estoque',
      description: 'Gerenciar estoque de vacinas',
      color: 'teal',
      action: () => navigate('/admin/stocks'),
    },
    {
      icon: IconUserPlus,
      title: 'Aplicação de Vacinas',
      description: 'Registrar aplicações de vacinas',
      color: 'pink',
      action: () => navigate('/admin/vaccination-application'),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Bem-vindo ao MyVaccine
          </Title>
          <Text size="lg" c="dimmed">
            Sistema de gestão de vacinação para facilitar o acesso à imunização
          </Text>
          {user && (
            <Group mt="sm">
              <Text size="sm">Olá, {user.name}!</Text>
              <Badge color={user.role === 'admin' ? 'red' : 'blue'}>
                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
              </Badge>
            </Group>
          )}
        </div>

        <div>
          <Title order={2} mb="md">
            Funcionalidades Principais
          </Title>
          <Grid>
            {features.map((feature, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack align="center" gap="md">
                    <ThemeIcon size="xl" color={feature.color} variant="light">
                      <feature.icon size={24} />
                    </ThemeIcon>
                    <Title order={3} ta="center" size="h4">
                      {feature.title}
                    </Title>
                    <Text ta="center" c="dimmed" size="sm">
                      {feature.description}
                    </Text>
                    <Button
                      variant="light"
                      color={feature.color}
                      onClick={feature.action}
                      fullWidth
                    >
                      Acessar
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </div>

        {user?.role === 'admin' && (
          <div>
            <Title order={2} mb="md">
              Área Administrativa
            </Title>
            <Grid>
              {adminFeatures.map((feature, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack align="center" gap="md">
                      <ThemeIcon size="xl" color={feature.color} variant="light">
                        <feature.icon size={24} />
                      </ThemeIcon>
                      <Title order={3} ta="center" size="h4">
                        {feature.title}
                      </Title>
                      <Text ta="center" c="dimmed" size="sm">
                        {feature.description}
                      </Text>
                      <Button
                        variant="light"
                        color={feature.color}
                        onClick={feature.action}
                        fullWidth
                      >
                        Acessar
                      </Button>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </div>
        )}
      </Stack>
    </Container>
  );
};

export default Home;
