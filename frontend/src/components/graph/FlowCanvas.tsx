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
  ConnectionLineType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomSupplierNode } from './CustomSupplierNode';
import { getTieredLayout } from '../../utils/graphLayout';
import { SupplyChainDAGResponse, Supplier } from '../../types/supply-chain';

interface FlowCanvasProps {
  dag: SupplyChainDAGResponse;
  onSelectSupplier: (supplier: Supplier | null) => void;
  selectedSupplierId?: string | null;
}

const nodeTypes: any = {
  customSupplier: CustomSupplierNode,
};

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  dag,
  onSelectSupplier,
  selectedSupplierId,
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

  // Map domain edges to React Flow edges
  // Direction: Upstream child -> Downstream parent (Left to Right)
  const initialEdges: Edge[] = useMemo(() => {
    const criticalNodeIds = new Set(
      dag.nodes.filter((n) => n.status === 'CRITICAL').map((n) => n.id)
    );
    const elevatedNodeIds = new Set(
      dag.nodes.filter((n) => n.status === 'ELEVATED').map((n) => n.id)
    );

    return dag.edges.map((edge) => {
      // In supply_edges: parent is downstream, child is upstream
      // We want flow from child (upstream) -> parent (downstream)
      const source = edge.childSupplierId;
      const target = edge.parentSupplierId;

      const isDisrupted = criticalNodeIds.has(source) || criticalNodeIds.has(target);
      const isElevated = elevatedNodeIds.has(source) || elevatedNodeIds.has(target);

      let strokeColor = 'rgba(0, 240, 255, 0.4)';
      let strokeWidth = 1.5;

      if (isDisrupted) {
        strokeColor = '#FF2E54';
        strokeWidth = 2.5;
      } else if (isElevated) {
        strokeColor = '#FFB800';
        strokeWidth = 2.0;
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
        label: edge.shippingRoute ? `[${edge.shippingRoute}]` : undefined,
        labelStyle: {
          fill: isDisrupted ? '#FF2E54' : '#94A3B8',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: '#07090E',
          fillOpacity: 0.85,
        },
      };
    });
  }, [dag.edges, dag.nodes]);

  // Run Dagre tiered layout
  const layoutedNodes = useMemo(() => {
    return getTieredLayout(initialNodes, initialEdges, 'LR');
  }, [initialNodes, initialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when dag changes
  React.useEffect(() => {
    const layouted = getTieredLayout(initialNodes, initialEdges, 'LR');
    setNodes(layouted);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
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
          size={1}
          color="rgba(0, 240, 255, 0.12)"
        />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          className="hidden md:block !bg-[#0A0F18]/90 !border !border-white/10 !rounded-xl !overflow-hidden"
          nodeColor={(n) => {
            const status = (n.data as any)?.status;
            if (status === 'CRITICAL') return '#FF2E54';
            if (status === 'ELEVATED') return '#FFB800';
            return '#00F0FF';
          }}
          maskColor="rgba(7, 9, 14, 0.85)"
        />
      </ReactFlow>
    </div>
  );
};
