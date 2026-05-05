import RequestPanel from '../components/request/RequestPanel';
import ResponsePanel from '../components/response/ResponsePanel';
import { Panel, Group, Separator } from 'react-resizable-panels';

export default function RequestPage() {
  return (
    <Group orientation="vertical" className="h-full">
      <Panel defaultSize={50} minSize={20}>
        <div className="h-full overflow-y-auto">
          <RequestPanel />
        </div>
      </Panel>
      <Separator className="h-1 bg-border hover:bg-primary transition-colors cursor-row-resize" />
      <Panel defaultSize={50} minSize={20}>
        <div className="h-full overflow-y-auto">
          <ResponsePanel />
        </div>
      </Panel>
    </Group>
  );
}
