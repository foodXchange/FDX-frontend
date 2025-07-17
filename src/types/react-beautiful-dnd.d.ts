declare module 'react-beautiful-dnd' {
  export interface DragStart {
    draggableId: string;
    type: string;
    source: DragLocation;
    mode: string;
  }

  export interface DragLocation {
    droppableId: string;
    index: number;
  }

  export interface DropResult {
    draggableId: string;
    type: string;
    source: DragLocation;
    destination: DragLocation | null;
    mode: string;
    reason: string;
  }

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: any;
    placeholder: React.ReactElement | null;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith: string | null;
    draggingFromThisWith: string | null;
    isUsingPlaceholder: boolean;
  }

  export interface DraggableProvided {
    innerRef: (element: HTMLElement | null) => void;
    draggableProps: any;
    dragHandleProps: any;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    dropAnimation: any;
    draggingOver: string | null;
    combineWith: string | null;
    combineTargetFor: string | null;
    mode: string;
  }

  export interface DragDropContextProps {
    onDragStart?: (start: DragStart) => void;
    onDragUpdate?: (update: any) => void;
    onDragEnd: (result: DropResult) => void;
    onBeforeCapture?: (before: any) => void;
    onBeforeDragStart?: (start: DragStart) => void;
    children: React.ReactNode;
  }

  export interface DroppableProps {
    droppableId: string;
    type?: string;
    mode?: string;
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'vertical' | 'horizontal';
    ignoreContainerClipping?: boolean;
    renderClone?: any;
    getContainerForClone?: any;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
  }

  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    shouldRespectForcePress?: boolean;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactElement;
  }

  export const DragDropContext: React.ComponentType<DragDropContextProps>;
  export const Droppable: React.ComponentType<DroppableProps>;
  export const Draggable: React.ComponentType<DraggableProps>;
}