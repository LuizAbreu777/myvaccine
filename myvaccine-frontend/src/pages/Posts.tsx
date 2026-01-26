import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Modal,
  LoadingOverlay,
  Paper,
  ThemeIcon,
  Box,
  SimpleGrid,
  Center,
  Loader,
  TextInput,
  SegmentedControl,
  Anchor,
  Button,
  Tooltip,
} from '@mantine/core';
import { 
  IconMapPin, 
  IconVaccine, 
  IconExternalLink,
  IconSearch,
  IconBuilding,
  IconNavigation,
  IconAlertTriangle,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { postService, stockService } from '../services/services';
import { Post, Stock } from '../types';
import { notifications } from '@mantine/notifications';

interface PostWithDistance extends Post {
  distance?: number;
  totalStock?: number;
  availableVaccines?: number;
}

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<PostWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostWithDistance | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stocksModalOpen, setStocksModalOpen] = useState(false);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Calcular distância usando Haversine
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

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => console.log('Localização não disponível'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const [postsData, stocksData] = await Promise.all([
        postService.getAll(),
        stockService.getAll().catch(() => []),
      ]);

      // Calcular estoque total por posto
      const stockByPost = new Map<number, { total: number; vaccines: number }>();
      stocksData.forEach((stock: Stock) => {
        const current = stockByPost.get(stock.post_id) || { total: 0, vaccines: 0 };
        if (stock.quantity > 0) {
          current.total += stock.quantity;
          current.vaccines += 1;
        }
        stockByPost.set(stock.post_id, current);
      });

      // Adicionar distância e estoque aos postos
      let enrichedPosts = postsData.map(post => {
        const stockInfo = stockByPost.get(post.id) || { total: 0, vaccines: 0 };
        return {
          ...post,
          distance: userLocation && post.latitude && post.longitude
            ? calculateDistance(userLocation.lat, userLocation.lng, post.latitude, post.longitude)
            : undefined,
          totalStock: stockInfo.total,
          availableVaccines: stockInfo.vaccines,
        };
      });

      // Ordenar por distância se disponível
      enrichedPosts.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });

      setPosts(enrichedPosts);
    } catch (error) {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao carregar postos',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [userLocation, calculateDistance]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleViewStocks = async (post: PostWithDistance) => {
    try {
      setStocksLoading(true);
      setSelectedPost(post);
      const data = await stockService.getByPost(post.id);
      setStocks(data);
      setStocksModalOpen(true);
    } catch (error) {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao carregar estoque',
        color: 'red',
      });
    } finally {
      setStocksLoading(false);
    }
  };

  const generateGoogleMapsLink = (post: Post) => {
    if (post.latitude && post.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`;
    }
    const address = encodeURIComponent(`${post.address}, ${post.city}, ${post.state}, Brasil`);
    return `https://www.google.com/maps/search/?api=1&query=${address}`;
  };

  const formatDistance = (distance?: number) => {
    if (distance === undefined) return null;
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  // Filtrar postos
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activePosts = posts.filter(p => p.status === 'ativo').length;
  const totalVaccines = posts.reduce((acc, p) => acc + (p.availableVaccines || 0), 0);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Title order={1} mb={4} fw={700}>
            Postos de Vacinação
          </Title>
          <Text c="dimmed" size="lg">
            Encontre o posto mais próximo e veja as vacinas disponíveis
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Paper p="md" radius="lg" withBorder>
            <Group gap="sm">
              <ThemeIcon size={40} radius="xl" color="blue" variant="light">
                <IconBuilding size={20} />
              </ThemeIcon>
              <Box>
                <Text fz={24} fw={700} lh={1}>{posts.length}</Text>
                <Text size="xs" c="dimmed">Total de Postos</Text>
              </Box>
            </Group>
          </Paper>
          <Paper p="md" radius="lg" withBorder>
            <Group gap="sm">
              <ThemeIcon size={40} radius="xl" color="green" variant="light">
                <IconCheck size={20} />
              </ThemeIcon>
              <Box>
                <Text fz={24} fw={700} lh={1}>{activePosts}</Text>
                <Text size="xs" c="dimmed">Postos Ativos</Text>
              </Box>
            </Group>
          </Paper>
          <Paper p="md" radius="lg" withBorder>
            <Group gap="sm">
              <ThemeIcon size={40} radius="xl" color="grape" variant="light">
                <IconVaccine size={20} />
              </ThemeIcon>
              <Box>
                <Text fz={24} fw={700} lh={1}>{totalVaccines}</Text>
                <Text size="xs" c="dimmed">Tipos de Vacinas</Text>
              </Box>
            </Group>
          </Paper>
          <Paper p="md" radius="lg" withBorder>
            <Group gap="sm">
              <ThemeIcon size={40} radius="xl" color="orange" variant="light">
                <IconNavigation size={20} />
              </ThemeIcon>
              <Box>
                <Text fz={24} fw={700} lh={1}>
                  {userLocation ? '✓' : '—'}
                </Text>
                <Text size="xs" c="dimmed">
                  {userLocation ? 'GPS Ativo' : 'GPS Inativo'}
                </Text>
              </Box>
            </Group>
          </Paper>
        </SimpleGrid>

        {/* Filtros */}
        <Paper p="md" radius="lg" style={{ backgroundColor: '#ffffff'}}>
          <Group gap="md" wrap="wrap">
            <TextInput
              placeholder="Buscar posto..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <SegmentedControl
              value={filterStatus}
              onChange={setFilterStatus}
              data={[
                { label: 'Todos', value: 'todos' },
                { label: 'Ativos', value: 'ativo' },
                { label: 'Inativos', value: 'inativo' },
              ]}
            />
          </Group>
        </Paper>

        {/* Lista de Postos */}
        {filteredPosts.length === 0 ? (
          <Paper p="xl" radius="lg" withBorder>
            <Center>
              <Stack align="center" gap="sm">
                <ThemeIcon size={60} radius="xl" color="gray" variant="light">
                  <IconBuilding size={30} />
                </ThemeIcon>
                <Text c="dimmed">Nenhum posto encontrado</Text>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {filteredPosts.map((post, index) => (
              <Paper
                key={post.id}
                p="lg"
                radius="lg"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => handleViewStocks(post)}
              >
                {/* Ranking Badge */}
                {index < 3 && userLocation && post.distance !== undefined && (
                  <Badge
                    size="sm"
                    variant="filled"
                    color={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                    }}
                  >
                    {index === 0 ? '🥇 Mais próximo' : index === 1 ? '🥈 2º' : '🥉 3º'}
                  </Badge>
                )}

                <Stack gap="md">
                  {/* Header do Card */}
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon 
                      size={48} 
                      radius="xl" 
                      color={post.status === 'ativo' ? 'blue' : 'gray'} 
                      variant="light"
                    >
                      <IconBuilding size={24} />
                    </ThemeIcon>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} size="md" lineClamp={1}>{post.name}</Text>
                      <Group gap={4}>
                        <Badge 
                          size="xs" 
                          color={post.status === 'ativo' ? 'green' : 'red'} 
                          variant="light"
                        >
                          {post.status === 'ativo' ? 'Aberto' : 'Fechado'}
                        </Badge>
                        {post.distance !== undefined && (
                          <Badge size="xs" color="blue" variant="light">
                            {formatDistance(post.distance)}
                          </Badge>
                        )}
                      </Group>
                    </Box>
                  </Group>

                  {/* Endereço */}
                  <Box>
                    <Group gap={4} mb={4}>
                      <IconMapPin size={14} color="var(--mantine-color-dimmed)" />
                      <Text size="xs" c="dimmed" fw={500}>Endereço</Text>
                    </Group>
                    <Text size="sm" lineClamp={2}>{post.address}</Text>
                    <Text size="xs" c="dimmed">{post.city} - {post.state}</Text>
                  </Box>

                  {/* Botões */}
                  <Group gap="xs">
                    <Button
                      variant="dark"
                      color="blue"
                      size="sm"
                      style={{ flex: 1 }}
                      leftSection={<IconVaccine size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewStocks(post);
                      }}
                    >
                      Ver Vacinas
                    </Button>
                    <Anchor
                      href={generateGoogleMapsLink(post)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        color="gray"
                        size="sm"
                        leftSection={<IconExternalLink size={16} />}
                      >
                        Mapa
                      </Button>
                    </Anchor>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        )}
      </Stack>

      {/* Modal de Estoque Melhorado */}
      <Modal
        opened={stocksModalOpen}
        onClose={() => setStocksModalOpen(false)}
        title={
          <Group gap="sm">
            <ThemeIcon size={32} radius="xl" color="blue" variant="light">
              <IconBuilding size={18} />
            </ThemeIcon>
            <Box>
              <Text fw={700}>{selectedPost?.name}</Text>
              <Text size="xs" c="dimmed">{selectedPost?.city} - {selectedPost?.state}</Text>
            </Box>
          </Group>
        }
        size="lg"
        radius="lg"
      >
        <LoadingOverlay visible={stocksLoading} />
        
        <Stack gap="md">
          {/* Info do Posto */}
          <Paper p="md" radius="md" bg="gray.0">
            <Group gap="lg">
              <Group gap="xs">
                <IconMapPin size={16} />
                <Text size="sm">{selectedPost?.address}</Text>
              </Group>
              {selectedPost?.distance !== undefined && (
                <Badge color="blue" variant="light">
                  {formatDistance(selectedPost.distance)} de distância
                </Badge>
              )}
            </Group>
          </Paper>

          {/* Lista de Vacinas */}
          <Text fw={600} size="sm">Vacinas Disponíveis</Text>
          
          {stocks.length === 0 ? (
            <Paper p="xl" radius="md" withBorder>
              <Center>
                <Stack align="center" gap="xs">
                  <ThemeIcon size={48} radius="xl" color="gray" variant="light">
                    <IconX size={24} />
                  </ThemeIcon>
                  <Text c="dimmed">Nenhuma vacina em estoque</Text>
                </Stack>
              </Center>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {stocks.map((stock) => {
                const isLowStock = stock.quantity < 10;
                const isExpiringSoon = new Date(stock.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                
                return (
                  <Paper 
                    key={stock.id} 
                    p="md" 
                    radius="md" 
                    withBorder
                    style={{
                      borderLeft: `4px solid ${stock.quantity > 0 ? 'var(--mantine-color-green-5)' : 'var(--mantine-color-red-5)'}`,
                    }}
                  >
                    <Group justify="space-between" mb="xs">
                      <Group gap="xs">
                        <ThemeIcon 
                          size={28} 
                          radius="md" 
                          color={stock.quantity > 0 ? 'green' : 'red'} 
                          variant="light"
                        >
                          <IconVaccine size={14} />
                        </ThemeIcon>
                        <Text fw={600} size="sm" lineClamp={1}>
                          {stock.vaccine?.name?.replace('Vacina contra ', '').replace('Vacina ', '')}
                        </Text>
                      </Group>
                      {isLowStock && stock.quantity > 0 && (
                        <Tooltip label="Estoque baixo">
                          <ThemeIcon size={20} radius="xl" color="orange" variant="light">
                            <IconAlertTriangle size={12} />
                          </ThemeIcon>
                        </Tooltip>
                      )}
                    </Group>
                    
                    <SimpleGrid cols={3} spacing="xs">
                      <Box>
                        <Text size="xs" c="dimmed">Quantidade</Text>
                        <Text size="sm" fw={700} c={stock.quantity > 0 ? 'green' : 'red'}>
                          {stock.quantity} doses
                        </Text>
                      </Box>
                      <Box>
                        <Text size="xs" c="dimmed">Lote</Text>
                        <Text size="sm" fw={500}>{stock.batch}</Text>
                      </Box>
                      <Box>
                        <Text size="xs" c="dimmed">Validade</Text>
                        <Text size="sm" fw={500} c={isExpiringSoon ? 'orange' : undefined}>
                          {new Date(stock.expiration_date).toLocaleDateString('pt-BR')}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Paper>
                );
              })}
            </SimpleGrid>
          )}

          {/* Link para o Maps */}
          {selectedPost && (
            <Anchor
              href={generateGoogleMapsLink(selectedPost)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="light"
                color="blue"
                fullWidth
                leftSection={<IconNavigation size={16} />}
              >
                Abrir no Google Maps
              </Button>
            </Anchor>
          )}
        </Stack>
      </Modal>
    </Container>
  );
};

export default Posts;
