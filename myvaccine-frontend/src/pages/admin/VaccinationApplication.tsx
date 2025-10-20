import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Select,
  Group,
  Stack,
  LoadingOverlay,
  Text,
  Alert,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { vaccinationHistoryService, postService, vaccineService } from '../../services/services';
import { Post, Vaccine } from '../../types';
import { notifications } from '@mantine/notifications';

const VaccinationApplication: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      user_cpf: '',
      post_id: 0,
      vaccine_id: 0,
    },
    validate: {
      user_cpf: (value: string) => (value.length < 11 ? 'CPF deve ter pelo menos 11 dígitos' : null),
      post_id: (value: number) => (value <= 0 ? 'Selecione um posto' : null),
      vaccine_id: (value: number) => (value <= 0 ? 'Selecione uma vacina' : null),
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
      setSubmitting(true);
      
      // Simular aplicação de vacina
      const mockHistory = {
        user_cpf: values.user_cpf,
        vaccine_id: values.vaccine_id,
        post_id: values.post_id,
        batch: 'LOTE001',
        application_date: new Date().toISOString(),
      };

      await vaccinationHistoryService.create(mockHistory);
      
      notifications.show({
        title: 'Sucesso',
        message: 'Vacina aplicada com sucesso!',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      form.reset();
    } catch (error) {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao aplicar vacina',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Aplicação de Vacinas
          </Title>
          <Text c="dimmed">
            Registre a aplicação de vacinas em pacientes
          </Text>
        </div>

        <LoadingOverlay visible={loading} />

        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          Esta funcionalidade está em desenvolvimento. Em uma implementação completa,
          seria necessário integrar com o sistema de estoque para verificar disponibilidade
          e decrementar automaticamente o estoque.
        </Alert>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="CPF do Paciente"
              placeholder="000.000.000-00"
              required
              {...form.getInputProps('user_cpf')}
            />

            <Select
              label="Posto de Vacinação"
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

            <Group justify="flex-end" mt="md">
              <Button type="submit" loading={submitting}>
                Aplicar Vacina
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
};

export default VaccinationApplication;
