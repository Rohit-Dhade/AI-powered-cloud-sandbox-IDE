// Sandbox API service
const BASE_URL = '/api';

/**
 * Start a new sandbox
 * @returns {Promise<{sandboxId: string, previewUrl: string}>}
 */
export async function startSandbox() {
  const res = await fetch(`${BASE_URL}/sandbox/start`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to start sandbox: ${res.statusText}`);
  return res.json();
}

/**
 * List files in a sandbox
 * @param {string} sandboxId
 */
export async function listFiles(sandboxId) {
  const agentUrl = `http://${sandboxId}.agent.localhost`;
  const res = await fetch(`${agentUrl}/list-files`);
  if (!res.ok) throw new Error(`Failed to list files: ${res.statusText}`);
  return res.json();
}

/**
 * Read file contents
 * @param {string} sandboxId
 * @param {string[]} files - array of file paths
 */
export async function readFiles(sandboxId, files) {
  const agentUrl = `http://${sandboxId}.agent.localhost`;
  const query = files.map(f => `files=${encodeURIComponent(f)}`).join('&');
  const res = await fetch(`${agentUrl}/read-files?${query}`);
  if (!res.ok) throw new Error(`Failed to read files: ${res.statusText}`);
  return res.json();
}

/**
 * Update files in a sandbox
 * @param {string} sandboxId
 * @param {{file: string, content: string}[]} updates
 */
export async function updateFiles(sandboxId, updates) {
  const agentUrl = `http://${sandboxId}.agent.localhost`;
  const res = await fetch(`${agentUrl}/update-files`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
  if (!res.ok) throw new Error(`Failed to update files: ${res.statusText}`);
  return res.json();
}

/**
 * Invoke AI with SSE streaming
 * @param {string} message
 * @param {string} sandboxId
 * @param {(chunk: string, type: string) => void} onChunk
 * @returns {Promise<void>}
 */
export async function invokeAI(message, sandboxId, onChunk) {
  const res = await fetch(`${BASE_URL}/ai/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sandboxId }),
  });

  if (!res.ok) throw new Error(`AI invoke failed: ${res.statusText}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          onChunk(parsed.content || parsed.text || JSON.stringify(parsed), parsed.type || 'text');
        } catch {
          // raw text
          onChunk(data, 'text');
        }
      } else if (line.startsWith('event: ')) {
        // event type
      }
    }
  }
}
