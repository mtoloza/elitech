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
import axios from "axios";
import { ChevronDown, ChevronRight } from "lucide-react";

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

const getLayoutedElements = (nodes, edges, direction = "TB") => {
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
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
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

// Nodo personalizado colapsable
function CollapsibleNode({ data, isCollapsed, onToggle, selected }) {
  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onToggle();
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
    const hasChildren = Array.isArray(member.subordinates) && member.subordinates.length > 0;
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
      member.subordinates.forEach((child) => addMember(child, id));
    }
  }

  members.forEach((m) => addMember(m));
  return { nodes, edges };
}

function OrgChartHoldingFlow({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onToggleCollapse }) {
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
      style={{ width: "80vw", height: "80vh" }}
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

const OrgChartView = () => {
  const { view } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/team/org/${view}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError("Error al cargar los datos del organigrama");
        console.error("Error fetching org chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [view]);

  const toggleNode = (nodeId) => {
    setCollapsedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNode = (node) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes.has(node.id);

    return (
      <div key={node.id} className="flex flex-col items-center">
        <div className="relative">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 min-w-[200px]">
            <div className="text-center">
              <h3 className="font-semibold text-gray-800">{node.name}</h3>
              <p className="text-sm text-gray-600">{node.position}</p>
              {node.email && (
                <p className="text-xs text-gray-500">{node.email}</p>
              )}
            </div>
          </div>
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 shadow-md border border-gray-200"
            >
              {isCollapsed ? (
                <ChevronRight size={16} className="text-gray-600" />
              ) : (
                <ChevronDown size={16} className="text-gray-600" />
              )}
            </button>
          )}
        </div>
        {hasChildren && !isCollapsed && (
          <div className="mt-8 flex gap-8">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="h-8 w-0.5 bg-gray-300 mb-8"></div>
                {renderNode(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">No hay datos disponibles</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">
        Organigrama {view.charAt(0).toUpperCase() + view.slice(1)}
      </h1>
      <div className="flex justify-center">
        {renderNode(data)}
      </div>
    </div>
  );
};

export default OrgChartView; 