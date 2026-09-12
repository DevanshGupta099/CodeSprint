'use client';

import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomSupplierNode } from './CustomSupplierNode';
import { getTieredLayout } from '../../utils/graphLayout';
import { SupplyChainDAGResponse, Supplier } from '../../types/supply-chain';

interface FlowCanvasProps {
  dag: SupplyChainDAGResponse;
  onSelectSupplier: (supplier: Supplier | null) => void;
  selectedSupplierId?: string | null;
  direction?: 'LR' | 'TB';
}

const nodeTypes: any = {
  customSupplier: CustomSupplierNode,
};

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  dag,
  onSelectSupplier,
  selectedSupplierId,
  direction = 'LR',
}) => {
  // Map domain suppliers to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return dag.nodes.map((supplier) => ({
      id: supplier.id,
      type: 'customSupplier',
      data: supplier,
      position: { x: 0, y: 0 },
      selected: supplier.id === selectedSupplierId,
    }));
  }, [dag.nodes, selectedSupplierId]);

  // Map domain edges to React Flow edges (Upstream child -> Downstream parent)
  const initialEdges: Edge[] = useMemo(() => {
    const criticalNodeIds = new Set(
      dag.nodes.filter((n) => n.status === 'CRITICAL').map((n) => n.id)
    );
    const elevatedNodeIds = new Set(
      dag.nodes.filter((n) => n.status === 'ELEVATED').map((n) => n.id)
    );

    return dag.edges.map((edge) => {
      const source = edge.childSupplierId;
      const target = edge.parentSupplierId;

      const isDisrupted = criticalNodeIds.has(source) || criticalNodeIds.has(target);
      const isElevated = elevatedNodeIds.has(source) || elevatedNodeIds.has(target);

      let strokeColor = 'rgba(100, 116, 139, 0.4)';
      let strokeWidth = 2;
      let markerColor = 'rgba(100, 116, 139, 0.7)';

      if (isDisrupted) {
        strokeColor = '#E11D48';
        strokeWidth = 3;
        markerColor = '#E11D48';
      } else if (isElevated) {
        strokeColor = '#F59E0B';
        strokeWidth = 2.5;
        markerColor = '#F59E0B';
      }

      return {
        id: edge.id,
        source,
        target,
        type: 'smoothstep',
        animated: isDisrupted,
        className: isDisrupted ? 'disrupted' : '',
        style: {
          stroke: strokeColor,
          strokeWidth,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: markerColor,
          width: 16,
          height: 16,
        },
        label: edge.shippingRoute || undefined,
        labelStyle: {
          fill: isDisrupted ? '#BE123C' : '#334155',
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 700,
        },
        labelBgStyle: {
          fill: '#FFFFFF',
          fillOpacity: 0.98,
          rx: 6,
          ry: 6,
          stroke: isDisrupted ? '#FDA4AF' : 'rgba(0,0,0,0.1)',
          strokeWidth: 1,
        },
        labelBgPadding: [8, 4] as [number, number],
      };
    });
  }, [dag.edges, dag.nodes]);

  // Run Dagre tiered layout
  const layoutedNodes = useMemo(() => {
    return getTieredLayout(initialNodes, initialEdges, direction);
  }, [initialNodes, initialEdges, direction]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when dag or direction changes
  React.useEffect(() => {
    const layouted = getTieredLayout(initialNodes, initialEdges, direction);
    setNodes(layouted);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, direction, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectSupplier(node.data as Supplier);
    },
    [onSelectSupplier]
  );

  const handlePaneClick = useCallback(() => {
    onSelectSupplier(null);
  }, [onSelectSupplier]);

  return (
    <div className="w-full h-full relative bg-[#F8FAFC]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.5}
          color="#CBD5E1"
        />
        <Controls 
          showInteractive={false} 
          position="bottom-left" 
          className="!bg-white !border !border-black/10 !rounded-2xl !shadow-md !overflow-hidden"
        />
        <MiniMap
          className="hidden md:block !bg-white/95 !border !border-black/10 !rounded-2xl !shadow-lg !overflow-hidden"
          nodeColor={(n) => {
            const status = (n.data as any)?.status;
            if (status === 'CRITICAL') return '#F43F5E';
            if (status === 'ELEVATED') return '#F59E0B';
            return '#3B82F6';
          }}
          maskColor="rgba(241, 245, 249, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};
