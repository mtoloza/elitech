import React, { useEffect, useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { useParams } from "react-router-dom";

const nodeWidth = 220;
const nodeHeight = 150;

const roleColors = {
  Executive: "#F9F1F0",
  Corporate: "#D6C998",
  Manager: "#989ED5",
  Director: "#8FBCC4",
  Leader: "#D6AA98",
  Coordinator: "#BA98D6",
  Operations: "#D9CDC5",
  Staff: "#EBEDFF",
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = "TB", verticalNodeIds = new Set()) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const vertical = verticalNodeIds.has(node.id);
    node.targetPosition = vertical ? Position.Top : (isHorizontal ? Position.Left : Position.Top);
    node.sourcePosition = vertical ? Position.Bottom : (isHorizontal ? Position.Right : Position.Bottom);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      style: { ...node.style, width: nodeWidth, height: nodeHeight },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Detectar nodos con role_type Operations y sus descendientes
function getVerticalNodeIds(members) {
  const verticalIds = new Set();
  function markVertical(member) {
    if (member.role_type === 'Operations') {
      verticalIds.add(member.id.toString());
      if (Array.isArray(member.children)) {
        member.children.forEach(markVertical);
      }
    } else if (Array.isArray(member.children)) {
      member.children.forEach(markVertical);
    }
  }
  members.forEach(markVertical);
  return verticalIds;
}

// Nodo personalizado colapsable
function CollapsibleNode({ data, isCollapsed, onToggle, selected }) {
  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onToggle();
  };

  const getCountryFlag = (location) => {
    if (!location) return null;
    const countryCode = location.toLowerCase();
    return `https://flagcdn.com/w160/${countryCode}.png`;
  };

  return (
    <div
      style={{
        padding: 8,
        borderRadius: 12,
        background: data.color,
        boxShadow: selected ? "0px 4px 12px #ff0" : "0px 2px 6px rgba(0,0,0,0.3)",
        color: "#000",
        fontFamily: "sans-serif",
        textAlign: "left",
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Solo bandera en la parte superior derecha */}
      {data.location && (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
          <img 
            src={getCountryFlag(data.location)} 
            alt={`${data.location} flag`}
            style={{ width: 35, height: 25, objectFit: "cover", borderRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
          />
        </div>
      )}
      <div>
        <div style={{ fontWeight: "bold", fontSize: 14 }}>{data.name}</div>
        <div style={{ fontSize: 12 }}>{data.position}</div>
        <div style={{ fontSize: 12 }}>{data.role_type}</div>
      </div>
      {data.hasChildren && (
        <div
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            zIndex: 1000,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleToggle}
            style={{
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 18,
              lineHeight: "24px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              pointerEvents: "auto",
            }}
            title={isCollapsed ? "Expandir" : "Colapsar"}
          >
            {isCollapsed ? "+" : "-"}
          </button>
        </div>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function membersToGraph(members, collapsedSet) {
  const nodes = [];
  const edges = [];

  function addMember(member, parentId = null) {
    const id = member.id.toString();
    const color = roleColors[member.role_type] || "#ccc";
    const hasChildren = Array.isArray(member.children) && member.children.length > 0;
    const isCollapsed = collapsedSet.has(id);

    nodes.push({
      id,
      type: "collapsible",
      data: {
        ...member,
        color,
        hasChildren,
        isCollapsed,
      },
      style: {},
    });

    if (parentId) {
      edges.push({ id: `${parentId}-${id}`, source: parentId, target: id });
    }

    if (hasChildren && !isCollapsed) {
      member.children.forEach((child) => addMember(child, id));
    }
  }

  members.forEach((m) => addMember(m));
  return { nodes, edges };
}

function OrgChartFlow({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onToggleCollapse }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    fitView({ padding: 0.3, includeHiddenNodes: true, duration: 500 });
  }, [nodes, edges, fitView]);

  const nodeTypes = useMemo(
    () => ({
      collapsible: (props) => (
        <CollapsibleNode
          {...props}
          isCollapsed={props.data.isCollapsed}
          onToggle={() => onToggleCollapse(props.id)}
        />
      ),
    }),
    [onToggleCollapse]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      fitViewOptions={{ padding: 0.3, includeHiddenNodes: true }}
      panOnDrag={[1, 2]}
      zoomOnScroll={true}
      zoomOnPinch={true}
      minZoom={0.1}
      maxZoom={2}
      style={{ width: "100vw", height: "100vh" }}
      nodeTypes={nodeTypes}
      preventScrolling={true}
      nodesDraggable={true}
      nodesConnectable={false}
      elementsSelectable={false}
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

export default function OrgChart() {
  const { region } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [collapsed, setCollapsed] = useState(new Set());

  // Manejar colapso/expansión
  const handleToggleCollapse = useCallback(
    (nodeId) => {
      setCollapsed((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    },
    []
  );

  useEffect(() => {
    let url = "http://localhost:8000/team/tree";
    if (region && region.toLowerCase() !== "global") {
      url += `?region=${region}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        const verticalNodeIds = getVerticalNodeIds(arr);
        const { nodes: graphNodes, edges: graphEdges } = membersToGraph(arr, collapsed);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(graphNodes, graphEdges, "TB", verticalNodeIds);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      });
  }, [region, collapsed, setNodes, setEdges]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ReactFlowProvider>
        <OrgChartFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={addEdge}
          onToggleCollapse={handleToggleCollapse}
        />
      </ReactFlowProvider>
    </div>
  );
}