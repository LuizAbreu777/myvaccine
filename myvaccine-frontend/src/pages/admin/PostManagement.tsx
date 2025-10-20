import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconPower, IconTrash } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { postService } from "../../services/services";
import { Post } from "../../types";

const PostManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      status: "ativo" as "ativo" | "inativo",
    },
    validate: {
      name: (value: string) =>
        value.length < 2 ? "Nome deve ter pelo menos 2 caracteres" : null,
      address: (value: string) =>
        value.length < 5 ? "Endereço deve ter pelo menos 5 caracteres" : null,
      city: (value: string) =>
        value.length < 2 ? "Cidade deve ter pelo menos 2 caracteres" : null,
      state: (value: string) =>
        value.length !== 2 ? "Estado deve ter 2 caracteres" : null,
    },
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getAll();
      setPosts(data);
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao carregar postos",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingPost) {
        await postService.update(editingPost.id, values);
        notifications.show({
          title: "Sucesso",
          message: "Posto atualizado com sucesso!",
          color: "green",
        });
      } else {
        await postService.create(values);
        notifications.show({
          title: "Sucesso",
          message: "Posto cadastrado com sucesso!",
          color: "green",
        });
      }

      form.reset();
      setEditingPost(null);
      close();
      loadPosts();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao salvar posto",
        color: "red",
      });
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    form.setValues({
      name: post.name,
      address: post.address,
      city: post.city,
      state: post.state,
      status: post.status,
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este posto?")) {
      try {
        await postService.delete(id);
        notifications.show({
          title: "Sucesso",
          message: "Posto excluído com sucesso!",
          color: "green",
        });
        loadPosts();
      } catch (error) {
        notifications.show({
          title: "Erro",
          message: "Erro ao excluir posto",
          color: "red",
        });
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await postService.toggleStatus(id);
      notifications.show({
        title: "Sucesso",
        message: "Status do posto alterado com sucesso!",
        color: "green",
      });
      loadPosts();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: "Erro ao alterar status do posto",
        color: "red",
      });
    }
  };

  const handleNew = () => {
    setEditingPost(null);
    form.reset();
    open();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1} mb="md">
              Gestão de Postos
            </Title>
            <Text c="dimmed">Cadastre e gerencie os postos de vacinação</Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleNew}>
            Novo Posto
          </Button>
        </Group>

        <LoadingOverlay visible={loading} />

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome</Table.Th>
              <Table.Th>Endereço</Table.Th>
              <Table.Th>Cidade/Estado</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Ações</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {posts.map((post) => (
              <Table.Tr key={post.id}>
                <Table.Td>
                  <Text fw={500}>{post.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{post.address}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {post.city} - {post.state}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={post.status === "ativo" ? "green" : "red"}>
                    {post.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEdit(post)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="orange"
                      onClick={() => handleToggleStatus(post.id)}
                    >
                      <IconPower size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(post.id)}
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
          title={editingPost ? "Editar Posto" : "Novo Posto"}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Nome do Posto"
                placeholder="Ex: UBS Centro"
                required
                {...form.getInputProps("name")}
              />

              <TextInput
                label="Endereço"
                placeholder="Rua, número, bairro"
                required
                {...form.getInputProps("address")}
              />

              <Group grow>
                <TextInput
                  label="Cidade"
                  placeholder="Ex: São Paulo"
                  required
                  {...form.getInputProps("city")}
                />
                <TextInput
                  label="Estado"
                  placeholder="Ex: SP"
                  maxLength={2}
                  required
                  {...form.getInputProps("state")}
                />
              </Group>

              <Select
                label="Status"
                data={[
                  { value: "ativo", label: "Ativo" },
                  { value: "inativo", label: "Inativo" },
                ]}
                {...form.getInputProps("status")}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={close}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPost ? "Atualizar" : "Cadastrar"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
};

export default PostManagement;
