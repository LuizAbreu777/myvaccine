import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Table,
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  Group,
  Stack,
  LoadingOverlay,
  ActionIcon,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { vaccineService } from '../../services/services';
import { Vaccine } from '../../types';
import { notifications } from '@mantine/notifications';

const VaccineManagement: React.FC = () => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: '',
      min_age: 0,
      max_age: undefined as number | undefined,
      contraindications: '',
    },
    validate: {
      name: (value: string) => (value.length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : null),
      min_age: (value: number) => (value < 0 ? 'Idade mínima deve ser maior ou igual a 0' : null),
      max_age: (value: number | undefined) => (value && value < 0 ? 'Idade máxima deve ser maior ou igual a 0' : null),
    },
  });

  useEffect(() => {
    loadVaccines();
  }, []);

  const loadVaccines = async () => {
    try {
      setLoading(true);
      const data = await vaccineService.getAll();
      setVaccines(data);
    } catch (error) {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao carregar vacinas',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingVaccine) {
        await vaccineService.update(editingVaccine.id, values);
        notifications.show({
          title: 'Sucesso',
          message: 'Vacina atualizada com sucesso!',
          color: 'green',
        });
      } else {
        await vaccineService.create(values);
        notifications.show({
          title: 'Sucesso',
          message: 'Vacina cadastrada com sucesso!',
          color: 'green',
        });
      }
      
      form.reset();
      setEditingVaccine(null);
      close();
      loadVaccines();
    } catch (error) {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao salvar vacina',
        color: 'red',
      });
    }
  };

  const handleEdit = (vaccine: Vaccine) => {
    setEditingVaccine(vaccine);
    form.setValues({
      name: vaccine.name,
      min_age: vaccine.min_age,
      max_age: vaccine.max_age,
      contraindications: vaccine.contraindications || '',
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta vacina?')) {
      try {
        await vaccineService.delete(id);
        notifications.show({
          title: 'Sucesso',
          message: 'Vacina excluída com sucesso!',
          color: 'green',
        });
        loadVaccines();
      } catch (error) {
        notifications.show({
          title: 'Erro',
          message: 'Erro ao excluir vacina',
          color: 'red',
        });
      }
    }
  };

  const handleNew = () => {
    setEditingVaccine(null);
    form.reset();
    open();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1} mb="md">
              Gestão de Vacinas
            </Title>
            <Text c="dimmed">
              Cadastre e gerencie as vacinas disponíveis no sistema
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleNew}>
            Nova Vacina
          </Button>
        </Group>

        <LoadingOverlay visible={loading} />

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome</Table.Th>
              <Table.Th>Idade Mínima</Table.Th>
              <Table.Th>Idade Máxima</Table.Th>
              <Table.Th>Contraindicações</Table.Th>
              <Table.Th>Ações</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {vaccines.map((vaccine) => (
              <Table.Tr key={vaccine.id}>
                <Table.Td>
                  <Text fw={500}>{vaccine.name}</Text>
                </Table.Td>
                <Table.Td>{vaccine.min_age} anos</Table.Td>
                <Table.Td>{vaccine.max_age ? `${vaccine.max_age} anos` : '-'}</Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {vaccine.contraindications || '-'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEdit(vaccine)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(vaccine.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Modal
          opened={opened}
          onClose={close}
          title={editingVaccine ? 'Editar Vacina' : 'Nova Vacina'}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Nome da Vacina"
                placeholder="Ex: Vacina contra COVID-19"
                required
                {...form.getInputProps('name')}
              />

              <Group grow>
                <NumberInput
                  label="Idade Mínima"
                  placeholder="0"
                  min={0}
                  required
                  {...form.getInputProps('min_age')}
                />
                <NumberInput
                  label="Idade Máxima"
                  placeholder="Opcional"
                  min={0}
                  {...form.getInputProps('max_age')}
                />
              </Group>

              <Textarea
                label="Contraindicações"
                placeholder="Descreva as contraindicações..."
                rows={3}
                {...form.getInputProps('contraindications')}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={close}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingVaccine ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
};

export default VaccineManagement;
