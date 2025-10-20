import {
  Badge,
  Container,
  Group,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconMapPin, IconVaccine } from "@tabler/icons-react";
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { vaccinationHistoryService } from "../services/services";
import { VaccinationHistory } from "../types";

const VaccinationHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<VaccinationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await vaccinationHistoryService.getByUser(user.cpf);
      setHistory(data);
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

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Histórico de Vacinação
          </Title>
          <Text c="dimmed">Acompanhe todas as vacinas que você já recebeu</Text>
        </div>

        <LoadingOverlay visible={loading} />

        {history.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            Nenhuma vacina aplicada ainda
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
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
        )}
      </Stack>
    </Container>
  );
};

export default VaccinationHistoryPage;
