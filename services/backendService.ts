export interface ProcessError {
  filename: string;
  error: string;
}

export interface ProcessResult {
  processed: number;
  failed: number;
  written_rows: number;
  errors: ProcessError[];
}

export interface FailedReceipt {
  filename: string;
  error: string;
  timestamp: string | null;
}

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    if (data && typeof data.error === 'string') {
      return data.error;
    }
  } catch {
    // ignore
  }
  try {
    const text = await response.text();
    return text || 'Request failed';
  } catch {
    return 'Request failed';
  }
};

export const processReceipts = async (options: { retryFailed?: boolean; files?: string[] } = {}): Promise<ProcessResult> => {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      retry_failed: options.retryFailed || false,
      files: options.files
    })
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
};

export const fetchFailures = async (): Promise<FailedReceipt[]> => {
  const response = await fetch('/api/failures');
  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }
  const data = await response.json();
  return data.failures || [];
};

export const setOpenAIKey = async (apiKey: string): Promise<void> => {
  const response = await fetch('/api/config/openai-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey })
  });
  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }
};
