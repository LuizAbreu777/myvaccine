import {
  Alert,
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Email inválido",
      password: (value: string) =>
        value.length < 6 ? "Senha deve ter pelo menos 6 caracteres" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      console.log("📝 Iniciando processo de login...");
      await login(values.email, values.password);
      console.log("🎉 Login concluído com sucesso!");
      notifications.show({
        title: "Sucesso",
        message: "Login realizado com sucesso!",
        color: "green",
      });
      navigate("/");
    } catch (err: any) {
      console.error("💥 Erro capturado no Login:", err);
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="xl">
        MyVaccine
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2} ta="center" mb="md">
          Entrar
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="seu@email.com"
              required
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Senha"
              placeholder="Sua senha"
              required
              {...form.getInputProps("password")}
            />

            <Button type="submit" fullWidth mt="xl" loading={loading}>
              Entrar
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md">
          Não tem uma conta?{" "}
          <Anchor component={Link} to="/register">
            Registre-se
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};

export default Login;
