import React from 'react';
import { Alert, Button, Group } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface ErrorBoundaryProps {
  error: string | null;
  onRetry?: () => void;
  onClear?: () => void;
}

export const ErrorDisplay: React.FC<ErrorBoundaryProps> = ({ 
  error, 
  onRetry, 
  onClear 
}) => {
  if (!error) return null;

  return (
    <Alert 
      icon={<IconAlertCircle size={16} />} 
      title="Erro" 
      color="red"
      variant="light"
    >
      <Group justify="space-between" align="center">
        <span>{error}</span>
        <Group gap="xs">
          {onRetry && (
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              onClick={onRetry}
            >
              Tentar Novamente
            </Button>
          )}
          {onClear && (
            <Button
              size="xs"
              variant="subtle"
              onClick={onClear}
            >
              Fechar
            </Button>
          )}
        </Group>
      </Group>
    </Alert>
  );
};
