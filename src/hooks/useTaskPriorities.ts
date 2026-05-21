import { useTranslation } from 'react-i18next';
import { TaskPriority } from '../api/supportTasks';
import { BLUE_40, GRAY_40, ORANGE_40, RED_40 } from '../constants';

export interface PriorityConfig {
  label: string;
  color: string;
}

export function useTaskPriorities(): Record<TaskPriority, PriorityConfig> {
  const { t } = useTranslation();
  return {
    LOW: { label: t('priorities.low'), color: GRAY_40 },
    MEDIUM: { label: t('priorities.medium'), color: BLUE_40 },
    HIGH: { label: t('priorities.high'), color: ORANGE_40 },
    URGENT: { label: t('priorities.urgent'), color: RED_40 },
  };
}

export function useTaskPriorityList(): Array<
  { priority: TaskPriority } & PriorityConfig
> {
  const priorities = useTaskPriorities();
  return (Object.keys(priorities) as TaskPriority[]).map(priority => ({
    priority,
    ...priorities[priority],
  }));
}
