import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconAlertTriangle,
  IconCalendarStats,
  IconDownload,
  IconEye,
  IconPackage,
  IconRefresh,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  postService,
  stockHistoryService,
  vaccineService,
} from "../../services/services";
import {
  Post,
  StockHistory,
  StockHistoryStats,
  StockMovementType,
  Vaccine,
} from "../../types";

const StockHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [stats, setStats] = useState<StockHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filteredHistory, setFilteredHistory] = useState<StockHistory[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedVaccineId, setSelectedVaccineId] = useState<string | null>(
    null
  );
  const [selectedMovementType, setSelectedMovementType] = useState<
    string | null
  >(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<StockHistory | null>(
    null
  );
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [historyData, postsData, vaccinesData, statsData] =
        await Promise.all([
          stockHistoryService.getAll(),
          postService.getAll(),
          vaccineService.getAll(),
          stockHistoryService.getStats(),
        ]);

      setHistory(historyData);
      setPosts(postsData);
      setVaccines(vaccinesData);
      setStats(statsData);
      setFilteredHistory(historyData);
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao carregar histórico de estoque",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let filtered = [...history];

    if (selectedPostId) {
      filtered = filtered.filter(
        (item) => item.post_id === parseInt(selectedPostId)
      );
    }

    if (selectedVaccineId) {
      filtered = filtered.filter(
        (item) => item.vaccine_id === parseInt(selectedVaccineId)
      );
    }

    if (selectedMovementType) {
      filtered = filtered.filter(
        (item) => item.movement_type === selectedMovementType
      );
    }

    if (startDate) {
      filtered = filtered.filter(
        (item) => new Date(item.created_at) >= startDate
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (item) => new Date(item.created_at) <= endDate
      );
    }

    setFilteredHistory(filtered);
  }, [
    history,
    selectedPostId,
    selectedVaccineId,
    selectedMovementType,
    startDate,
    endDate,
  ]);

  const handleViewDetails = (historyItem: StockHistory) => {
    setSelectedHistory(historyItem);
    openModal();
  };

  const clearFilters = () => {
    setSelectedPostId(null);
    setSelectedVaccineId(null);
    setSelectedMovementType(null);
    setStartDate(null);
    setEndDate(null);
  };

  const getMovementTypeColor = (type: StockMovementType) => {
    switch (type) {
      case StockMovementType.ENTRY:
        return "green";
      case StockMovementType.EXIT:
        return "red";
      case StockMovementType.ADJUSTMENT:
        return "blue";
      case StockMovementType.EXPIRED:
        return "orange";
      case StockMovementType.TRANSFER:
        return "purple";
      default:
        return "gray";
    }
  };

  const getMovementTypeLabel = (type: StockMovementType) => {
    switch (type) {
      case StockMovementType.ENTRY:
        return "Entrada";
      case StockMovementType.EXIT:
        return "Saída";
      case StockMovementType.ADJUSTMENT:
        return "Ajuste";
      case StockMovementType.EXPIRED:
        return "Vencido";
      case StockMovementType.TRANSFER:
        return "Transferência";
      default:
        return type;
    }
  };

  const getMovementSign = (
    type: StockMovementType,
    quantityBefore: number,
    quantityAfter: number
  ) => {
    const difference = quantityAfter - quantityBefore;

    switch (type) {
      case StockMovementType.ENTRY:
        return "+";
      case StockMovementType.EXIT:
        return "-";
      case StockMovementType.ADJUSTMENT:
        return difference > 0 ? "+" : "-";
      case StockMovementType.EXPIRED:
        return "-";
      case StockMovementType.TRANSFER:
        return difference > 0 ? "+" : "-";
      default:
        return "";
    }
  };

  const getMovementIcon = (type: StockMovementType) => {
    switch (type) {
      case StockMovementType.ENTRY:
        return <IconTrendingUp size={16} />;
      case StockMovementType.EXIT:
        return <IconTrendingDown size={16} />;
      case StockMovementType.EXPIRED:
        return <IconAlertTriangle size={16} />;
      default:
        return <IconPackage size={16} />;
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1} mb="md">
              Histórico de Estoque
            </Title>
            <Text c="dimmed">
              Acompanhe todas as movimentações de estoque do sistema
            </Text>
          </div>
          <Button
            variant="outline"
            leftSection={<IconRefresh size={16} />}
            onClick={loadData}
          >
            Atualizar
          </Button>
        </Group>

        <LoadingOverlay visible={loading} />

        {/* Estatísticas */}
        {stats && (
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed">
                      Entradas
                    </Text>
                    <Text size="xl" fw={700} c="green">
                      {stats.totalEntries}
                    </Text>
                  </div>
                  <IconTrendingUp
                    size={32}
                    color="var(--mantine-color-green-6)"
                  />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed">
                      Saídas
                    </Text>
                    <Text size="xl" fw={700} c="red">
                      {stats.totalExits}
                    </Text>
                  </div>
                  <IconTrendingDown
                    size={32}
                    color="var(--mantine-color-red-6)"
                  />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed">
                      Ajustes
                    </Text>
                    <Text size="xl" fw={700} c="blue">
                      {stats.totalAdjustments}
                    </Text>
                  </div>
                  <IconPackage size={32} color="var(--mantine-color-blue-6)" />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed">
                      Vencidos
                    </Text>
                    <Text size="xl" fw={700} c="orange">
                      {stats.totalExpired}
                    </Text>
                  </div>
                  <IconAlertTriangle
                    size={32}
                    color="var(--mantine-color-orange-6)"
                  />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed">
                      Transferências
                    </Text>
                    <Text size="xl" fw={700} c="purple">
                      {stats.totalTransfers}
                    </Text>
                  </div>
                  <IconCalendarStats
                    size={32}
                    color="var(--mantine-color-purple-6)"
                  />
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        )}

        {/* Filtros */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            Filtros
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Posto"
                placeholder="Todos os postos"
                data={posts.map((post) => ({
                  value: post.id.toString(),
                  label: post.name,
                }))}
                value={selectedPostId}
                onChange={setSelectedPostId}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Vacina"
                placeholder="Todas as vacinas"
                data={vaccines.map((vaccine) => ({
                  value: vaccine.id.toString(),
                  label: vaccine.name,
                }))}
                value={selectedVaccineId}
                onChange={setSelectedVaccineId}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Tipo de Movimentação"
                placeholder="Todos os tipos"
                data={[
                  { value: StockMovementType.ENTRY, label: "Entrada" },
                  { value: StockMovementType.EXIT, label: "Saída" },
                  { value: StockMovementType.ADJUSTMENT, label: "Ajuste" },
                  { value: StockMovementType.EXPIRED, label: "Vencido" },
                  { value: StockMovementType.TRANSFER, label: "Transferência" },
                ]}
                value={selectedMovementType}
                onChange={setSelectedMovementType}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Group gap="xs">
                <Button variant="outline" onClick={clearFilters} fullWidth>
                  Limpar Filtros
                </Button>
              </Group>
            </Grid.Col>
          </Grid>

          <Divider my="md" />

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Data Inicial"
                placeholder="YYYY-MM-DD"
                type="date"
                value={startDate ? startDate.toISOString().split("T")[0] : ""}
                onChange={(event) =>
                  setStartDate(
                    event.target.value ? new Date(event.target.value) : null
                  )
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Data Final"
                placeholder="YYYY-MM-DD"
                type="date"
                value={endDate ? endDate.toISOString().split("T")[0] : ""}
                onChange={(event) =>
                  setEndDate(
                    event.target.value ? new Date(event.target.value) : null
                  )
                }
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Tabela de Histórico */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Movimentações ({filteredHistory.length})</Title>
            <Group gap="xs">
              <Button
                variant="outline"
                leftSection={<IconDownload size={16} />}
              >
                Exportar
              </Button>
            </Group>
          </Group>

          {filteredHistory.length === 0 ? (
            <Alert
              icon={<IconPackage size={16} />}
              title="Nenhuma movimentação encontrada"
              color="blue"
            >
              Não há movimentações de estoque que correspondam aos filtros
              selecionados.
            </Alert>
          ) : (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Data/Hora</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Posto</Table.Th>
                  <Table.Th>Vacina</Table.Th>
                  <Table.Th>Quantidade</Table.Th>
                  <Table.Th>Lote</Table.Th>
                  <Table.Th>Usuário</Table.Th>
                  <Table.Th>Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredHistory.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Text size="sm">
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(item.created_at).toLocaleTimeString("pt-BR")}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={getMovementTypeColor(item.movement_type)}
                        leftSection={getMovementIcon(item.movement_type)}
                      >
                        {getMovementTypeLabel(item.movement_type)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {item.post?.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {item.post?.city}/{item.post?.state}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{item.vaccine?.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          {item.quantity_before}
                        </Text>
                        <Text size="sm">→</Text>
                        <Text size="sm" fw={500}>
                          {item.quantity_after}
                        </Text>
                        <Text
                          size="xs"
                          c={getMovementTypeColor(item.movement_type)}
                        >
                          (
                          {getMovementSign(
                            item.movement_type,
                            item.quantity_before,
                            item.quantity_after
                          )}
                          {item.quantity_change})
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{item.batch}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{item.user?.name || "Sistema"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleViewDetails(item)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      </Stack>

      {/* Modal de Detalhes */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="Detalhes da Movimentação"
        size="md"
      >
        {selectedHistory && (
          <Stack gap="md">
            <Group justify="space-between">
              <Badge
                color={getMovementTypeColor(selectedHistory.movement_type)}
                leftSection={getMovementIcon(selectedHistory.movement_type)}
                size="lg"
              >
                {getMovementTypeLabel(selectedHistory.movement_type)}
              </Badge>
              <Text size="sm" c="dimmed">
                {new Date(selectedHistory.created_at).toLocaleString("pt-BR")}
              </Text>
            </Group>

            <Divider />

            <div>
              <Text size="sm" fw={500} mb="xs">
                Posto
              </Text>
              <Text size="sm">{selectedHistory.post?.name}</Text>
              <Text size="xs" c="dimmed">
                {selectedHistory.post?.address}
              </Text>
              <Text size="xs" c="dimmed">
                {selectedHistory.post?.city}/{selectedHistory.post?.state}
              </Text>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                Vacina
              </Text>
              <Text size="sm">{selectedHistory.vaccine?.name}</Text>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                Movimentação
              </Text>
              <Group gap="md">
                <div>
                  <Text size="xs" c="dimmed">
                    Antes
                  </Text>
                  <Text size="sm" fw={500}>
                    {selectedHistory.quantity_before}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Mudança
                  </Text>
                  <Text
                    size="sm"
                    fw={500}
                    c={selectedHistory.quantity_change > 0 ? "green" : "red"}
                  >
                    {selectedHistory.quantity_change > 0 ? "+" : ""}
                    {selectedHistory.quantity_change}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Depois
                  </Text>
                  <Text size="sm" fw={500}>
                    {selectedHistory.quantity_after}
                  </Text>
                </div>
              </Group>
            </div>

            {selectedHistory.batch && (
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Lote
                </Text>
                <Text size="sm">{selectedHistory.batch}</Text>
              </div>
            )}

            {selectedHistory.expiration_date && (
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Data de Validade
                </Text>
                <Text size="sm">
                  {new Date(selectedHistory.expiration_date).toLocaleDateString(
                    "pt-BR"
                  )}
                </Text>
              </div>
            )}

            {selectedHistory.reason && (
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Motivo
                </Text>
                <Text size="sm">{selectedHistory.reason}</Text>
              </div>
            )}

            {selectedHistory.notes && (
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Observações
                </Text>
                <Text size="sm">{selectedHistory.notes}</Text>
              </div>
            )}

            <div>
              <Text size="sm" fw={500} mb="xs">
                Usuário Responsável
              </Text>
              <Text size="sm">{selectedHistory.user?.name || "Sistema"}</Text>
              {selectedHistory.user?.email && (
                <Text size="xs" c="dimmed">
                  {selectedHistory.user.email}
                </Text>
              )}
            </div>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default StockHistoryPage;
