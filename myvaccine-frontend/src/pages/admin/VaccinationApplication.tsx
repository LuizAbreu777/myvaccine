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
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck, IconUsers, IconUser } from '@tabler/icons-react';
import { vaccinationHistoryService, postService, vaccineService, dependentService } from '../../services/services';
import { Post, Vaccine } from '../../types';
import { notifications } from '@mantine/notifications';
import { useDebouncedValue } from '@mantine/hooks';

interface CpfInfo {
  exists: boolean;
  type: 'user' | 'dependent' | null;
  isDependent: boolean;
  name?: string;
  relationship?: string;
}

const VaccinationApplication: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cpfInfo, setCpfInfo] = useState<CpfInfo | null>(null);
  const [checkingCpf, setCheckingCpf] = useState(false);

  const form = useForm({
    initialValues: {
      user_cpf: '',
      post_id: '',
      vaccine_id: '',
    },
    validate: {
      user_cpf: (value: string) => {
        if (!value) return 'CPF é obrigatório';
        const cleanCpf = value.replace(/\D/g, '');
        if (cleanCpf.length !== 11) return 'CPF deve ter 11 dígitos';
        return null;
      },
      post_id: (value: string) => (!value ? 'Selecione um posto' : null),
      vaccine_id: (value: string) => (!value ? 'Selecione uma vacina' : null),
    },
  });

  const [debouncedCpf] = useDebouncedValue(form.values.user_cpf, 500);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const checkCpfExists = async () => {
      const cleanCpf = debouncedCpf.replace(/\D/g, '');
      if (cleanCpf.length === 11) {
        setCheckingCpf(true);
        try {
          const info = await dependentService.checkCpf(debouncedCpf);
          setCpfInfo(info);
        } catch (error) {
          setCpfInfo({ exists: false, type: null, isDependent: false });
        } finally {
          setCheckingCpf(false);
        }
      } else {
        setCpfInfo(null);
      }
    };

    checkCpfExists();
  }, [debouncedCpf]);

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
      
      const vaccinationData = {
        user_cpf: values.user_cpf.replace(/\D/g, ''),
        vaccine_id: parseInt(values.vaccine_id),
        post_id: parseInt(values.post_id),
        batch: 'LOTE001',
        application_date: new Date().toISOString(),
      };

      await vaccinationHistoryService.create(vaccinationData);
      
      notifications.show({
        title: 'Sucesso',
        message: 'Vacina aplicada com sucesso!',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      form.reset();
    } catch (error: any) {
      notifications.show({
        title: 'Erro',
        message: error.response?.data?.message || 'Erro ao aplicar vacina',
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
            <div>
              <TextInput
                label="CPF do Paciente"
                placeholder="000.000.000-00"
                required
                maxLength={14}
                {...form.getInputProps('user_cpf')}
              />
              {checkingCpf && (
                <Text size="xs" c="dimmed" mt={4}>
                  Verificando...
                </Text>
              )}
              {cpfInfo && !checkingCpf && (
                <>
                  {!cpfInfo.exists ? (
                    <Alert 
                      icon={<IconAlertCircle size={16} />} 
                      color="red" 
                      variant="light"
                      mt={8}
                    >
                      CPF não encontrado no sistema. Verifique se o CPF está correto ou cadastre o paciente primeiro.
                    </Alert>
                  ) : (
                    <Group gap="xs" mt={8}>
                      {cpfInfo.type === 'dependent' ? (
                        <>
                          <Badge
                            leftSection={<IconUsers size={12} />}
                            color="orange"
                            variant="light"
                          >
                            Dependente
                          </Badge>
                          <Text size="sm" c="dimmed">
                            {cpfInfo.name} ({cpfInfo.relationship})
                          </Text>
                        </>
                      ) : (
                        <>
                          <Badge 
                            leftSection={<IconUser size={12} />}
                            color="green" 
                            variant="light"
                          >
                            Usuário
                          </Badge>
                          <Text size="sm" c="dimmed">
                            {cpfInfo.name}
                          </Text>
                        </>
                      )}
                    </Group>
                  )}
                </>
              )}
            </div>

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
