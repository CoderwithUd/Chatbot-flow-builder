
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, TextField, Button, Typography, Paper, Snackbar, Alert } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
// Text Node Component
function TextNode({ data, selected }) {
  return (
    <div style={{
      padding: 10,
      border: selected ? '2px solid #1976d2' : '1px solid #ddd',
      borderRadius: 5,
      background: 'white'
    }}>
      <Handle type="target" position={Position.Top} />
      <div>{data.text}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { textNode: TextNode };

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [error, setError] = useState('');

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = { x: event.clientX, y: event.clientY };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { text: 'New Message' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const validateFlow = () => {
    const nodesWithNoTarget = nodes.filter(node =>
      !edges.some(edge => edge.target === node.id)
    );

    if (nodes.length > 1 && nodesWithNoTarget.length > 1) {
      // toast.error('Error: More than one node has empty target handles!')
      setError('Error: More than one node has empty target handles!');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (validateFlow()) {
      console.log('Flow saved:', { nodes, edges });
      toast("Flow Saved Succsefully");
    }
  };

  return (
    <>
    <ToastContainer/>
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
        nodes={nodes}
        setNodes={setNodes}
      />

      <div style={{ flex: 1 }} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(e, node) => setSelectedNodeId(node.id)}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>

        <Button
          variant="contained"
          color="primary"
          style={{ position: 'absolute', top: 10, right: 10 }}
          onClick={handleSave}
        >
          Save Flow
        </Button>
      </div>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </div>
    </>
  );
}

// Sidebar Component
function Sidebar({ selectedNodeId, setSelectedNodeId, nodes, setNodes }) {
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleTextChange = (e) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: { ...node.data, text: e.target.value } }
          : node
      )
    );
  };

  return (
    <Paper style={{ width: 300, padding: 16, height: '100%' }}>
      {selectedNode ? (
        <div>
          <Typography variant="h6" gutterBottom>Edit Node</Typography>
          <TextField
            label="Message Text"
            multiline
            rows={4}
            fullWidth
            value={selectedNode.data.text}
            onChange={handleTextChange}
            variant="outlined"
          />
          <Button
            variant="outlined"
            style={{ marginTop: 16 }}
            onClick={() => setSelectedNodeId(null)}
          >
            Back to Nodes
          </Button>
        </div>
      ) : (
        <div>
          <Typography variant="h6" gutterBottom>Nodes Panel</Typography>
          <Box
            draggable
            onDragStart={(e) => onDragStart(e, 'textNode')}
            style={{
              padding: 16,
              border: '1px dashed #1976d2',
              borderRadius: 4,
              marginBottom: 16,
              cursor: 'grab',
              textAlign: 'center'
            }}
          >
            Text Message Node
          </Box>
        </div>
      )}
    </Paper>
  );
}

export default App;
