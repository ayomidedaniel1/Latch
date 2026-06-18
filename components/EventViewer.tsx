import { ReplayButton } from './ReplayButton';

type WebhookEvent = {
  id: string;
  headers: Record<string, string>;
  body: unknown;
  raw_body: string;
  received_at: string;
};

export function EventViewer({
  event,
  destinationUrl,
}: {
  event: WebhookEvent;
  destinationUrl: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 text-sm space-y-4">
      <div>
        <div className="text-xs text-gray-500 mb-1">Received</div>
        <div className="font-mono text-xs">
          {new Date(event.received_at).toLocaleString()}
        </div>
      </div>

      <ReplayButton eventId={event.id} initialDestinationUrl={destinationUrl} />

      <div>
        <div className="text-xs text-gray-500 mb-1">Headers</div>
        <pre className="bg-gray-50 rounded-md p-3 overflow-x-auto text-xs font-mono leading-relaxed">
          {JSON.stringify(event.headers, null, 2)}
        </pre>
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1">Payload</div>
        <pre className="bg-gray-50 rounded-md p-3 overflow-x-auto text-xs font-mono leading-relaxed">
          {event.body ? JSON.stringify(event.body, null, 2) : event.raw_body}
        </pre>
      </div>
    </div>
  );
}
