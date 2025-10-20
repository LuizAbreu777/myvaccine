import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconBuilding,
  IconEye,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconUsers,
  IconVaccine
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  postService,
  stockService,
  vaccinationHistoryService,
  vaccineService,
} from "../../services/services";
import { Post, Stock, VaccinationHistory, Vaccine } from "../../types";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [history, setHistory] = useState<VaccinationHistory[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [vaccinesData, postsData, historyData, stocksData] = await Promise.all([
        vaccineService.getAll(),
        postService.getAll(),
        vaccinationHistoryService.getAll(),
        stockService.getAll(),
      ]);

      console.log("📊 Dados carregados:", {
        vaccines: vaccinesData.length,
        posts: postsData.length,
        history: historyData.length,
        stocks: stocksData.length
      });

      setVaccines(vaccinesData);
      setPosts(postsData);
      setHistory(historyData);
      setStocks(stocksData);
    } catch (error) {
      console.error("❌ Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas avançadas (apenas postos ativos)
  const activePosts = posts.filter(post => post.status === 'ativo');
  const activePostIds = activePosts.map(post => post.id);
  
  const activeStocks = stocks.filter(stock => activePostIds.includes(stock.post_id));
  const totalStockQuantity = activeStocks.reduce((sum, stock) => sum + stock.quantity, 0);
  const lowStockItems = activeStocks.filter(stock => stock.quantity < 10);
  const expiredItems = activeStocks.filter(stock => new Date(stock.expiration_date) < new Date());
  const expiringSoonItems = activeStocks.filter(stock => {
    const expirationDate = new Date(stock.expiration_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expirationDate <= thirtyDaysFromNow && expirationDate > new Date();
  });
  
  // Postos ativos sem estoque
  const postsWithStockIds = activeStocks.map(stock => stock.post_id);
  const uniquePostsWithStock = postsWithStockIds.filter((id, index) => postsWithStockIds.indexOf(id) === index);
  const postsWithoutStock = activePosts.filter(post => !uniquePostsWithStock.includes(post.id));

  console.log("📈 Métricas calculadas:", {
    totalStockQuantity,
    lowStockItems: lowStockItems.length,
    expiredItems: expiredItems.length,
    expiringSoonItems: expiringSoonItems.length,
    postsAtivos: activePosts.length,
    postsTotal: posts.length,
    estoqueAtivo: activeStocks.length,
    estoqueTotal: stocks.length,
    postsSemEstoque: postsWithoutStock.length
  });

  const stats = [
    {
      title: "Total de Vacinas",
      value: vaccines.length,
      icon: IconVaccine,
      color: "blue",
      description: "Tipos cadastrados",
    },
    {
      title: "Postos Ativos",
      value: activePosts.length,
      icon: IconBuilding,
      color: "green",
      description: `${posts.length} total`,
    },
    {
      title: "Estoque Ativo",
      value: totalStockQuantity,
      icon: IconPackage,
      color: "orange",
      description: "Doses em postos ativos",
    },
    {
      title: "Vacinas Aplicadas",
      value: history.length,
      icon: IconUsers,
      color: "purple",
      description: "Total de aplicações",
    },
  ];

  const quickActions = [
    {
      title: "Aplicar Vacina",
      description: "Registrar nova aplicação",
      icon: IconPlus,
      color: "green",
      action: () => navigate("/admin/vaccination-application"),
    },
    {
      title: "Estoque por Posto",
      description: "Gerenciar estoque individual",
      icon: IconPackage,
      color: "blue",
      action: () => navigate("/admin/post-stocks"),
    },
    {
      title: "Cadastrar Posto",
      description: "Novo posto de vacinação",
      icon: IconBuilding,
      color: "orange",
      action: () => navigate("/admin/posts"),
    },
    {
      title: "Ver Histórico",
      description: "Consultar aplicações",
      icon: IconEye,
      color: "purple",
      action: () => navigate("/admin/vaccination-history"),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1} mb="md">
              Dashboard Administrativo
            </Title>
            <Text c="dimmed">Visão geral do sistema MyVaccine</Text>
          </div>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={loadDashboardData}
            loading={loading}
          >
            Atualizar
          </Button>
        </Group>

        <LoadingOverlay visible={loading} />

        {/* Alertas importantes */}
        {(lowStockItems.length > 0 || expiredItems.length > 0 || expiringSoonItems.length > 0 || postsWithoutStock.length > 0) && (
          <Stack gap="md">
            {lowStockItems.length > 0 && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                title="Estoque Baixo"
                color="yellow"
              >
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    {lowStockItems.length} item(s) com estoque baixo (&lt; 10 doses) em postos ativos:
                  </Text>
                  {lowStockItems.map((stock, index) => (
                    <Text key={index} size="xs" c="dimmed">
                      • <Text component="span" fw={500}>{stock.post?.name}</Text> - {stock.vaccine?.name}: {stock.quantity} doses (Lote: {stock.batch})
                    </Text>
                  ))}
                </Stack>
              </Alert>
            )}
            {expiredItems.length > 0 && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                title="Vacinas Vencidas"
                color="red"
              >
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    {expiredItems.length} item(s) vencido(s) em postos ativos - Remover do estoque:
                  </Text>
                  {expiredItems.map((stock, index) => (
                    <Text key={index} size="xs" c="dimmed">
                      • <Text component="span" fw={500}>{stock.post?.name}</Text> - {stock.vaccine?.name}: {stock.quantity} doses (Venceu em {new Date(stock.expiration_date).toLocaleDateString('pt-BR')})
                    </Text>
                  ))}
                </Stack>
              </Alert>
            )}
            {expiringSoonItems.length > 0 && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                title="Vencimento Próximo"
                color="orange"
              >
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    {expiringSoonItems.length} item(s) vence(m) em até 30 dias em postos ativos:
                  </Text>
                  {expiringSoonItems.map((stock, index) => (
                    <Text key={index} size="xs" c="dimmed">
                      • <Text component="span" fw={500}>{stock.post?.name}</Text> - {stock.vaccine?.name}: {stock.quantity} doses (Vence em {new Date(stock.expiration_date).toLocaleDateString('pt-BR')})
                    </Text>
                  ))}
                </Stack>
              </Alert>
            )}
            {postsWithoutStock.length > 0 && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                title="Postos Sem Estoque"
                color="blue"
              >
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    {postsWithoutStock.length} posto(s) ativo(s) sem nenhuma vacina em estoque:
                  </Text>
                  {postsWithoutStock.map((post, index) => (
                    <Text key={index} size="xs" c="dimmed">
                      • <Text component="span" fw={500}>{post.name}</Text> - {post.city}/{post.state}
                    </Text>
                  ))}
                  <Text size="xs" c="dimmed" mt="xs">
                    💡 Considere adicionar vacinas a estes postos para manter a operação
                  </Text>
                </Stack>
              </Alert>
            )}
          </Stack>
        )}

        {/* Métricas principais */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          {stats.map((stat, index) => (
            <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed" mb="xs">
                    {stat.title}
                  </Text>
                  <Text size="xl" fw={700} c={stat.color}>
                    {stat.value}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {stat.description}
                  </Text>
                </div>
                <stat.icon
                  size={32}
                  color={`var(--mantine-color-${stat.color}-6)`}
                />
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <Grid>
          {/* Ações rápidas */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                Ações Rápidas
              </Title>
              <SimpleGrid cols={2}>
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="light"
                    color={action.color}
                    leftSection={<action.icon size={16} />}
                    onClick={action.action}
                    style={{ height: 'auto', padding: '16px' }}
                  >
                    <div>
                      <Text size="sm" fw={500}>{action.title}</Text>
                      <Text size="xs" c="dimmed">{action.description}</Text>
                    </div>
                  </Button>
                ))}
              </SimpleGrid>
            </Card>
          </Grid.Col>

          {/* Status dos postos */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                Status dos Postos
              </Title>
              <Stack gap="md">
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Postos Ativos</Text>
                    <Text size="sm" fw={500}>
                      {posts.filter(p => p.status === "ativo").length} / {posts.length}
                    </Text>
                  </Group>
                  <Progress
                    value={(posts.filter(p => p.status === "ativo").length / posts.length) * 100}
                    color="green"
                    size="sm"
                  />
                </div>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Postos Inativos</Text>
                    <Text size="sm" fw={500}>
                      {posts.filter(p => p.status === "inativo").length} / {posts.length}
                    </Text>
                  </Group>
                  <Progress
                    value={(posts.filter(p => p.status === "inativo").length / posts.length) * 100}
                    color="red"
                    size="sm"
                  />
                </div>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Vacinações recentes */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Title order={3}>Vacinações Recentes</Title>
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => navigate("/admin/vaccination-history")}
                >
                  Ver todas
                </Button>
              </Group>
              {history.slice(0, 5).map((record, index) => (
                <div key={index}>
                  <Group justify="space-between" py="xs">
                    <div>
                      <Text size="sm" fw={500}>
                        {record.user?.name} - {record.vaccine?.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {record.post?.name} • {new Date(record.created_at).toLocaleDateString('pt-BR')}
                      </Text>
                    </div>
                    <Badge color="green" size="sm">
                      Aplicada
                    </Badge>
                  </Group>
                  {index < 4 && <Divider />}
                </div>
              ))}
              {history.length === 0 && (
                <Text ta="center" c="dimmed" py="xl">
                  Nenhuma vacinação registrada
                </Text>
              )}
            </Card>
          </Grid.Col>

          {/* Resumo do estoque */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                Resumo do Estoque
              </Title>
              <Stack gap="md">
                <div>
                  <Text size="sm" c="dimmed">Doses em Postos Ativos</Text>
                  <Text size="lg" fw={700}>{totalStockQuantity}</Text>
                  <Text size="xs" c="dimmed">de {stocks.reduce((sum, stock) => sum + stock.quantity, 0)} total</Text>
                </div>
                
                <Divider />
                
                <div>
                  <Text size="sm" c="dimmed">Estoque Baixo (Ativos)</Text>
                  <Text size="lg" fw={700} c={lowStockItems.length > 0 ? "yellow" : "green"}>
                    {lowStockItems.length}
                  </Text>
                  {lowStockItems.length > 0 && (
                    <Text size="xs" c="dimmed">
                      {lowStockItems.map(stock => stock.post?.name).join(', ')}
                    </Text>
                  )}
                </div>
                
                <div>
                  <Text size="sm" c="dimmed">Vencendo em 30 dias</Text>
                  <Text size="lg" fw={700} c={expiringSoonItems.length > 0 ? "orange" : "green"}>
                    {expiringSoonItems.length}
                  </Text>
                  {expiringSoonItems.length > 0 && (
                    <Text size="xs" c="dimmed">
                      {expiringSoonItems.map(stock => stock.post?.name).join(', ')}
                    </Text>
                  )}
                </div>
                
                <div>
                  <Text size="sm" c="dimmed">Vacinas Vencidas</Text>
                  <Text size="lg" fw={700} c={expiredItems.length > 0 ? "red" : "green"}>
                    {expiredItems.length}
                  </Text>
                  {expiredItems.length > 0 && (
                    <Text size="xs" c="dimmed">
                      {expiredItems.map(stock => stock.post?.name).join(', ')}
                    </Text>
                  )}
                </div>
                
                <Button
                  variant="light"
                  fullWidth
                  onClick={() => navigate("/admin/post-stocks")}
                >
                  Gerenciar Estoque por Posto
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default AdminDashboard;