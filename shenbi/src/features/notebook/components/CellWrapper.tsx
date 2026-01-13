/**
 * Cell Wrapper Component
 *
 * Provides drag-and-drop functionality for cells.
 */

import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';
import { CELL_DRAG_TYPE, type CellDragItem } from '../types';

interface CellWrapperProps {
  cellId: string;
  index: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
}

export function CellWrapper({ cellId, index, onMove, children }: CellWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Drag source
  const [{ isDragging }, drag, preview] = useDrag<CellDragItem, void, { isDragging: boolean }>({
    type: CELL_DRAG_TYPE,
    item: () => ({
      id: cellId,
      index,
      type: CELL_DRAG_TYPE,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop target
  const [{ isOver }, drop] = useDrop<CellDragItem, void, { isOver: boolean }>({
    accept: CELL_DRAG_TYPE,
    hover: (item, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Attach drag preview to the whole cell, but drag handle only to the grip
  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-[0.98]' : ''
      } ${isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
      data-cell-id={cellId}
    >
      {/* Drag handle */}
      <div
        ref={drag}
        className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-move opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity z-10"
      >
        <div className="p-1 rounded hover:bg-gray-100">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Cell content */}
      <div className="ml-6">{children}</div>
    </div>
  );
}
