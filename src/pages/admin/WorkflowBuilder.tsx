
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, X, ArrowRight, Trash2, MoveHorizontal } from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface ToolItem {
  id: string;
  name: string;
  description: string;
}

interface WorkflowNode {
  id: string;
  name: string;
  type: 'tool';
  toolId: string;
}

const availableTools: ToolItem[] = [
  { id: 'search', name: 'Suche', description: 'Durchsucht Dokumente und Daten' },
  { id: 'email', name: 'E-Mail', description: 'Versendet E-Mails' },
  { id: 'calculator', name: 'Rechner', description: 'Führt Berechnungen durch' },
  { id: 'database', name: 'Datenbank', description: 'Greift auf Datenbankinformationen zu' },
  { id: 'documents', name: 'Dokumente', description: 'Verarbeitet und erstellt Dokumente' },
  { id: 'calendar', name: 'Kalender', description: 'Plant und verwaltet Termine' },
];

interface SortableNodeProps {
  node: WorkflowNode;
  tool: ToolItem;
  onRemove: () => void;
}

const SortableNode: React.FC<SortableNodeProps> = ({ node, tool, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "workflow-node relative",
        isDragging && "is-dragging"
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div {...listeners} className="cursor-grab p-1">
            <MoveHorizontal size={16} className="text-gray-500" />
          </div>
          <h3 className="font-medium text-sm">{tool.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
          onClick={onRemove}
        >
          <X size={14} />
        </Button>
      </div>
      <p className="text-xs text-gray-500">{tool.description}</p>
    </div>
  );
};

const WorkflowBuilder: React.FC = () => {
  const [workflowName, setWorkflowName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setActiveId(null);
  };
  
  const addTool = (toolId: string) => {
    const newNodeId = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      id: newNodeId,
      name: `Node ${nodes.length + 1}`,
      type: 'tool',
      toolId,
    };
    
    setNodes([...nodes, newNode]);
  };
  
  const removeTool = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
  };
  
  const handleSave = () => {
    // In a real application, this would save the workflow
    console.log('Workflow saved:', { workflowName, systemPrompt, nodes });
    alert('Workflow gespeichert!');
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Konfiguration</CardTitle>
          <CardDescription>Erstellen Sie einen neuen AI Workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="workflow-name" className="text-sm font-medium">Workflow Name</label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Geben Sie einen Namen für den Workflow ein"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="system-prompt" className="text-sm font-medium">System Prompt</label>
              <Textarea
                id="system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Geben Sie den System Prompt für den AI Agent ein"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Workflow Builder</CardTitle>
          <CardDescription>Ziehen Sie Tools in den Workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {availableTools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white border border-gray-200 rounded-md p-3 cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => addTool(tool.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{tool.name}</h3>
                    <Plus size={16} className="text-primary" />
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{tool.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Workflow Sequenz</h3>
              
              <div className="workflow-canvas p-6 min-h-[160px]">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={nodes.map(node => node.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      {nodes.map((node, index) => {
                        const tool = availableTools.find(t => t.id === node.toolId)!;
                        return (
                          <React.Fragment key={node.id}>
                            <SortableNode
                              node={node}
                              tool={tool}
                              onRemove={() => removeTool(node.id)}
                            />
                            {index < nodes.length - 1 && (
                              <ArrowRight className="text-secondary" size={20} />
                            )}
                          </React.Fragment>
                        );
                      })}
                      
                      {nodes.length === 0 && (
                        <div className="w-full text-center py-6 text-gray-500 text-sm">
                          Fügen Sie Tools hinzu, um einen Workflow zu erstellen
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" className="gap-2">
                <Trash2 size={16} />
                <span>Zurücksetzen</span>
              </Button>
              
              <Button onClick={handleSave} className="gap-2">
                <Save size={16} />
                <span>Workflow speichern</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowBuilder;
