import React from 'react';
import { useForm } from '@mantine/form';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Anchor,
  Alert,
  Grid,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { notifications } from '@mantine/notifications';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    initialValues: {
      cpf: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      dob: '',
      address: '',
      telephone: '',
    },
    validate: {
      cpf: (value: string) => (value.length < 11 ? 'CPF deve ter pelo menos 11 dígitos' : null),
      name: (value: string) => (value.length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : null),
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
      password: (value: string) => (value.length < 6 ? 'Senha deve ter pelo menos 6 caracteres' : null),
      confirmPassword: (value: string, values: any) => (value !== values.password ? 'Senhas não coincidem' : null),
      dob: (value: string) => (!value ? 'Data de nascimento é obrigatória' : null),
      address: (value: string) => (value.length < 5 ? 'Endereço deve ter pelo menos 5 caracteres' : null),
      telephone: (value: string) => (value.length < 10 ? 'Telefone deve ter pelo menos 10 dígitos' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...userData } = values;
      await register(userData);
      notifications.show({
        title: 'Sucesso',
        message: 'Conta criada com sucesso!',
        color: 'green',
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
     <div className="login-overlay">
    <Container size={800} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <img
        src="/Name-Myvaccine.png"
        alt="MyVaccine"
        style={{
        display: "block",
        margin: "0 auto 24px",
        maxWidth: "160px",
     }}
        />
        <Title order={1} ta="center" mb="md" style={{ color: "#100E3D" }}>
          Criar Conta
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="CPF"
                  placeholder="000.000.000-00"
                  required
                  {...form.getInputProps('cpf')}
                  style={{ color: "#666666"}}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Nome Completo"
                  placeholder="Seu nome completo"
                  required
                  {...form.getInputProps('name')}
                  style={{ color: "#666666"}}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  placeholder="seu@email.com"
                  required
                  {...form.getInputProps('email')}
                  style={{ color: "#666666"}}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  required
                  {...form.getInputProps('telephone')}
                  style={{ color: "#666666"}}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <PasswordInput
                  label="Senha"
                  placeholder="Sua senha"
                  required
                  {...form.getInputProps('password')}
                  style={{ color: "#666666"}}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <PasswordInput
                  label="Confirmar Senha"
                  placeholder="Confirme sua senha"
                  required
                  {...form.getInputProps('confirmPassword')}
                  style={{ color: "#666666"}}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Data de Nascimento"
              type="date"
              required
              {...form.getInputProps('dob')}
              style={{ color: "#666666"}}
            />

            <TextInput
              label="Endereço"
              placeholder="Seu endereço completo"
              required
              {...form.getInputProps('address')}
              style={{ color: "#666666"}}
            />

            <Button type="submit" fullWidth mt="xl" loading={loading} styles={{root: {backgroundColor: "#100E3D",},}}>
            <span style={{ color: "#FFFFFF", fontSize: "15px"}}>Criar Conta</span>
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md" style={{ color: "#100E3D"}}>
          Já tem uma conta?{' '}
          <Anchor component={Link} to="/login">
            Faça login
          </Anchor>
        </Text>
      </Paper>
    </Container>
    </div>
    </div>
  );
};

export default Register;
