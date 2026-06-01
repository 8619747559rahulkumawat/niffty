import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactFlow, useReactFlow, addEdge, Position, Initable } from 'reactflow';
import '@reactflow/stylesheet/dist/style.css';
import { Campaign } from '../../../services/campaignService';
import { toast } from 'react-hot-toast';

const AutomationBuilder = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { nodes, edges } = useReactFlow();
  const dispatch = useDispatch();
  
  const [campaign, setCampaign] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize flow with basic nodes if none exist
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const response = await Campaign.getById(campaignId);
        setCampaign(response.data);
        
        // If campaign has automation flow data, load it
        if (response.data.automationFlow) {
          // Load saved flow
          const { nodes, edges } = JSON.parse(response.data.automationFlow);
          // Note: In a real implementation, we would update the flow here
        }
      } catch (error) {
        toast.error('Failed to load campaign');
      } finally {
        setIsLoading(false);
      }
    };

    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  const handleSave = async () => {
    if (isSaving || !campaignId) return;
    
    try {
      setIsSaving(true);
      const automationFlow = JSON.stringify({ nodes, edges });
      
      await Campaign.update(campaignId, { automationFlow });
      toast.success('Automation flow saved successfully');
      navigate(`/campaigns/${campaignId}`);
    } catch (error) {
      toast.error('Failed to save automation flow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNode = (nodeId) => {
    // Implementation would remove node and associated edges
    // For brevity, simplified version
  };

  const handleAddNode = (type, position) => {
    const [x, y] = position;
    let newNode;

    switch (type) {
      case 'sendMessage':
        newNode = {
          id: `sendmessage-${Date.now()}`,
          type: 'sendMessage',
          position: { x, y },
          data: {
            label: 'Send Message',
            message: '',
            templateId: null,
            buttons: []
          }
        };
        break;
        
      case 'waitDelay':
        newNode = {
          id: `wait-${Date.now()}`,
          type: 'waitDelay',
          position: { x, y },
          data: {
            label: 'Wait/Delay',
            delayTime: 1000,
            delayUnit: 'seconds'
          }
        };
        break;
        
      case 'condition':
        newNode = {
          id: `condition-${Date.now()}`,
          type: 'condition',
          position: { x, y },
          data: {
            label: 'Condition',
            field: '',
            operator: 'equals',
            value: ''
          }
        };
        break;
        
      case 'webhook':
        newNode = {
          id: `webhook-${Date.now()}`,
          type: 'webhook',
          position: { x, y },
          data: {
            label: 'Webhook',
            url: '',
            method: 'POST',
            headers: {},
            body: ''
          }
        };
        break;
        
      case 'apiCall':
        newNode = {
          id: `api-${Date.now()}`,
          type: 'apiCall',
          position: { x, y },
          data: {
            label: 'API Call',
            url: '',
            method: 'GET',
            headers: {},
            body: ''
          }
        };
        break;
        
      case 'tagUser':
        newNode = {
          id: `tag-${Date.now()}`,
          type: 'tagUser',
          position: { x, y },
          data: {
            label: 'Tag User',
            tags: []
          }
        };
        break;
        
      default:
        return;
    }

    // Add node to flow
    // In a real implementation with reactflow, we would use the setNodes function
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Automation Builder</h2>
          
          {/* Node Types */}
          <div className="space-y-2">
            <button 
              onClick={() => handleAddNode('sendMessage', [100, 100])}
              className="w-full text-left bg-gray-50 p-3 rounded border hover:bg-gray-100"
            >
              Send Message
            </button>
            
            <button 
              onClick={() => handleAddNode('waitDelay', [100, 100])}
              className="w-full text-left bg-gray-50 p-3 rounded border hover:bg-gray-100"
            >
              Wait/Delay
            </button>
            
            <button 
              onClick={() => handleAddNode('condition', [100, 100])}
              className="w-full text-left bg-gray-50 p-3 rounded border hover:bg-gray-100"
            >
              Condition
            </button>
            
            <button 
              onClick={() => handleAddNode('webhook', [100, 100])}
              className="w-full text-left bg-gray-50 p-3 rounded border hover:bg-gray-100"
            >
              Webhook
            </button>
            
            <button 
              onClick={() => handleAddNode('apiCall', [100, 100])}
              className="w-full text-left bg-gray-50 p-3 rounded border hover:bg-gray-100"
            >
              API Call
            </button>
            
            <button 
              onClick={() => handleAddNode('tagUser', [100, 100])}
              className="w-full text-left bg-gray-50 p-3 rounded border hover:bg-gray-100"
            >
              Tag User
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Flow'}
            </button>
          </div>
        </aside>
      </aside>
      
      {/* Main Canvas */}
      <section className="flex-1 bg-gray-50 relative">
        <div className="absolute inset-0 p-4">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => {
              // In a real implementation, we would update nodes
              console.log('Nodes changed:', changes);
            }}
            onEdgesChange={(changes) => {
              // In a real implementation, we would update edges
              console.log('Edges changed:', changes);
            }}
            onConnect={(connection) => {
              // In a real implementation, we would add the edge
              console.log('Connecting:', connection);
            }}
            fitView
            zoomOnWheel
            panOnDrag
            className="h-[calc(100vh-4.5rem)] w-full"
          >
            {/* Custom node types would be defined here */}
          </ReactFlow>
        </div>
      </section>
    </div>
  );
};

export default AutomationBuilder;