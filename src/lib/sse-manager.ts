interface SSEClient {
  id: string;
  write: (data: string) => void;
  close: () => void;
}

const clients = new Map<string, SSEClient>();

export function addClient(id: string, client: SSEClient) {
  clients.set(id, client);
}

export function removeClient(id: string) {
  const client = clients.get(id);
  if (client) {
    client.close();
    clients.delete(id);
  }
}

export function broadcast(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      clients.delete(client.id);
    }
  });
}