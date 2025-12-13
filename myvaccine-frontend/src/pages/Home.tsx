import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Loader,
  Center,
  Box,
  SimpleGrid,
  Paper,
  ActionIcon,
  Avatar,
  Table,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {
  IconMapPin,
  IconUsers,
  IconShieldCheck,
  IconChevronRight,
  IconVaccine,
  IconTrendingUp,
  IconPackage,
  IconUserPlus,
  IconHistory,
  IconId,
  IconCheck,
} from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { 
  vaccinationHistoryService, 
  postService, 
  dependentService,
  stockService,
} from '../services/services';
import { VaccinationHistory, Post, Dependent, Stock } from '../types';

// Interface para posto com distância
interface PostWithDistance extends Post {
  distance?: number;
}

// ==================== COMPONENTE HOME USUÁRIO ====================
const UserHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vaccinations, setVaccinations] = useState<VaccinationHistory[]>([]);
  const [posts, setPosts] = useState<PostWithDistance[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [nearestPostStocks, setNearestPostStocks] = useState<Stock[]>([]);
  const [nearestPost, setNearestPost] = useState<PostWithDistance | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<'user' | string>('user');

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationError(null);
        },
        () => setLocationError('Localização indisponível'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [postsData, dependentsData, stocksData] = await Promise.all([
        postService.getAll(),
        dependentService.getAll().catch(() => []),
        stockService.getAll().catch(() => []),
      ]);

      let vaccinationsData: VaccinationHistory[] = [];
      if (user?.cpf) {
        try {
          vaccinationsData = await vaccinationHistoryService.getByUserAll(user.cpf);
        } catch (error) {
          console.error('Erro ao buscar histórico:', error);
        }
      }

      let activePosts = postsData.filter(p => p.status === 'ativo');
      if (userLocation) {
        activePosts = activePosts.map(post => ({
          ...post,
          distance: post.latitude && post.longitude
            ? calculateDistance(userLocation.lat, userLocation.lng, post.latitude, post.longitude)
            : undefined
        })).sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
      }

      // Identificar o posto mais próximo e suas vacinas disponíveis
      const nearest = activePosts[0] || null;
      setNearestPost(nearest);
      
      if (nearest) {
        const nearestStocks = stocksData.filter(
          (s: Stock) => s.post_id === nearest.id && s.quantity > 0
        );
        setNearestPostStocks(nearestStocks);
      }

      setPosts(activePosts.slice(0, 3));
      setDependents(dependentsData);
      setVaccinations(vaccinationsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [user, userLocation, calculateDistance]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalVaccines = vaccinations.length;

  if (loading) {
    return <Center h={400}><Loader size="lg" /></Center>;
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={1} mb={4} fw={700} c="dark.7">
            Olá, {user?.name?.split(' ')[0]} 👋
          </Title>
          <Text c="dimmed" size="lg">
            Acompanhe a vacinação da sua família
          </Text>
        </Box>

        {/* Layout Principal: Carteirinha à esquerda, demais à direita */}
        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ flexDirection: 'row' }}>
          
          {/* Coluna Esquerda: Carteirinha de Vacinação (Vertical) */}
          {user && (
            <Box style={{ width: '320px', minWidth: '320px', flexShrink: 0 }}>
              <Group justify="space-between" mb="md">
                <Title order={4} fw={700}>📋 Carteirinha</Title>
                <Text size="xs" c="blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/vaccination-history')}>
                  Ver tudo
                </Text>
              </Group>
              {(() => {
                // Lógica para filtrar vacinas da pessoa selecionada
                const currentName = selectedPerson === 'user' 
                  ? user.name 
                  : dependents.find(d => d.cpf === selectedPerson)?.name || 'Dependente';
                
                const currentCpf = selectedPerson === 'user' 
                  ? user.cpf 
                  : dependents.find(d => d.cpf === selectedPerson)?.cpf || '';
                
                // Formatar CPF: 123.456.789-00
                const formatCpf = (cpf: string) => {
                  const clean = cpf.replace(/\D/g, '');
                  if (clean.length !== 11) return cpf;
                  return `${clean.slice(0,3)}.${clean.slice(3,6)}.${clean.slice(6,9)}-${clean.slice(9,11)}`;
                };
                
                const currentVaccinations = selectedPerson === 'user'
                  ? vaccinations.filter(v => !v.is_dependent)
                  : vaccinations.filter(v => v.is_dependent && v.user_cpf === selectedPerson.replace(/[.-]/g, ''));

                return (
                  <Paper 
                    radius="xl" 
                    p={0} 
                    style={{ 
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #1e3a5f 0%, #0c2340 100%)',
                      minHeight: '500px',
                    }}
                  >
                    {/* Header da Carteirinha */}
                    <Box p="md" pb="sm">
                      <Group gap="sm">
                        <Avatar 
                          size={48} 
                          radius="xl" 
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            border: '2px solid rgba(255,255,255,0.3)',
                          }}
                        >
                          <Text fw={700} c="white" size="lg">
                            {currentName.charAt(0).toUpperCase()}
                          </Text>
                        </Avatar>
                        <Box>
                          <Text c="white" fw={700} size="md" style={{ lineHeight: 1.2 }}>
                            {currentName.split(' ').slice(0, 2).join(' ')}
                          </Text>
                          <Text c="rgba(255,255,255,0.6)" size="xs" mt={2} style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                            {formatCpf(currentCpf)}
                          </Text>
                          <Group gap={4} mt={2}>
                            <IconId size={10} color="rgba(255,255,255,0.5)" />
                            <Text c="rgba(255,255,255,0.5)" size="xs">
                              {selectedPerson === 'user' ? 'Titular' : 'Dependente'}
                            </Text>
                          </Group>
                        </Box>
                      </Group>

                      {/* Seletor de Pessoa */}
                      {dependents.length > 0 && (
                        <Group gap={4} mt="sm">
                          <Badge 
                            size="xs" 
                            color={selectedPerson === 'user' ? 'white' : 'gray'}
                            variant={selectedPerson === 'user' ? 'filled' : 'outline'}
                            style={{ 
                              cursor: 'pointer', 
                              color: selectedPerson === 'user' ? '#1e3a5f' : 'white',
                              borderColor: 'rgba(255,255,255,0.3)',
                            }}
                            onClick={() => setSelectedPerson('user')}
                          >
                            Eu
                          </Badge>
                          {dependents.map((dep) => (
                            <Badge 
                              key={dep.cpf} 
                              size="xs" 
                              color={selectedPerson === dep.cpf ? 'white' : 'gray'}
                              variant={selectedPerson === dep.cpf ? 'filled' : 'outline'}
                              style={{ 
                                cursor: 'pointer', 
                                color: selectedPerson === dep.cpf ? '#1e3a5f' : 'white',
                                borderColor: 'rgba(255,255,255,0.3)',
                              }}
                              onClick={() => setSelectedPerson(dep.cpf)}
                            >
                              {dep.name.split(' ')[0]}
                            </Badge>
                          ))}
                        </Group>
                      )}
                    </Box>

                    {/* Faixa decorativa */}
                    <Box style={{ height: '3px', background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 25%, #667eea 50%, #764ba2 75%, #f5576c 100%)' }} />

                    {/* Lista de Vacinas */}
                    <Box p="sm" style={{ backgroundColor: 'white', minHeight: '380px' }}>
                      {currentVaccinations.length === 0 ? (
                        <Center py="xl">
                          <Stack align="center" gap="xs">
                            <ThemeIcon size={40} radius="xl" color="gray" variant="light">
                              <IconVaccine size={20} />
                            </ThemeIcon>
                            <Text c="dimmed" size="sm">Nenhuma vacina</Text>
                          </Stack>
                        </Center>
                      ) : (
                        <Stack gap="xs">
                          {currentVaccinations.slice(0, 8).map((v, index) => {
                            const colors = ['blue', 'grape', 'teal', 'orange', 'pink', 'cyan', 'indigo', 'green'];
                            const color = colors[index % colors.length];
                            return (
                              <Paper 
                                key={v.id} 
                                p="xs" 
                                radius="md"
                                style={{ 
                                  backgroundColor: `var(--mantine-color-${color}-0)`,
                                  borderLeft: `3px solid var(--mantine-color-${color}-5)`,
                                }}
                              >
                                <Group justify="space-between" wrap="nowrap">
                                  <Box style={{ flex: 1, minWidth: 0 }}>
                                    <Text fw={600} size="xs" lineClamp={1}>
                                      {v.vaccine?.name?.replace('Vacina contra ', '').replace('Vacina ', '') || 'Vacina'}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      {new Date(v.application_date).toLocaleDateString('pt-BR')}
                                    </Text>
                                  </Box>
                                  <ThemeIcon size={20} radius="xl" color={color} variant="light">
                                    <IconCheck size={12} />
                                  </ThemeIcon>
                                </Group>
                              </Paper>
                            );
                          })}
                          {currentVaccinations.length > 8 && (
                            <Text size="xs" c="dimmed" ta="center">
                              +{currentVaccinations.length - 8} mais
                            </Text>
                          )}
                        </Stack>
                      )}
                    </Box>

                    {/* Footer */}
                    <Box px="sm" py="xs" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
                      <Group justify="space-between">
                        <Group gap={4}>
                          <IconShieldCheck size={12} color="#228be6" />
                          <Text size="xs" c="dimmed">MyVaccine</Text>
                        </Group>
                        <Badge size="xs" color="green" variant="light">
                          {currentVaccinations.length} vacinas
                        </Badge>
                      </Group>
                    </Box>
                  </Paper>
                );
              })()}
            </Box>
          )}

          {/* Coluna Direita: Estatísticas, Vacinas Disponíveis e Postos */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Stack gap="lg">
              {/* Cards de Estatísticas */}
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <Paper p="lg" radius="lg" withBorder style={{ cursor: 'pointer' }} onClick={() => navigate('/vaccination-history')}>
                  <Group justify="space-between" mb="sm">
                    <ThemeIcon size={40} radius="xl" color="blue" variant="light">
                      <IconShieldCheck size={20} />
                    </ThemeIcon>
                    <Badge color="teal" variant="light" size="sm">{totalVaccines > 0 ? 'Em dia' : 'Pendente'}</Badge>
                  </Group>
                  <Text fz={28} fw={700} lh={1}>{totalVaccines}</Text>
                  <Text c="dimmed" size="sm">vacinas aplicadas</Text>
                </Paper>

                <Paper p="lg" radius="lg" withBorder style={{ cursor: 'pointer' }} onClick={() => navigate('/dependents')}>
                  <Group justify="space-between" mb="sm">
                    <ThemeIcon size={40} radius="xl" color="grape" variant="light">
                      <IconUsers size={20} />
                    </ThemeIcon>
                  </Group>
                  <Text fz={28} fw={700} lh={1}>{dependents.length}</Text>
                  <Text c="dimmed" size="sm">dependentes</Text>
                </Paper>

                <Paper p="lg" radius="lg" withBorder style={{ cursor: 'pointer' }} onClick={() => navigate('/posts')}>
                  <Group justify="space-between" mb="sm">
                    <ThemeIcon size={40} radius="xl" color="orange" variant="light">
                      <IconMapPin size={20} />
                    </ThemeIcon>
                  </Group>
                  <Text fz={28} fw={700} lh={1}>{posts.length}+</Text>
                  <Text c="dimmed" size="sm">postos próximos</Text>
                </Paper>
              </SimpleGrid>

              {/* Vacinas Disponíveis no Posto Mais Próximo */}
              {nearestPost && (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Title order={4} fw={700}>💉 Vacinas Disponíveis</Title>
                      <Badge color="blue" variant="light" size="xs">
                        {nearestPost.name.length > 20 ? nearestPost.name.substring(0, 20) + '...' : nearestPost.name}
                        {nearestPost.distance !== undefined && (
                          <> • {nearestPost.distance < 1 ? `${Math.round(nearestPost.distance * 1000)}m` : `${nearestPost.distance.toFixed(1)}km`}</>
                        )}
                      </Badge>
                    </Group>
                    <Text size="xs" c="blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/posts')}>
                      Ver outros
                    </Text>
                  </Group>
                  
                  {nearestPostStocks.length === 0 ? (
                    <Paper p="md" radius="lg" withBorder>
                      <Center>
                        <Text c="dimmed" size="sm">Nenhuma vacina disponível</Text>
                      </Center>
                    </Paper>
                  ) : (
                    <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Vacina</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>Doses</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {nearestPostStocks.slice(0, 6).map((stock) => (
                            <Table.Tr key={stock.id}>
                              <Table.Td>
                                <Group gap="xs">
                                  <ThemeIcon size={24} radius="md" color="green" variant="light">
                                    <IconVaccine size={12} />
                                  </ThemeIcon>
                                  <Text size="sm" fw={500}>
                                    {stock.vaccine?.name?.replace('Vacina contra ', '').replace('Vacina ', '') || 'Vacina'}
                                  </Text>
                                </Group>
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'center' }}>
                                <Text size="sm" fw={700} c={stock.quantity > 10 ? 'green' : 'orange'}>
                                  {stock.quantity}
                                </Text>
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'center' }}>
                                <Badge 
                                  size="sm" 
                                  color={stock.quantity > 10 ? 'green' : stock.quantity > 0 ? 'orange' : 'red'} 
                                  variant="light"
                                >
                                  {stock.quantity > 10 ? 'Disponível' : stock.quantity > 0 ? 'Baixo' : 'Esgotado'}
                                </Badge>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                      {nearestPostStocks.length > 6 && (
                        <Box p="xs" ta="center" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                          <Text size="xs" c="dimmed">
                            +{nearestPostStocks.length - 6} outras vacinas disponíveis
                          </Text>
                        </Box>
                      )}
                    </Paper>
                  )}
                </Stack>
              )}

              {/* Postos Próximos */}
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <Title order={4} fw={700}>🏥 Postos Próximos</Title>
                    {locationError && <Badge size="xs" color="gray" variant="light">{locationError}</Badge>}
                  </Group>
                  <Text size="xs" c="blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/posts')}>Ver todos</Text>
                </Group>
                <Stack gap="xs">
                  {posts.map((post) => (
                    <Paper key={post.id} p="sm" radius="lg" withBorder style={{ cursor: 'pointer' }} onClick={() => navigate('/posts')}>
                      <Group gap="sm" wrap="nowrap">
                        <ThemeIcon size={36} radius="md" color="orange" variant="light">
                          <IconMapPin size={18} />
                        </ThemeIcon>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text fw={600} truncate size="sm">{post.name}</Text>
                          <Group gap="xs">
                            {post.distance !== undefined && (
                              <Text size="xs" c="blue" fw={600}>
                                {post.distance < 1 ? `${Math.round(post.distance * 1000)}m` : `${post.distance.toFixed(1)}km`}
                              </Text>
                            )}
                            <Text size="xs" c="dimmed">{post.city}</Text>
                          </Group>
                        </Box>
                        <ActionIcon variant="subtle" color="gray" size="sm"><IconChevronRight size={16} /></ActionIcon>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Group>
      </Stack>
    </Container>
  );
};

// ==================== COMPONENTE HOME ADMIN (SIMPLIFICADO) ====================
const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    { label: 'Aplicar Vacina', icon: IconUserPlus, path: '/admin/vaccination-application', color: 'blue', description: 'Registrar nova aplicação' },
    { label: 'Postos & Estoque', icon: IconPackage, path: '/admin/posts-stocks', color: 'teal', description: 'Gerenciar estoques' },
    { label: 'Vacinas Aplicadas', icon: IconHistory, path: '/admin/applied-vaccines', color: 'grape', description: 'Ver histórico de aplicações' },
    { label: 'Dashboard', icon: IconTrendingUp, path: '/admin', color: 'orange', description: 'Estatísticas detalhadas' },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={1} mb={4} fw={700} c="dark.7">
            Olá, {user?.name?.split(' ')[0]} 👋
          </Title>
          <Text c="dimmed" size="lg">
            O que você deseja fazer hoje?
          </Text>
        </Box>

        {/* Ações Rápidas */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {quickActions.map((item) => (
            <Paper 
              key={item.path}
              p="xl" 
              radius="lg" 
              withBorder
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => navigate(item.path)}
            >
              <ThemeIcon size={52} radius="xl" color={item.color} variant="light" mb="md">
                <item.icon size={26} />
              </ThemeIcon>
              <Text fw={700} size="lg" mb={4}>{item.label}</Text>
              <Text c="dimmed" size="sm">{item.description}</Text>
            </Paper>
          ))}
        </SimpleGrid>

        {/* Dica */}
        <Paper p="lg" radius="lg" withBorder bg="blue.0">
          <Group>
            <ThemeIcon size={40} radius="xl" color="blue" variant="light">
              <IconShieldCheck size={20} />
            </ThemeIcon>
            <Box>
              <Text fw={600}>Acesse o Dashboard para mais detalhes</Text>
              <Text size="sm" c="dimmed">
                Veja estatísticas completas, alertas de estoque e movimentações recentes.
              </Text>
            </Box>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================
const Home: React.FC = () => {
  const { user } = useAuth();
  
  // Admin vê a home simplificada, usuário vê a home completa
  if (user?.role === 'admin') {
    return <AdminHome />;
  }
  
  return <UserHome />;
};

export default Home;
