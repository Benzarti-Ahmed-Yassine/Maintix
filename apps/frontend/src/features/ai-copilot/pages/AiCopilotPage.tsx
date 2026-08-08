import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { fetchAiReply, fetchAiSuggestions } from '@/services/mockApi';
import { AiResponse, AiSuggestion } from '@/services/mockApi';

export function AiCopilotPage() {
  const [prompt, setPrompt] = useState('How can I reduce downtime on line B?');
  const [response, setResponse] = useState<AiResponse | null>(null);
  const { data: suggestions } = useQuery({ queryKey: ['aiSuggestions'], queryFn: fetchAiSuggestions });
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = async () => {
    setIsAsking(true);
    const reply = await fetchAiReply(prompt);
    setResponse(reply);
    setIsAsking(false);
  };

  const suggestionButtons = useMemo(
    () =>
      suggestions?.map((suggestion: AiSuggestion) => (
        <button
          key={suggestion.id}
          type="button"
          onClick={() => setPrompt(suggestion.label)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          {suggestion.label}
        </button>
      )),
    [suggestions]
  );

  return (
    <div className="space-y-6">
      <Panel title="AI Copilot" subtitle="Guided decisions for maintenance, production and asset resilience">
        <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
          <div className="space-y-4 rounded-3xl bg-maintix-surfaceLight p-6">
            <label className="block text-sm font-medium text-slate-300">Ask the Copilot</label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              className="w-full rounded-3xl border border-white/10 bg-maintix-surface px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-maintix-primary focus:outline-none focus:ring-2 focus:ring-maintix-primary/20"
            />
            <Button onClick={handleAsk} disabled={isAsking}>
              {isAsking ? 'Analyzing…' : 'Ask Copilot'}
            </Button>
            {response ? (
              <div className="rounded-3xl border border-white/10 bg-maintix-surface p-5 text-slate-100">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Answer</p>
                <p className="mt-4 text-sm leading-7 text-slate-300">{response.answer}</p>
                <p className="mt-4 text-xs text-slate-500">Updated at {new Date(response.createdAt).toLocaleTimeString()}</p>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-maintix-surface p-5 text-slate-400">Enter a question to receive guidance from the AI Copilot.</div>
            )}
          </div>
          <div className="space-y-4 rounded-3xl bg-maintix-surfaceLight p-6">
            <h3 className="text-lg font-semibold text-white">Quick start</h3>
            <div className="space-y-3">{suggestionButtons}</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
