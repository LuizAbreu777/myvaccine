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
      title: 'Postos & Estoque',
      description: 'Gerenciar postos e controle de estoque',
      color: 'purple',
      action: () => navigate('/admin/posts-stocks'),
    },
    {
      icon: IconUserPlus,
      title: 'Aplicação de Vacinas',
      description: 'Registrar aplicações de vacinas',
      color: 'pink',
      action: () => navigate('/admin/vaccination-application'),
    },
    {
      icon: IconHistory,
      title: 'Vacinas Aplicadas',
      description: 'Visualizar todas as vacinas aplicadas',
      color: 'cyan',
      action: () => navigate('/admin/applied-vaccines'),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div style={{ textAlign: 'center' }}>
          <Title 
            order={1} 
            mb="md"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #0c4a6e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '3rem',
              fontWeight: '700',
            }}
          >
            Bem-vindo ao MyVaccine
          </Title>
          <Text size="xl" c="dimmed" mb="lg">
            Sistema de gestão de vacinação para facilitar o acesso à imunização
          </Text>
          {user && (
            <Group justify="center" mt="sm">
              <Text size="lg" fw={500}>Olá, {user.name}! 👋</Text>
              <Badge 
                size="lg"
                color={user.role === 'admin' ? 'red' : 'medical'}
                variant="light"
                radius="md"
              >
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
                <Card 
                  shadow="md" 
                  padding="xl" 
                  radius="lg" 
                  withBorder
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }}
                  onClick={feature.action}
                >
                  <Stack align="center" gap="lg">
                    <ThemeIcon 
                      size="4rem" 
                      color={feature.color} 
                      variant="gradient"
                      gradient={{ from: feature.color, to: feature.color, deg: 45 }}
                      style={{
                        borderRadius: '20px',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <feature.icon size={32} />
                    </ThemeIcon>
                    <Title order={3} ta="center" size="h3" fw={600}>
                      {feature.title}
                    </Title>
                    <Text ta="center" c="dimmed" size="md" lh={1.6}>
                      {feature.description}
                    </Text>
                    <Button
                      variant="gradient"
                      gradient={{ from: feature.color, to: feature.color, deg: 45 }}
                      onClick={feature.action}
                      fullWidth
                      size="md"
                      radius="md"
                      style={{
                        fontWeight: '600',
                        textTransform: 'none',
                      }}
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
