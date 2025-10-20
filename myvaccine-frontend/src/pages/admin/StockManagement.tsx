import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Modal,
  Select,
  NumberInput,
  TextInput,
  Group,
  Stack,
  LoadingOverlay,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { stockService, postService, vaccineService } from '../../services/services';
import { Stock, Post, Vaccine } from '../../types';
import { notifications } from '@mantine/notifications';

const StockManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      post_id: 0,
      vaccine_id: 0,
      quantity: 0,
      batch: '',
      expiration_date: '',
    },
    validate: {
      post_id: (value: number) => (value <= 0 ? 'Selecione um posto' : null),
      vaccine_id: (value: number) => (value <= 0 ? 'Selecione uma vacina' : null),
      quantity: (value: number) => (value <= 0 ? 'Quantidade deve ser maior que 0' : null),
      batch: (value: string) => (value.length < 1 ? 'Lote é obrigatório' : null),
      expiration_date: (value: string) => (!value ? 'Data de validade é obrigatória' : null),
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, vaccinesData] = await Promise.all([
        postService.getAll(),
        vaccineService.getAll(),
      ]);
      setPosts(postsData);
      setVaccines(vaccinesData);
      // Carregar todos os estoques seria necessário implementar no backend
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

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingStock) {
        await stockService.update(editingStock.id, values);
        notifications.show({
          title: 'Sucesso',
          message: 'Estoque atualizado com sucesso!',
          color: 'green',
        });
      } else {
        await stockService.create(values);
        notifications.show({
          title: 'Sucesso',
          message: 'Estoque cadastrado com sucesso!',
          color: 'green',
        });
      }
      
      form.reset();
      setEditingStock(null);
      close();
      loadData();
    } catch (error) {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao salvar estoque',
        color: 'red',
      });
    }
  };

  const handleNew = () => {
    setEditingStock(null);
    form.reset();
    open();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1} mb="md">
              Controle de Estoque
            </Title>
            <Text c="dimmed">
              Gerencie o estoque de vacinas nos postos
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleNew}>
            Novo Estoque
          </Button>
        </Group>

        <LoadingOverlay visible={loading} />

        <Text ta="center" c="dimmed" py="xl">
          Funcionalidade de visualização de estoque será implementada
        </Text>

        <Modal
          opened={opened}
          onClose={close}
          title={editingStock ? 'Editar Estoque' : 'Novo Estoque'}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Select
                label="Posto"
                placeholder="Selecione um posto"
                data={posts.map(post => ({ value: post.id.toString(), label: post.name }))}
                required
                {...form.getInputProps('post_id')}
              />

              <Select
                label="Vacina"
                placeholder="Selecione uma vacina"
                data={vaccines.map(vaccine => ({ value: vaccine.id.toString(), label: vaccine.name }))}
                required
                {...form.getInputProps('vaccine_id')}
              />

              <NumberInput
                label="Quantidade"
                placeholder="0"
                min={1}
                required
                {...form.getInputProps('quantity')}
              />

              <TextInput
                label="Lote"
                placeholder="Ex: LOTE001"
                required
                {...form.getInputProps('batch')}
              />

              <TextInput
                label="Data de Validade"
                type="date"
                required
                {...form.getInputProps('expiration_date')}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={close}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingStock ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
};

export default StockManagement;
