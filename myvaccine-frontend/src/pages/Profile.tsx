import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';
import { userService } from '../services/services';
import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Alert,
  Avatar,
  Divider,
} from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userService.getMe();
        setForm(data);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await userService.updateMe({
        name: form.name,
        email: form.email,
        dob: form.dob,
        address: form.address,
        telephone: form.telephone,
        // password somente se preenchido
        ...(form as any).password ? { password: (form as any).password } : {},
      });
      setForm(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setSuccess('Perfil atualizado com sucesso');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Carregando perfil...</div>;

  return (
    <Card shadow="sm" radius="md" withBorder style={{ maxWidth: 720, margin: '0 auto' }}>
      <Group justify="space-between" align="center" mb="sm">
        <Group>
          <Avatar color="blue" radius="xl" size="lg">
            {user?.name?.charAt(0).toUpperCase() || form.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Title order={3}>Meu Perfil</Title>
            {user?.name && (
              <Text size="lg" fw={600} c="blue" mt={4}>
                {user.name}
              </Text>
            )}
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>CPF {form.cpf}</div>
          </div>
        </Group>
      </Group>
      <Divider mb="md" />

      <Stack gap="sm">
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>
        )}
        {success && (
          <Alert color="green" icon={<IconCheck size={16} />}>{success}</Alert>
        )}
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack gap="sm" mt="sm">
          <TextInput label="Nome" name="name" value={form.name || ''} onChange={handleChange} required />
          <TextInput label="Email" type="email" name="email" value={form.email || ''} onChange={handleChange} required />
          <TextInput label="Data de nascimento" type="date" name="dob" value={form.dob || ''} onChange={handleChange} />
          <TextInput label="Endereço" name="address" value={form.address || ''} onChange={handleChange} />
          <TextInput label="Telefone" name="telephone" value={form.telephone || ''} onChange={handleChange} />
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={saving}>
            Salvar alterações
          </Button>
        </Group>
      </form>
    </Card>
  );
};

export default Profile;


