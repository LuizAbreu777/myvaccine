import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  LoadingOverlay,
  Table,
  Badge,
  SimpleGrid,
  Select,
  Button,
  ActionIcon,
  Modal,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconVaccine,
  IconCalendar,
  IconMapPin,
  IconUser,
  IconFilter,
  IconEdit,
  IconTrash,
  IconPlus,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';
import { vaccinationHistoryService, postService, vaccineService, dependentService } from '../../services/services';
import { VaccinationHistory, Post, Vaccine } from '../../types';

const AppliedVaccines: React.FC = () => {
  const [vaccinationHistories, setVaccinationHistories] = useState<VaccinationHistory[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVaccination, setEditingVaccination] = useState<VaccinationHistory | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [filterPost, setFilterPost] = useState<string>('');
  const [filterVaccine, setFilterVaccine] = useState<string>('');
  const [dependentInfo, setDependentInfo] = useState<{ isDependent: boolean; name?: string; relationship?: string } | null>(null);
  const [checkingCpf, setCheckingCpf] = useState(false);

  const form = useForm({
    initialValues: {
      user_cpf: '',
      vaccine_id: '',
      post_id: '',
      batch: '',
      application_date: '',
    },
    validate: {
      user_cpf: (value: string) => (!value ? 'CPF é obrigatório' : null),
      vaccine_id: (value: string) => (!value ? 'Selecione uma vacina' : null),
      post_id: (value: string) => (!value ? 'Selecione um posto' : null),
      batch: (value: string) => (!value ? 'Lote é obrigatório' : null),
      application_date: (value: string) => (!value ? 'Data é obrigatória' : null),
    },
  });

  const [debouncedCpf] = useDebouncedValue(form.values.user_cpf, 500);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const checkDependent = async () => {
      const cleanCpf = debouncedCpf.replace(/\D/g, '');
      if (cleanCpf.length === 11) {
        setCheckingCpf(true);
        try {
          const info = await dependentService.checkCpf(debouncedCpf);
          setDependentInfo(info);
        } catch (error) {
          setDependentInfo({ isDependent: false });
        } finally {
          setCheckingCpf(false);
        }
      } else {
        setDependentInfo(null);
      }
    };

    checkDependent();
  }, [debouncedCpf]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historiesData, postsData, vaccinesData] = await Promise.all([
        vaccinationHistoryService.getAll(),
        postService.getAll(),
        vaccineService.getAll(),
      ]);
      setVaccinationHistories(historiesData);
      setPosts(postsData);
      setVaccines(vaccinesData);
    } catch (error) {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao carregar dados',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vaccination: VaccinationHistory) => {
    setEditingVaccination(vaccination);
    form.setValues({
      user_cpf: vaccination.user_cpf,
      vaccine_id: vaccination.vaccine_id.toString(),
      post_id: vaccination.post_id.toString(),
      batch: vaccination.batch,
      application_date: vaccination.application_date.split('T')[0], // Formato YYYY-MM-DD
    });
    setDependentInfo(null); // Reset dependent info when editing
    openModal();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta aplicação de vacina?')) {
      try {
        await vaccinationHistoryService.delete(id);
        notifications.show({
          title: 'Sucesso',
          message: 'Aplicação de vacina excluída com sucesso',
          color: 'green',
        });
        loadData();
      } catch (error) {
        notifications.show({
          title: 'Erro',
          message: 'Erro ao excluir aplicação de vacina',
          color: 'red',
        });
      }
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const vaccinationData = {
        user_cpf: values.user_cpf.replace(/\D/g, ''),
        vaccine_id: parseInt(values.vaccine_id),
        post_id: parseInt(values.post_id),
        batch: values.batch,
        application_date: new Date(values.application_date).toISOString(),
      };

      if (editingVaccination) {
        await vaccinationHistoryService.update(editingVaccination.id, vaccinationData);
        notifications.show({
          title: 'Sucesso',
          message: 'Aplicação de vacina atualizada com sucesso',
          color: 'green',
        });
      } else {
        await vaccinationHistoryService.create(vaccinationData);
        notifications.show({
          title: 'Sucesso',
          message: 'Aplicação de vacina registrada com sucesso',
          color: 'green',
        });
      }

      closeModal();
      form.reset();
      setEditingVaccination(null);
      loadData();
    } catch (error: any) {
      notifications.show({
        title: 'Erro',
        message: error.response?.data?.message || 'Erro ao salvar aplicação de vacina',
        color: 'red',
      });
    }
  };

  // Filtrar dados com useMemo para otimização
  const filteredHistories = useMemo(() => 
    vaccinationHistories.filter(history => {
      const postMatch = !filterPost || history.post_id.toString() === filterPost;
      const vaccineMatch = !filterVaccine || history.vaccine_id.toString() === filterVaccine;
      return postMatch && vaccineMatch;
    }),
    [vaccinationHistories, filterPost, filterVaccine]
  );

  // Calcular estatísticas com useMemo
  const stats = useMemo(() => {
    const totalApplications = vaccinationHistories.length;
    const todayApplications = vaccinationHistories.filter(history => {
      const today = new Date().toDateString();
      const applicationDate = new Date(history.application_date).toDateString();
      return today === applicationDate;
    }).length;
    
    return { totalApplications, todayApplications };
  }, [vaccinationHistories]);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Vacinas Aplicadas
          </Title>
          <Text c="dimmed">
            Gerencie todas as aplicações de vacinas realizadas
          </Text>
        </div>

        <LoadingOverlay visible={loading} />

        {/* Estatísticas */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Total de Aplicações</Text>
              <IconVaccine size={20} color="var(--mantine-color-blue-6)" />
            </Group>
            <Text size="xl" fw={700} mt="md">{stats.totalApplications}</Text>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Aplicações Hoje</Text>
              <IconCalendar size={20} color="var(--mantine-color-green-6)" />
            </Group>
            <Text size="xl" fw={700} mt="md">{stats.todayApplications}</Text>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Postos Ativos</Text>
              <IconMapPin size={20} color="var(--mantine-color-orange-6)" />
            </Group>
            <Text size="xl" fw={700} mt="md">{posts.filter(p => p.status === 'ativo').length}</Text>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Vacinas Cadastradas</Text>
              <IconTrendingUp size={20} color="var(--mantine-color-purple-6)" />
            </Group>
            <Text size="xl" fw={700} mt="md">{vaccines.length}</Text>
          </Card>
        </SimpleGrid>

        {/* Filtros */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group>
            <Select
              placeholder="Filtrar por posto"
              data={posts.map(post => ({ value: post.id.toString(), label: post.name }))}
              value={filterPost}
              onChange={(value) => setFilterPost(value || '')}
              clearable
              leftSection={<IconMapPin size={16} />}
            />
            <Select
              placeholder="Filtrar por vacina"
              data={vaccines.map(vaccine => ({ value: vaccine.id.toString(), label: vaccine.name }))}
              value={filterVaccine}
              onChange={(value) => setFilterVaccine(value || '')}
              clearable
              leftSection={<IconVaccine size={16} />}
            />
            <Button
              variant="light"
              onClick={() => {
                setFilterPost('');
                setFilterVaccine('');
              }}
              leftSection={<IconFilter size={16} />}
            >
              Limpar Filtros
            </Button>
          </Group>
        </Card>

        {/* Tabela de aplicações */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Histórico de Aplicações</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setEditingVaccination(null);
                form.reset();
                openModal();
              }}
            >
              Nova Aplicação
            </Button>
          </Group>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Paciente (CPF)</Table.Th>
                <Table.Th>Vacina</Table.Th>
                <Table.Th>Posto</Table.Th>
                <Table.Th>Lote</Table.Th>
                <Table.Th>Data de Aplicação</Table.Th>
                <Table.Th>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredHistories.map((history) => {
                const vaccine = vaccines.find(v => v.id === history.vaccine_id);
                const post = posts.find(p => p.id === history.post_id);
                
                return (
                  <Table.Tr key={history.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <IconUser size={16} />
                        <Text>{history.user_cpf}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconVaccine size={16} />
                        <Text>{vaccine?.name || 'N/A'}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconMapPin size={16} />
                        <Text>{post?.name || 'N/A'}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {history.batch}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconCalendar size={16} />
                        <Text>{new Date(history.application_date).toLocaleDateString()}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEdit(history)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(history.id)}
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

          {filteredHistories.length === 0 && (
            <Text ta="center" c="dimmed" py="xl">
              Nenhuma aplicação encontrada com os filtros selecionados
            </Text>
          )}
        </Card>

        {/* Modal para editar/criar aplicação */}
        <Modal
          opened={modalOpened}
          onClose={closeModal}
          title={editingVaccination ? "Editar Aplicação" : "Nova Aplicação"}
          centered
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <div>
                <TextInput
                  label="CPF do Paciente"
                  placeholder="000.000.000-00"
                  required
                  {...form.getInputProps('user_cpf')}
                />
                {checkingCpf && (
                  <Text size="xs" c="dimmed" mt={4}>
                    Verificando...
                  </Text>
                )}
                {dependentInfo && !checkingCpf && (
                  <Group gap="xs" mt={8}>
                    {dependentInfo.isDependent ? (
                      <>
                        <Badge
                          leftSection={<IconUsers size={12} />}
                          color="orange"
                          variant="light"
                        >
                          Dependente
                        </Badge>
                        <Text size="sm" c="dimmed">
                          {dependentInfo.name} ({dependentInfo.relationship})
                        </Text>
                      </>
                    ) : (
                      <Badge color="green" variant="light">
                        Usuário
                      </Badge>
                    )}
                  </Group>
                )}
              </div>

              <Select
                label="Vacina"
                placeholder="Selecione uma vacina"
                data={vaccines.map(vaccine => ({ value: vaccine.id.toString(), label: vaccine.name }))}
                required
                {...form.getInputProps('vaccine_id')}
              />

              <Select
                label="Posto de Vacinação"
                placeholder="Selecione um posto"
                data={posts.map(post => ({ value: post.id.toString(), label: post.name }))}
                required
                {...form.getInputProps('post_id')}
              />

              <TextInput
                label="Lote"
                placeholder="Número do lote"
                required
                {...form.getInputProps('batch')}
              />

              <TextInput
                label="Data de Aplicação"
                type="date"
                required
                {...form.getInputProps('application_date')}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingVaccination ? "Salvar Alterações" : "Registrar Aplicação"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
};

export default AppliedVaccines;
