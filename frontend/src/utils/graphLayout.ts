import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

export const getTieredLayout = (
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): Node[] => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Configure Dagre layout options
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 220, // Distance between tiers for edge labels
    nodesep: 90,  // Distance between nodes in same tier
    marginx: 50,
    marginy: 50,
  });

  const nodeWidth = 320;
  const nodeHeight = 190;


  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    // Flow edges from upstream to downstream or downstream to upstream
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });
};
