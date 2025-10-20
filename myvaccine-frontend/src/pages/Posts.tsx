import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Group,
  Button,
  Badge,
  Stack,
  Modal,
  Table,
  LoadingOverlay,
  Anchor,
} from '@mantine/core';
import { IconMapPin, IconEye, IconExternalLink } from '@tabler/icons-react';
import { postService, stockService } from '../services/services';
import { Post, Stock } from '../types';
import { notifications } from '@mantine/notifications';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stocksModalOpen, setStocksModalOpen] = useState(false);
  const [stocksLoading, setStocksLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getAll();
      setPosts(data);
    } catch (error) {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao carregar postos',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewStocks = async (post: Post) => {
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
    const address = encodeURIComponent(`${post.address}, ${post.city}, ${post.state}, Brasil`);
    return `https://www.google.com/maps/search/?api=1&query=${address}`;
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">
        Postos de Vacinação
      </Title>

      <LoadingOverlay visible={loading} />
      
      <Grid>
        {posts.map((post) => (
          <Grid.Col key={post.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3} size="h4">
                    {post.name}
                  </Title>
                  <Badge color={post.status === 'ativo' ? 'green' : 'red'}>
                    {post.status}
                  </Badge>
                </Group>

                <div>
                  <Text size="sm" c="dimmed" mb="xs">
                    <IconMapPin size={16} style={{ display: 'inline', marginRight: 4 }} />
                    Endereço
                  </Text>
                  <Text size="sm">{post.address}</Text>
                  <Text size="sm" c="dimmed">
                    {post.city} - {post.state}
                  </Text>
                </div>

                <Group gap="xs">
                  <Button
                    variant="light"
                    leftSection={<IconEye size={16} />}
                    onClick={() => handleViewStocks(post)}
                    style={{ flex: 1 }}
                  >
                    Ver Estoque
                  </Button>
                  
                  <Anchor
                    href={generateGoogleMapsLink(post)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Button
                      variant="outline"
                      leftSection={<IconExternalLink size={16} />}
                      color="blue"
                    >
                      Maps
                    </Button>
                  </Anchor>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Modal
        opened={stocksModalOpen}
        onClose={() => setStocksModalOpen(false)}
        title={`Estoque - ${selectedPost?.name}`}
        size="lg"
      >
        <LoadingOverlay visible={stocksLoading} />
        
        {stocks.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            Nenhuma vacina em estoque
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Vacina</Table.Th>
                <Table.Th>Quantidade</Table.Th>
                <Table.Th>Lote</Table.Th>
                <Table.Th>Validade</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {stocks.map((stock) => (
                <Table.Tr key={stock.id}>
                  <Table.Td>{stock.vaccine?.name}</Table.Td>
                  <Table.Td>
                    <Badge color={stock.quantity > 0 ? 'green' : 'red'}>
                      {stock.quantity}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{stock.batch}</Table.Td>
                  <Table.Td>
                    {new Date(stock.expiration_date).toLocaleDateString('pt-BR')}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Modal>
    </Container>
  );
};

export default Posts;
