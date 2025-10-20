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
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import {
  postService,
  stockService,
  vaccineService,
} from "../../services/services";
import { Post, Stock, Vaccine } from "../../types";

const PostStockManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      post_id: 0,
      vaccine_id: 0,
      quantity: 0,
      batch: "",
      expiration_date: "",
    },
    validate: {
      post_id: (value: number) => (value <= 0 ? "Selecione um posto" : null),
      vaccine_id: (value: number) =>
        value <= 0 ? "Selecione uma vacina" : null,
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
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, vaccinesData, stocksData] = await Promise.all([
        postService.getAll(),
        vaccineService.getAll(),
        stockService.getAll(),
      ]);
      setPosts(postsData);
      setVaccines(vaccinesData);
      setStocks(stocksData);
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao carregar dados",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingStock) {
        await stockService.update(editingStock.id, values);
        notifications.show({
          title: "Sucesso",
          message: "Estoque atualizado com sucesso!",
          color: "green",
        });
      } else {
        await stockService.create(values);
        notifications.show({
          title: "Sucesso",
          message: "Estoque adicionado com sucesso!",
          color: "green",
        });
      }

      form.reset();
      setEditingStock(null);
      close();
      loadData();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao salvar estoque",
        color: "red",
      });
    }
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    form.setValues({
      post_id: stock.post_id,
      vaccine_id: stock.vaccine_id,
      quantity: stock.quantity,
      batch: stock.batch,
      expiration_date: stock.expiration_date.split("T")[0], // Converte para formato de input date
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja remover este estoque?")) {
      try {
        await stockService.delete(id);
        notifications.show({
          title: "Sucesso",
          message: "Estoque removido com sucesso!",
          color: "green",
        });
        loadData();
      } catch (error) {
        notifications.show({
          title: "Erro",
          message: "Erro ao remover estoque",
          color: "red",
        });
      }
    }
  };

  const handleNew = () => {
    setEditingStock(null);
    form.reset();
    open();
  };

  const handlePostSelect = (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    setSelectedPost(post || null);
  };

  // Calcular métricas por posto
  const getPostMetrics = (postId: number) => {
    const postStocks = stocks.filter((stock) => stock.post_id === postId);
    const totalQuantity = postStocks.reduce(
      (sum, stock) => sum + stock.quantity,
      0
    );
    const lowStockItems = postStocks.filter((stock) => stock.quantity < 10);
    const expiredItems = postStocks.filter(
      (stock) => new Date(stock.expiration_date) < new Date()
    );
    const expiringSoonItems = postStocks.filter((stock) => {
      const expirationDate = new Date(stock.expiration_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expirationDate <= thirtyDaysFromNow && expirationDate > new Date();
    });

    return {
      totalQuantity,
      lowStockItems: lowStockItems.length,
      expiredItems: expiredItems.length,
      expiringSoonItems: expiringSoonItems.length,
      totalItems: postStocks.length,
    };
  };

  const selectedPostStocks = selectedPost
    ? stocks.filter((stock) => stock.post_id === selectedPost.id)
    : [];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Gerenciamento de Estoque por Posto
          </Title>
          <Text c="dimmed">
            Gerencie o estoque de vacinas de cada posto individualmente
          </Text>
        </div>

        <LoadingOverlay visible={loading} />

        {/* Seleção de posto */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            Selecionar Posto
          </Title>
          <Select
            placeholder="Escolha um posto para gerenciar o estoque"
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
            <Group justify="space-between" mb="md">
              <Title order={3}>
                <IconBuilding size={20} style={{ marginRight: 8 }} />
                {selectedPost.name}
              </Title>
              <Badge color={selectedPost.status === "ativo" ? "green" : "red"}>
                {selectedPost.status}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
              {selectedPost.address}, {selectedPost.city} - {selectedPost.state}
            </Text>

            {selectedPost.status === "inativo" && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                title="Posto Inativo"
                color="orange"
                mb="md"
              >
                Este posto está inativo. Seu estoque não é considerado nas
                estatísticas gerais do sistema.
              </Alert>
            )}

            <SimpleGrid cols={{ base: 2, md: 5 }}>
              <div>
                <Text size="sm" c="dimmed">
                  Total de Doses
                </Text>
                <Text size="lg" fw={700}>
                  {getPostMetrics(selectedPost.id).totalQuantity}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Itens em Estoque
                </Text>
                <Text size="lg" fw={700}>
                  {getPostMetrics(selectedPost.id).totalItems}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Estoque Baixo
                </Text>
                <Text
                  size="lg"
                  fw={700}
                  c={
                    getPostMetrics(selectedPost.id).lowStockItems > 0
                      ? "yellow"
                      : "green"
                  }
                >
                  {getPostMetrics(selectedPost.id).lowStockItems}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Vencendo em 30 dias
                </Text>
                <Text
                  size="lg"
                  fw={700}
                  c={
                    getPostMetrics(selectedPost.id).expiringSoonItems > 0
                      ? "orange"
                      : "green"
                  }
                >
                  {getPostMetrics(selectedPost.id).expiringSoonItems}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Vencidas
                </Text>
                <Text
                  size="lg"
                  fw={700}
                  c={
                    getPostMetrics(selectedPost.id).expiredItems > 0
                      ? "red"
                      : "green"
                  }
                >
                  {getPostMetrics(selectedPost.id).expiredItems}
                </Text>
              </div>
            </SimpleGrid>

            {/* Alertas */}
            {(getPostMetrics(selectedPost.id).lowStockItems > 0 ||
              getPostMetrics(selectedPost.id).expiredItems > 0 ||
              getPostMetrics(selectedPost.id).expiringSoonItems > 0) && (
              <Stack gap="md" mt="md">
                {getPostMetrics(selectedPost.id).lowStockItems > 0 && (
                  <Alert
                    icon={<IconAlertTriangle size={16} />}
                    title="Estoque Baixo"
                    color="yellow"
                  >
                    {getPostMetrics(selectedPost.id).lowStockItems} item(s) com
                    estoque baixo (&lt; 10 doses)
                  </Alert>
                )}
                {getPostMetrics(selectedPost.id).expiredItems > 0 && (
                  <Alert
                    icon={<IconAlertTriangle size={16} />}
                    title="Vacinas Vencidas"
                    color="red"
                  >
                    {getPostMetrics(selectedPost.id).expiredItems} item(s)
                    vencido(s) - Remover do estoque
                  </Alert>
                )}
                {getPostMetrics(selectedPost.id).expiringSoonItems > 0 && (
                  <Alert
                    icon={<IconAlertTriangle size={16} />}
                    title="Vencimento Próximo"
                    color="orange"
                  >
                    {getPostMetrics(selectedPost.id).expiringSoonItems} item(s)
                    vence(m) em até 30 dias
                  </Alert>
                )}
              </Stack>
            )}
          </Card>
        )}

        {/* Tabela de estoque do posto selecionado */}
        {selectedPost && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={3}>
                <IconPackage size={20} style={{ marginRight: 8 }} />
                Estoque do Posto
              </Title>
              <Button leftSection={<IconPlus size={16} />} onClick={handleNew}>
                Adicionar Estoque
              </Button>
            </Group>

            {selectedPostStocks.length === 0 ? (
              <Text ta="center" c="dimmed" py="xl">
                Nenhum estoque cadastrado para este posto
              </Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Vacina</Table.Th>
                    <Table.Th>Quantidade</Table.Th>
                    <Table.Th>Lote</Table.Th>
                    <Table.Th>Validade</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Ações</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedPostStocks.map((stock) => {
                    const isExpired =
                      new Date(stock.expiration_date) < new Date();
                    const isExpiringSoon = (() => {
                      const expirationDate = new Date(stock.expiration_date);
                      const thirtyDaysFromNow = new Date();
                      thirtyDaysFromNow.setDate(
                        thirtyDaysFromNow.getDate() + 30
                      );
                      return (
                        expirationDate <= thirtyDaysFromNow &&
                        expirationDate > new Date()
                      );
                    })();
                    const isLowStock = stock.quantity < 10;

                    return (
                      <Table.Tr key={stock.id}>
                        <Table.Td>
                          <Group gap="xs">
                            <IconVaccine size={16} />
                            <Text fw={500}>{stock.vaccine?.name}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={isLowStock ? "yellow" : "green"}
                            size="lg"
                          >
                            {stock.quantity}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{stock.batch}</Table.Td>
                        <Table.Td>
                          {new Date(stock.expiration_date).toLocaleDateString(
                            "pt-BR"
                          )}
                        </Table.Td>
                        <Table.Td>
                          {isExpired ? (
                            <Badge color="red">Vencida</Badge>
                          ) : isExpiringSoon ? (
                            <Badge color="orange">Vencendo</Badge>
                          ) : isLowStock ? (
                            <Badge color="yellow">Estoque Baixo</Badge>
                          ) : (
                            <Badge color="green">OK</Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={() => handleEdit(stock)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => handleDelete(stock.id)}
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
            )}
          </Card>
        )}

        {/* Modal para adicionar/editar estoque */}
        <Modal
          opened={opened}
          onClose={close}
          title={editingStock ? "Editar Estoque" : "Adicionar Estoque"}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Select
                label="Posto"
                placeholder="Selecione um posto"
                data={posts.map((post) => ({
                  value: post.id.toString(),
                  label: `${post.name} - ${post.city}/${post.state}`,
                }))}
                {...form.getInputProps("post_id")}
                disabled={!!editingStock} // Não permite alterar o posto ao editar
              />

              <Select
                label="Vacina"
                placeholder="Selecione uma vacina"
                data={vaccines.map((vaccine) => ({
                  value: vaccine.id.toString(),
                  label: vaccine.name,
                }))}
                {...form.getInputProps("vaccine_id")}
              />

              <NumberInput
                label="Quantidade"
                placeholder="Ex: 50"
                min={1}
                {...form.getInputProps("quantity")}
              />

              <TextInput
                label="Lote"
                placeholder="Ex: COVID-2024-001"
                {...form.getInputProps("batch")}
              />

              <TextInput
                label="Data de Validade"
                type="date"
                {...form.getInputProps("expiration_date")}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={close}>
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

export default PostStockManagement;
