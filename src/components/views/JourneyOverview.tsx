import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  MarkerType,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react';
import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React, { memo, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { dataFetcher } from '../../store';

import '@xyflow/react/dist/style.css';

type JourneyCommunication = {
  id: string;
  channel: string;
  trigger: string;
  template?: {
    id: string | null;
    exists: boolean;
    preview_url: string | null;
  };
};

type JourneyStep = {
  id: string;
  code: string;
  title: string;
  status: string;
  description: string;
  list?: {
    id: string;
    exists: boolean;
    url: string;
  } | null;
  communications: JourneyCommunication[];
};

type JourneyEdge = {
  source: string;
  target: string;
  label: string;
  kind?: string;
};

type JourneyDefinition = {
  title: string;
  steps: JourneyStep[];
  edges: JourneyEdge[];
};

type JourneyPayload = {
  title: string;
  journeys: {
    user: JourneyDefinition;
    match: JourneyDefinition;
  };
};

type JourneyNodeData = {
  journey: 'user' | 'match';
  step: JourneyStep;
};

type JourneyNodeType = Node<JourneyNodeData, 'journeyNode'>;

const Page = styled.div`
  width: 100%;
  height: calc(100vh - 140px);
  min-height: 720px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};

  .react-flow__attribution {
    display: none;
  }
`;

const TitleBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  padding: ${({ theme }) => theme.spacing.xxsmall} ${({ theme }) => theme.spacing.small};
`;

const Canvas = styled.div`
  flex: 1;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.medium};
  overflow: hidden;
`;

const NodeCard = styled.article`
  width: 320px;
  border-radius: ${({ theme }) => theme.radius.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  background: ${({ theme }) => theme.color.surface.primary};
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const NodeHeader = styled.div<{ $journey: 'user' | 'match' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  background: ${({ $journey, theme }) =>
    $journey === 'user' ? theme.color.surface.accent : theme.color.surface.secondary};
`;

const NodeContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.full};
  padding: 2px ${({ theme }) => theme.spacing.xsmall};
`;

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const InlineLink = styled.a`
  color: ${({ theme }) => theme.color.text.accent};
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 12px;
`;

const EmailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const EmailRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const PreviewFrameWrap = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface.secondary};
  height: 96px;
`;

const PreviewFrame = styled.iframe`
  width: 1120px;
  height: 760px;
  border: 0;
  transform: scale(0.16);
  transform-origin: top left;
`;

const HiddenHandle = styled(Handle)`
  opacity: 0;
`;

const edgeColorFor = (journey: 'user' | 'match', kind?: string) => {
  if (kind === 'warning') {
    return '#a8232a';
  }
  return journey === 'user' ? '#1c6f5a' : '#915314';
};

function JourneyNodeComponent({ data }: NodeProps<JourneyNodeType>) {
  const previewEmails =
    data.journey === 'user'
      ? data.step.communications
          .filter(communication => communication.template?.exists && communication.template.preview_url)
          .slice(0, 2)
      : [];

  return (
    <NodeCard>
      <HiddenHandle type="target" position={Position.Left} />
      <NodeHeader $journey={data.journey}>
        <Text type={TextTypes.Body7} bold>
          {data.step.code}
        </Text>
        <StatusPill>
          <Text type={TextTypes.Body7} tag="span">
            {data.step.status}
          </Text>
        </StatusPill>
      </NodeHeader>
      <NodeContent>
        <Text type={TextTypes.Body6} bold>
          {data.step.title}
        </Text>
        <Text type={TextTypes.Body7}>{data.step.description}</Text>

        {data.step.list?.url ? (
          <LinkRow>
            <InlineLink href={data.step.list.url}>
              Open {data.journey === 'user' ? 'users' : 'matches'} list
            </InlineLink>
          </LinkRow>
        ) : null}

        {data.step.communications.length ? (
          <EmailList>
            <Text type={TextTypes.Body7} bold>
              Communications
            </Text>
            {data.step.communications.slice(0, 4).map(communication => (
              <EmailRow key={`${data.step.id}-${communication.id}`}>
                <Text type={TextTypes.Body7}>{communication.id}</Text>
                {communication.template?.preview_url ? (
                  <InlineLink href={communication.template.preview_url}>
                    {communication.template.id || 'template'}
                  </InlineLink>
                ) : (
                  <Text type={TextTypes.Body7}>not linked</Text>
                )}
              </EmailRow>
            ))}
          </EmailList>
        ) : null}

        {previewEmails.length ? (
          <PreviewGrid>
            {previewEmails.map(communication => (
              <PreviewFrameWrap key={`${data.step.id}-preview-${communication.id}`}>
                <PreviewFrame
                  loading="lazy"
                  src={communication.template?.preview_url || ''}
                  title={`${communication.id} preview`}
                />
              </PreviewFrameWrap>
            ))}
          </PreviewGrid>
        ) : null}
      </NodeContent>
      <HiddenHandle type="source" position={Position.Right} />
    </NodeCard>
  );
}

const JourneyNode = memo(JourneyNodeComponent);

const nodeTypes: NodeTypes = {
  journeyNode: JourneyNode,
};

const buildGraph = (payload?: JourneyPayload): { nodes: JourneyNodeType[]; edges: Edge[] } => {
  if (!payload) {
    return { nodes: [], edges: [] };
  }

  const nodes: JourneyNodeType[] = [];
  const edges: Edge[] = [];

  const buildJourneyNodes = (
    journey: 'user' | 'match',
    definition: JourneyDefinition,
    y: number,
  ) => {
    definition.steps.forEach((step, index) => {
      nodes.push({
        id: step.id,
        type: 'journeyNode',
        position: {
          x: 60 + index * 360,
          y,
        },
        data: { journey, step },
      });
    });

    definition.edges.forEach(edge => {
      const stroke = edgeColorFor(journey, edge.kind);
      edges.push({
        id: `${edge.source}__${edge.target}__${edge.label}`,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        label: edge.label,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stroke,
          width: 16,
          height: 16,
        },
        style: {
          stroke,
          strokeWidth: edge.kind === 'warning' ? 2.1 : 1.8,
          strokeDasharray: edge.kind === 'warning' ? '5 4' : undefined,
        },
      });
    });
  };

  buildJourneyNodes('user', payload.journeys.user, 90);
  buildJourneyNodes('match', payload.journeys.match, 700);
  return { nodes, edges };
};

function JourneyOverviewCanvas() {
  const { data, isLoading, error } = useSWR<JourneyPayload>(
    '/api/matching/journeys/overview/',
    dataFetcher,
  );
  const graph = useMemo(() => buildGraph(data), [data]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setEdges, setNodes]);

  if (isLoading) {
    return <Text type={TextTypes.Body5}>Loading journey overview...</Text>;
  }

  if (error || !data) {
    return (
      <Text type={TextTypes.Body5}>
        Could not load journey overview data from backend.
      </Text>
    );
  }

  return (
    <Page>
      <TitleBar>
        <Text type={TextTypes.Heading4} tag="h1">
          {data.title}
        </Text>
        <Text type={TextTypes.Body6}>
          Tim: This is an attempt at visualising and making refering user
          journey emails and elements easier; this must not reflect the current
          journey fully also list will still overlap, also email trigger require
          independent implementations; so this should be use to help refine the
          journey further and is subject to change
        </Text>
      </TitleBar>
      <Canvas>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.18}
          maxZoom={1.4}
          proOptions={{ hideAttribution: true }}
        >
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable />
          <Background gap={28} />
        </ReactFlow>
      </Canvas>
    </Page>
  );
}

export default function JourneyOverview() {
  return (
    <ReactFlowProvider>
      <JourneyOverviewCanvas />
    </ReactFlowProvider>
  );
}
