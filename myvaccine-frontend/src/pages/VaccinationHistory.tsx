import {
  Badge,
  Container,
  Group,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  Title,
  Tabs,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconMapPin, IconVaccine, IconUser, IconUsers } from "@tabler/icons-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { vaccinationHistoryService } from "../services/services";
import { VaccinationHistory } from "../types";

const VaccinationHistoryPage: React.FC = () => {
  const [allHistory, setAllHistory] = useState<VaccinationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>("user");
  const { user } = useAuth();

  const loadHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const historyData = await vaccinationHistoryService.getByUserAll(user.cpf);
      setAllHistory(historyData);
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao carregar histórico",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  // Função auxiliar para normalizar CPF (remove pontos e traços)
  const normalizeCPF = (cpf: string) => {
    if (!cpf) return "";
    return cpf.replace(/[.-]/g, "").trim();
  };

  // Separar vacinas do usuário e dos dependentes usando useMemo
  const { userHistory, dependentsHistory } = useMemo(() => {
    if (!user) {
      return { userHistory: [], dependentsHistory: [] };
    }

    const normalizedUserCpf = normalizeCPF(user.cpf);

    // Vacinas do usuário: is_dependent = false E user_cpf corresponde ao CPF do usuário
    const userVacinas = allHistory.filter((item) => {
      const itemCpfNormalized = normalizeCPF(item.user_cpf || "");
      return !item.is_dependent && itemCpfNormalized === normalizedUserCpf;
    });

    // Vacinas dos dependentes: is_dependent = true OU tem um dependent associado
    const dependentsVacinas = allHistory.filter((item) => {
      return item.is_dependent || !!item.dependent;
    });

    return {
      userHistory: userVacinas,
      dependentsHistory: dependentsVacinas,
    };
  }, [allHistory, user]);

  const renderTable = (history: VaccinationHistory[]) => {
    if (history.length === 0) {
      return (
        <Text ta="center" c="dimmed" py="xl">
          Nenhuma vacina aplicada ainda
        </Text>
      );
    }

    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Paciente</Table.Th>
            <Table.Th>Vacina</Table.Th>
            <Table.Th>Posto</Table.Th>
            <Table.Th>Data da Aplicação</Table.Th>
            <Table.Th>Lote</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {history.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                {item.dependent ? (
                  <Group gap="xs">
                    <IconUsers size={16} />
                    <div>
                      <Text fw={500}>{item.dependent.name}</Text>
                      <Text size="xs" c="dimmed">
                        {item.dependent.relationship}
                      </Text>
                    </div>
                  </Group>
                ) : (
                  <Group gap="xs">
                    <IconUser size={16} />
                    <Text fw={500}>{user?.name}</Text>
                  </Group>
                )}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <IconVaccine size={16} />
                  <Text fw={500}>{item.vaccine?.name}</Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <IconMapPin size={16} />
                  <Text>{item.post?.name}</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {item.post?.city} - {item.post?.state}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text>
                    {new Date(item.application_date).toLocaleDateString(
                      "pt-BR"
                    )}
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Badge variant="light" color="blue">
                  {item.batch}
                </Badge>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Histórico de Vacinação
          </Title>
          <Text c="dimmed">
            Acompanhe todas as vacinas aplicadas em você e seus dependentes
          </Text>
        </div>

        <LoadingOverlay visible={loading} />

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="user" leftSection={<IconUser size={16} />}>
              Minhas Vacinas ({userHistory.length})
            </Tabs.Tab>
            <Tabs.Tab value="dependents" leftSection={<IconUsers size={16} />}>
              Dependentes ({dependentsHistory.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="user" pt="md">
            {renderTable(userHistory)}
          </Tabs.Panel>

          <Tabs.Panel value="dependents" pt="md">
            {renderTable(dependentsHistory)}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
};

export default VaccinationHistoryPage;
