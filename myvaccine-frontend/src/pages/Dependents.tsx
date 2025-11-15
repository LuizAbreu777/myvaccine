import {
  Container,
  Stack,
  Table,
  Text,
  Title,
  Group,
  Badge,
  Card,
  Button,
  Modal,
  TextInput,
  Select,
  ActionIcon,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconUser,
  IconCalendar,
  IconId,
  IconHeart,
  IconPlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { Dependent } from "../types";
import { dependentService } from "../services/services";

const RELATIONSHIP_OPTIONS = [
  { value: "Filho", label: "Filho" },
  { value: "Filha", label: "Filha" },
  { value: "Cônjuge", label: "Cônjuge" },
  { value: "Pai", label: "Pai" },
  { value: "Mãe", label: "Mãe" },
  { value: "Outro", label: "Outro" },
];

const DependentsPage: React.FC = () => {
  const { user } = useAuth();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  // Função para normalizar CPF (remover pontos e traços)
  const normalizeCPF = (cpf: string) => {
    return cpf.replace(/[.-]/g, "");
  };

  // Carregar dependentes do backend
  const loadDependents = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingList(true);
      const data = await dependentService.getAll();
      setDependents(data);
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao carregar dependentes",
        color: "red",
      });
    } finally {
      setLoadingList(false);
    }
  }, [user]);

  useEffect(() => {
    loadDependents();
  }, [loadDependents]);

  const form = useForm({
    initialValues: {
      cpf: "",
      name: "",
      dob: "",
      relationship: "",
    },
      validate: {
      cpf: (value: string) => {
        const normalized = normalizeCPF(value);
        if (normalized.length !== 11) {
          return "CPF deve ter 11 dígitos";
        }
        return null;
      },
      name: (value: string) =>
        value.length < 3 ? "Nome deve ter pelo menos 3 caracteres" : null,
      dob: (value: string) => {
        if (!value) return "Data de nascimento é obrigatória";
        const date = new Date(value);
        if (date > new Date()) {
          return "Data não pode ser no futuro";
        }
        return null;
      },
      relationship: (value: string) =>
        !value ? "Grau de parentesco é obrigatório" : null,
    },
  });

  const formatCPF = (cpf: string) => {
    // Se já está formatado, retorna como está
    if (cpf.includes(".") || cpf.includes("-")) {
      return cpf;
    }
    // Caso contrário, formata
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatCPFInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleOpenModal = (dependent?: Dependent) => {
    if (dependent) {
      setEditingDependent(dependent);
      form.setValues({
        cpf: dependent.cpf,
        name: dependent.name,
        dob: dependent.dob.split("T")[0], // Converter para formato de input date
        relationship: dependent.relationship,
      });
    } else {
      setEditingDependent(null);
      form.reset();
    }
    open();
  };

  const handleCloseModal = () => {
    close();
    setEditingDependent(null);
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const normalizedCPF = normalizeCPF(values.cpf);

      if (editingDependent) {
        // Atualizar dependente existente
        await dependentService.update(editingDependent.cpf, {
          name: values.name,
          dob: values.dob,
          relationship: values.relationship,
        });
        notifications.show({
          title: "Sucesso",
          message: "Dependente atualizado com sucesso!",
          color: "green",
        });
      } else {
        // Criar novo dependente - enviar CPF formatado
        await dependentService.create({
          cpf: formatCPF(normalizedCPF),
          name: values.name,
          dob: values.dob,
          relationship: values.relationship,
        });
        notifications.show({
          title: "Sucesso",
          message: "Dependente cadastrado com sucesso!",
          color: "green",
        });
      }

      handleCloseModal();
      await loadDependents(); // Recarregar lista
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erro ao salvar dependente";
      notifications.show({
        title: "Erro",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cpf: string) => {
    if (window.confirm("Tem certeza que deseja excluir este dependente?")) {
      try {
        await dependentService.delete(cpf);
        notifications.show({
          title: "Sucesso",
          message: "Dependente excluído com sucesso!",
          color: "green",
        });
        await loadDependents(); // Recarregar lista
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Erro ao excluir dependente";
        notifications.show({
          title: "Erro",
          message: errorMessage,
          color: "red",
        });
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1} mb="md">
              Dependentes
            </Title>
            <Text c="dimmed">
              Gerencie seus dependentes registrados
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => handleOpenModal()}
          >
            Adicionar Dependente
          </Button>
        </Group>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <LoadingOverlay visible={loadingList} />
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500} size="lg">
                Total de Dependentes: {dependents.length}
              </Text>
            </Group>

            {dependents.length === 0 ? (
              <Text ta="center" c="dimmed" py="xl">
                Nenhum dependente registrado. Clique em "Adicionar Dependente"
                para começar.
              </Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nome</Table.Th>
                    <Table.Th>CPF</Table.Th>
                    <Table.Th>Data de Nascimento</Table.Th>
                    <Table.Th>Idade</Table.Th>
                    <Table.Th>Grau de Parentesco</Table.Th>
                    <Table.Th>Data de Registro</Table.Th>
                    <Table.Th>Ações</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {dependents.map((dependent) => (
                    <Table.Tr key={dependent.cpf}>
                      <Table.Td>
                        <Group gap="xs">
                          <IconUser size={16} />
                          <Text fw={500}>{dependent.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconId size={16} />
                          <Text>{formatCPF(dependent.cpf)}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconCalendar size={16} />
                          <Text>
                            {new Date(dependent.dob).toLocaleDateString("pt-BR")}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue">
                          {calculateAge(dependent.dob)} anos
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconHeart size={16} />
                          <Text>{dependent.relationship}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {new Date(dependent.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleOpenModal(dependent)}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDelete(dependent.cpf)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Card>

        {/* Modal para criar/editar dependente */}
        <Modal
          opened={opened}
          onClose={handleCloseModal}
          title={editingDependent ? "Editar Dependente" : "Novo Dependente"}
          size="md"
        >
          <LoadingOverlay visible={loading} />
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="CPF"
                placeholder="000.000.000-00"
                required
                maxLength={14}
                {...form.getInputProps("cpf")}
                onChange={(e) => {
                  const formatted = formatCPFInput(e.target.value);
                  form.setFieldValue("cpf", formatted);
                }}
                disabled={!!editingDependent} // CPF não pode ser alterado na edição
              />

              <TextInput
                label="Nome Completo"
                placeholder="Digite o nome completo"
                required
                {...form.getInputProps("name")}
              />

              <TextInput
                label="Data de Nascimento"
                type="date"
                required
                {...form.getInputProps("dob")}
              />

              <Select
                label="Grau de Parentesco"
                placeholder="Selecione o grau de parentesco"
                data={RELATIONSHIP_OPTIONS}
                required
                searchable
                {...form.getInputProps("relationship")}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" loading={loading}>
                  {editingDependent ? "Atualizar" : "Cadastrar"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
};

export default DependentsPage;

