import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tabs,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconAlertTriangle,
  IconBuilding,
  IconEdit,
  IconPackage,
  IconPlus,
  IconTrash,
  IconVaccine,
  IconPower,
  IconTimeline,
} from "@tabler/icons-react";
import React, { useEffect, useState, useMemo } from "react";
import {
  postService,
  stockService,
  vaccineService,
} from "../../services/services";
import { Post, Stock, Vaccine } from "../../types";
import { useNavigationState } from "../../hooks/useNavigationState";
import { ErrorDisplay } from "../../components/ErrorDisplay";

// Lista de estados brasileiros
const BRAZILIAN_STATES = [
  { value: "AC", label: "AC" },
  { value: "AL", label: "AL" },
  { value: "AP", label: "AP" },
  { value: "AM", label: "AM" },
  { value: "BA", label: "BA" },
  { value: "CE", label: "CE" },
  { value: "DF", label: "DF" },
  { value: "ES", label: "ES" },
  { value: "GO", label: "GO" },
  { value: "MA", label: "MA" },
  { value: "MT", label: "MT" },
  { value: "MS", label: "MS" },
  { value: "MG", label: "MG" },
  { value: "PA", label: "PA" },
  { value: "PB", label: "PB" },
  { value: "PR", label: "PR" },
  { value: "PE", label: "PE" },
  { value: "PI", label: "PI" },
  { value: "RJ", label: "RJ" },
  { value: "RN", label: "RN" },
  { value: "RS", label: "RS" },
  { value: "RO", label: "RO" },
  { value: "RR", label: "RR" },
  { value: "SC", label: "SC" },
  { value: "SP", label: "SP" },
  { value: "SE", label: "SE" },
  { value: "TO", label: "TO" },
];

const PostAndStockManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [postModalOpened, { open: openPostModal, close: closePostModal }] = useDisclosure(false);
  const [stockModalOpened, { open: openStockModal, close: closeStockModal }] = useDisclosure(false);
  
  const { isLoading, setLoading, error, setError, clearError } = useNavigationState();

  // Formulário para postos
  const postForm = useForm({
    initialValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      status: "ativo" as "ativo" | "inativo",
    },
    validate: {
      name: (value: string) =>
        value.length < 2 ? "Nome deve ter pelo menos 2 caracteres" : null,
      address: (value: string) =>
        value.length < 5 ? "Endereço deve ter pelo menos 5 caracteres" : null,
      city: (value: string) =>
        value.length < 2 ? "Cidade deve ter pelo menos 2 caracteres" : null,
      state: (value: string) =>
        !value ? "Selecione um estado" : null,
    },
  });

  // Formulário para estoque
  const stockForm = useForm({
    initialValues: {
      post_id: '',
      vaccine_id: '',
      quantity: 0,
      batch: "",
      expiration_date: "",
    },
    validate: {
      post_id: (value: string) => (value === '' ? "Selecione um posto" : null),
      vaccine_id: (value: string) =>
        value === '' ? "Selecione uma vacina" : null,
      quantity: (value: number) =>
        value <= 0 ? "Quantidade deve ser maior que 0" : null,
      batch: (value: string) =>
        value.length < 1 ? "Lote é obrigatório" : null,
      expiration_date: (value: string) =>
        !value ? "Data de validade é obrigatória" : null,
    },
  });

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      clearError();
      const [postsData, vaccinesData, stocksData] = await Promise.all([
        postService.getAll(),
        vaccineService.getAll(),
        stockService.getAll(),
      ]);
      setPosts(postsData);
      setVaccines(vaccinesData);
      setStocks(stocksData);
    } catch (error) {
      const errorMessage = "Erro ao carregar dados";
      setError(errorMessage);
      notifications.show({
        title: "Erro",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções para gestão de postos
  const handlePostSubmit = async (values: typeof postForm.values) => {
    try {
      if (editingPost) {
        await postService.update(editingPost.id, values);
        notifications.show({
          title: "Sucesso",
          message: "Posto atualizado com sucesso",
          color: "green",
        });
      } else {
        await postService.create(values);
        notifications.show({
          title: "Sucesso",
          message: "Posto criado com sucesso",
          color: "green",
        });
      }
      closePostModal();
      postForm.reset();
      setEditingPost(null);
      loadData();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao salvar posto",
        color: "red",
      });
    }
  };

  const handlePostEdit = (post: Post) => {
    setEditingPost(post);
    postForm.setValues({
      name: post.name,
      address: post.address,
      city: post.city,
      state: post.state,
      status: post.status,
    });
    openPostModal();
  };

  const handlePostDelete = async (id: number) => {
    try {
      await postService.delete(id);
      notifications.show({
        title: "Sucesso",
        message: "Posto excluído com sucesso",
        color: "green",
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao excluir posto",
        color: "red",
      });
    }
  };

  const handlePostToggleStatus = async (post: Post) => {
    try {
      await postService.toggleStatus(post.id);
      notifications.show({
        title: "Sucesso",
        message: `Posto ${
          post.status === "ativo" ? "inativado" : "ativado"
        } com sucesso`,
        color: "green",
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao alterar status do posto",
        color: "red",
      });
    }
  };

  // Funções para gestão de estoque
  const handleStockSubmit = async (values: typeof stockForm.values) => {
    try {
      // Converter valores string para number
      const stockData = {
        ...values,
        post_id: parseInt(values.post_id),
        vaccine_id: parseInt(values.vaccine_id),
      };

      if (editingStock) {
        await stockService.update(editingStock.id, stockData);
        notifications.show({
          title: "Sucesso",
          message: "Estoque atualizado com sucesso",
          color: "green",
        });
      } else {
        await stockService.create(stockData);
        notifications.show({
          title: "Sucesso",
          message: "Estoque adicionado com sucesso",
          color: "green",
        });
      }
      closeStockModal();
      stockForm.reset();
      setEditingStock(null);
      loadData();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao salvar estoque",
        color: "red",
      });
    }
  };

  const handleStockEdit = (stock: Stock) => {
    setEditingStock(stock);
    stockForm.setValues({
      post_id: stock.post_id.toString(),
      vaccine_id: stock.vaccine_id.toString(),
      quantity: stock.quantity,
      batch: stock.batch,
      expiration_date: stock.expiration_date,
    });
    openStockModal();
  };

  const handleStockDelete = async (id: number) => {
    try {
      await stockService.delete(id);
      notifications.show({
        title: "Sucesso",
        message: "Estoque excluído com sucesso",
        color: "green",
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao excluir estoque",
        color: "red",
      });
    }
  };

  const handlePostSelect = (postId: number) => {
    setSelectedPostId(postId);
  };

  // Calcular métricas com useMemo para otimização
  const activePosts = useMemo(() => 
    posts.filter(post => post.status === 'ativo'), 
    [posts]
  );
  
  const totalStocks = useMemo(() => stocks.length, [stocks]);
  
  const lowStockItems = useMemo(() => 
    stocks.filter(stock => stock.quantity < 10).length, 
    [stocks]
  );
  
  const expiredItems = useMemo(() => 
    stocks.filter(stock => {
      try {
        return new Date(stock.expiration_date) < new Date();
      } catch (error) {
        console.warn('Data de expiração inválida:', stock.expiration_date);
        return false;
      }
    }).length, 
    [stocks]
  );

  const selectedPost = useMemo(() => 
    posts.find(post => post.id === selectedPostId) || null,
    [posts, selectedPostId]
  );

  const selectedPostStocks = useMemo(() => {
    if (!selectedPostId) return [];
    return stocks.filter(stock => stock.post_id === selectedPostId);
  }, [selectedPostId, stocks]);

  const selectedPostMetrics = useMemo(() => {
    if (!selectedPostStocks.length) {
      return { totalItems: 0, lowStock: 0, expired: 0 };
    }

    const lowStock = selectedPostStocks.filter(stock => stock.quantity < 10).length;
    const expired = selectedPostStocks.filter(stock => {
      try {
        return new Date(stock.expiration_date) < new Date();
      } catch {
        return false;
      }
    }).length;

    return {
      totalItems: selectedPostStocks.length,
      lowStock,
      expired
    };
  }, [selectedPostStocks]);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Postos & Estoque
          </Title>
          <Text c="dimmed">
            Gerencie postos de vacinação e controle o estoque de vacinas
          </Text>
        </div>

        <LoadingOverlay visible={isLoading} />

        {/* Exibir erro se houver */}
        <ErrorDisplay 
          error={error} 
          onRetry={loadData} 
          onClear={clearError} 
        />

        {/* Métricas gerais */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">Total de Postos</Text>
                <Text size="xl" fw={700}>{posts.length}</Text>
                <Text size="xs" c="green">Ativos: {activePosts.length}</Text>
              </div>
              <IconBuilding size={24} color="var(--mantine-color-blue-6)" />
            </Group>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">Total de Vacinas</Text>
                <Text size="xl" fw={700}>{vaccines.length}</Text>
              </div>
              <IconVaccine size={24} color="var(--mantine-color-green-6)" />
            </Group>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">Itens em Estoque</Text>
                <Text size="xl" fw={700}>{totalStocks}</Text>
                {lowStockItems > 0 && (
                  <Text size="xs" c="orange">Baixo estoque: {lowStockItems}</Text>
                )}
              </div>
              <IconPackage size={24} color="var(--mantine-color-orange-6)" />
            </Group>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">Itens Vencidos</Text>
                <Text size="xl" fw={700}>{expiredItems}</Text>
                {expiredItems > 0 && (
                  <Text size="xs" c="red">Atenção!</Text>
                )}
              </div>
              <IconAlertTriangle size={24} color="var(--mantine-color-red-6)" />
            </Group>
          </Card>
        </SimpleGrid>

        {/* Alertas */}
        {(lowStockItems > 0 || expiredItems > 0) && (
          <Alert icon={<IconAlertTriangle size={16} />} title="Atenção" color="orange">
            {lowStockItems > 0 && `Existem ${lowStockItems} itens com estoque baixo. `}
            {expiredItems > 0 && `Existem ${expiredItems} itens vencidos. `}
            Verifique o estoque e tome as providências necessárias.
          </Alert>
        )}

        {/* Abas principais */}
        <Tabs defaultValue="posts">
          <Tabs.List>
            <Tabs.Tab value="posts" leftSection={<IconBuilding size={16} />}>
              Gestão de Postos
            </Tabs.Tab>
            <Tabs.Tab value="stock" leftSection={<IconPackage size={16} />}>
              Controle de Estoque
            </Tabs.Tab>
            <Tabs.Tab value="post-stock" leftSection={<IconTimeline size={16} />}>
              Estoque por Posto
            </Tabs.Tab>
          </Tabs.List>

          {/* Aba: Gestão de Postos */}
          <Tabs.Panel value="posts" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>Postos de Vacinação</Title>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    setEditingPost(null);
                    postForm.reset();
                    openPostModal();
                  }}
                >
                  Novo Posto
                </Button>
              </Group>

              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nome</Table.Th>
                    <Table.Th>Endereço</Table.Th>
                    <Table.Th>Cidade/Estado</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Ações</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {posts.map((post) => (
                    <Table.Tr key={post.id}>
                      <Table.Td>{post.name}</Table.Td>
                      <Table.Td>{post.address}</Table.Td>
                      <Table.Td>{post.city}/{post.state}</Table.Td>
                      <Table.Td>
                        <Badge color={post.status === "ativo" ? "green" : "red"}>
                          {post.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handlePostEdit(post)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color={post.status === "ativo" ? "orange" : "green"}
                            onClick={() => handlePostToggleStatus(post)}
                          >
                            <IconPower size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handlePostDelete(post.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Tabs.Panel>

          {/* Aba: Controle de Estoque */}
          <Tabs.Panel value="stock" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>Controle de Estoque</Title>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    setEditingStock(null);
                    stockForm.reset();
                    openStockModal();
                  }}
                >
                  Adicionar Estoque
                </Button>
              </Group>

              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Posto</Table.Th>
                    <Table.Th>Vacina</Table.Th>
                    <Table.Th>Quantidade</Table.Th>
                    <Table.Th>Lote</Table.Th>
                    <Table.Th>Validade</Table.Th>
                    <Table.Th>Ações</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {stocks.map((stock) => {
                    const post = posts.find(p => p.id === stock.post_id);
                    const vaccine = vaccines.find(v => v.id === stock.vaccine_id);
                    const isExpired = new Date(stock.expiration_date) < new Date();
                    const isLowStock = stock.quantity < 10;
                    
                    return (
                      <Table.Tr key={stock.id}>
                        <Table.Td>{post?.name || 'N/A'}</Table.Td>
                        <Table.Td>{vaccine?.name || 'N/A'}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Text>{stock.quantity}</Text>
                            {isLowStock && (
                              <Badge size="xs" color="orange">Baixo</Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>{stock.batch}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Text>{new Date(stock.expiration_date).toLocaleDateString()}</Text>
                            {isExpired && (
                              <Badge size="xs" color="red">Vencido</Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleStockEdit(stock)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleStockDelete(stock.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Stack>
          </Tabs.Panel>

          {/* Aba: Estoque por Posto */}
          <Tabs.Panel value="post-stock" pt="md">
            <Stack gap="md">
              <Title order={3}>Estoque por Posto</Title>
              
              {/* Seleção de posto */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Selecionar Posto
                </Title>
                <Select
                  placeholder="Escolha um posto para visualizar o estoque"
                  data={posts.map((post) => ({
                    value: post.id.toString(),
                    label: `${post.name} - ${post.city}/${post.state} ${
                      post.status === "inativo" ? "(INATIVO)" : ""
                    }`,
                  }))}
                  onChange={(value) => value && handlePostSelect(parseInt(value))}
                  searchable
                />
                <Text size="xs" c="dimmed" mt="xs">
                  💡 Postos inativos são mostrados com "(INATIVO)" - seu estoque não é
                  considerado nas estatísticas gerais
                </Text>
              </Card>

              {/* Métricas do posto selecionado */}
              {selectedPost && (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Title order={4} mb="md">
                    Estoque - {selectedPost.name}
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 3 }}>
                    <div>
                      <Text size="sm" c="dimmed">Total de Itens</Text>
                      <Text size="xl" fw={700}>{selectedPostMetrics.totalItems}</Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">Baixo Estoque</Text>
                      <Text size="xl" fw={700} c="orange">
                        {selectedPostMetrics.lowStock}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">Vencidos</Text>
                      <Text size="xl" fw={700} c="red">
                        {selectedPostMetrics.expired}
                      </Text>
                    </div>
                  </SimpleGrid>
                </Card>
              )}

              {/* Tabela de estoque do posto selecionado */}
              {selectedPost && (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Vacina</Table.Th>
                      <Table.Th>Quantidade</Table.Th>
                      <Table.Th>Lote</Table.Th>
                      <Table.Th>Validade</Table.Th>
                      <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedPostStocks.length > 0 ? (
                      selectedPostStocks.map((stock) => {
                        const vaccine = vaccines.find(v => v.id === stock.vaccine_id);
                        const isExpired = (() => {
                          try {
                            return new Date(stock.expiration_date) < new Date();
                          } catch (error) {
                            console.warn('Data de expiração inválida:', stock.expiration_date);
                            return false;
                          }
                        })();
                        const isLowStock = stock.quantity < 10;
                        
                        return (
                          <Table.Tr key={stock.id}>
                            <Table.Td>{vaccine?.name || 'N/A'}</Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <Text>{stock.quantity}</Text>
                                {isLowStock && (
                                  <Badge size="xs" color="orange">Baixo</Badge>
                                )}
                              </Group>
                            </Table.Td>
                            <Table.Td>{stock.batch}</Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <Text>{(() => {
                                  try {
                                    return new Date(stock.expiration_date).toLocaleDateString();
                                  } catch (error) {
                                    return 'Data inválida';
                                  }
                                })()}</Text>
                                {isExpired && (
                                  <Badge size="xs" color="red">Vencido</Badge>
                                )}
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <ActionIcon
                                  variant="subtle"
                                  color="blue"
                                  onClick={() => handleStockEdit(stock)}
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleStockDelete(stock.id)}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={5} ta="center" c="dimmed">
                          Nenhum estoque encontrado para este posto
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Modal para gestão de postos */}
        <Modal
          opened={postModalOpened}
          onClose={() => {
            closePostModal();
            setEditingPost(null);
            postForm.reset();
          }}
          title={editingPost ? "Editar Posto" : "Novo Posto"}
        >
          <form onSubmit={postForm.onSubmit(handlePostSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Nome"
                placeholder="Nome do posto"
                {...postForm.getInputProps("name")}
              />
              <TextInput
                label="Endereço"
                placeholder="Endereço completo"
                {...postForm.getInputProps("address")}
              />
              <Group grow>
                <TextInput
                  label="Cidade"
                  placeholder="Cidade"
                  {...postForm.getInputProps("city")}
                />
                <Select
                  label="Estado"
                  placeholder="Selecione o estado"
                  data={BRAZILIAN_STATES}
                  searchable
                  {...postForm.getInputProps("state")}
                />
              </Group>
              <Select
                label="Status"
                data={[
                  { value: "ativo", label: "Ativo" },
                  { value: "inativo", label: "Inativo" },
                ]}
                {...postForm.getInputProps("status")}
              />
              <Group justify="flex-end">
                <Button variant="outline" onClick={closePostModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPost ? "Atualizar" : "Criar"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Modal para gestão de estoque */}
        <Modal
          opened={stockModalOpened}
          onClose={() => {
            closeStockModal();
            setEditingStock(null);
            stockForm.reset();
          }}
          title={editingStock ? "Editar Estoque" : "Adicionar Estoque"}
        >
          <form onSubmit={stockForm.onSubmit(handleStockSubmit)}>
            <Stack gap="md">
              <Select
                label="Posto"
                placeholder="Selecione um posto"
                data={posts.map((post) => ({
                  value: post.id.toString(),
                  label: `${post.name} - ${post.city}/${post.state}`,
                }))}
                {...stockForm.getInputProps("post_id")}
              />
              <Select
                label="Vacina"
                placeholder="Selecione uma vacina"
                data={vaccines.map((vaccine) => ({
                  value: vaccine.id.toString(),
                  label: vaccine.name,
                }))}
                {...stockForm.getInputProps("vaccine_id")}
              />
              <NumberInput
                label="Quantidade"
                placeholder="Quantidade em estoque"
                min={0}
                {...stockForm.getInputProps("quantity")}
              />
              <TextInput
                label="Lote"
                placeholder="Número do lote"
                {...stockForm.getInputProps("batch")}
              />
              <TextInput
                label="Data de Validade"
                type="date"
                {...stockForm.getInputProps("expiration_date")}
              />
              <Group justify="flex-end">
                <Button variant="outline" onClick={closeStockModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingStock ? "Atualizar" : "Adicionar"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
};

export default PostAndStockManagement;
