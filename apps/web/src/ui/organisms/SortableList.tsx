import type { ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { IconButton } from '../atoms/IconButton';

const screenReaderInstructions = {
  draggable: `
    Para tomar el elemento, presiona espacio o enter.
    Mientras arrastras, usa las flechas para mover el elemento a la posición deseada.
    Presiona espacio o enter para soltarlo en su nueva posición, o escape para cancelar.
  `,
};

const announcements = {
  onDragStart({ active }: { active: { id: unknown } }) {
    return `Se tomó el elemento ${String(active.id)}. Usa las flechas para moverlo.`;
  },
  onDragOver({ active, over }: { active: { id: unknown }; over: { id: unknown } | null }) {
    if (over && active.id !== over.id) {
      return `El elemento ${String(active.id)} se movió sobre la posición de ${String(over.id)}.`;
    }
    return undefined;
  },
  onDragEnd({ active, over }: { active: { id: unknown }; over: { id: unknown } | null }) {
    if (over && active.id !== over.id) {
      return `El elemento ${String(active.id)} se soltó en la posición de ${String(over.id)}.`;
    }
    return undefined;
  },
  onDragCancel({ active }: { active: { id: unknown } }) {
    return `Se canceló el arrastre del elemento ${String(active.id)}.`;
  },
};

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (reordered: T[]) => void;
  children: ReactNode;
}

export const SortableList = <T extends { id: string }>({
  items,
  onReorder,
  children,
}: SortableListProps<T>) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{ announcements, screenReaderInstructions }}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <List>{children}</List>
      </SortableContext>
    </DndContext>
  );
};

interface SortableListItemProps {
  id: string;
  dragLabel: string;
  secondaryAction?: ReactNode;
  children: ReactNode;
}

export const SortableListItem = ({
  id,
  dragLabel,
  secondaryAction,
  children,
}: SortableListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <ListItem
      ref={setNodeRef}
      secondaryAction={secondaryAction}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: 'relative',
        zIndex: isDragging ? 1 : 'auto',
        bgcolor: 'background.paper',
        boxShadow: isDragging ? 4 : 0,
        borderRadius: 1,
      }}
    >
      <DragHandle attributes={attributes} listeners={listeners} label={dragLabel} />
      {children}
    </ListItem>
  );
};

interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: ReturnType<typeof useSortable>['listeners'];
  label: string;
}

const DragHandle = ({ attributes, listeners, label }: DragHandleProps) => (
  <IconButton
    {...attributes}
    {...listeners}
    aria-label={label}
    size="small"
    sx={{
      mr: 0.5,
      cursor: 'grab',
      touchAction: 'none',
      color: 'text.secondary',
      '&:active': { cursor: 'grabbing' },
    }}
  >
    <DragIndicatorIcon fontSize="small" />
  </IconButton>
);
