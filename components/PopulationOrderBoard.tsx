'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';

interface CountryItem {
  iso3: string;
  name: string;
  nameKo: string;
}

interface SortableItemProps {
  id: string;
  country: CountryItem;
}

function SortableItem({ id, country }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="p-4 mb-3 cursor-move hover:border-blue-400 transition-colors">
        <div className="flex items-center gap-3">
          <div {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">{country.nameKo}</p>
            <p className="text-sm text-slate-500">{country.name}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface PopulationOrderBoardProps {
  countries: CountryItem[];
  onOrderChange: (newOrder: string[]) => void;
}

export default function PopulationOrderBoard({
  countries,
  onOrderChange,
}: PopulationOrderBoardProps) {
  const [items, setItems] = useState(countries);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.iso3 === active.id);
        const newIndex = items.findIndex((item) => item.iso3 === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // 부모에게 새 순서 알림
        onOrderChange(newOrder.map(item => item.iso3));
        
        return newOrder;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => item.iso3)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((country) => (
          <SortableItem
            key={country.iso3}
            id={country.iso3}
            country={country}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
