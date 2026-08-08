import { useMemo, useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Card } from '@/components/ui/Card';

const articles = [
  {
    id: 'article-1',
    title: 'Root cause analysis for mainline motor faults',
    category: 'Maintenance',
    summary: 'Step-by-step troubleshooting routines for frequent motor vibration and temperature anomalies.'
  },
  {
    id: 'article-2',
    title: 'OEE improvement checklist',
    category: 'Production',
    summary: 'Guidance on identifying bottlenecks, balancing load, and minimizing unplanned downtime.'
  },
  {
    id: 'article-3',
    title: 'SCADA connector recovery best practices',
    category: 'Systems',
    summary: 'Procedures for restoring connectivity and validating sensor data after a gateway outage.'
  }
];

export function KnowledgeBasePage() {
  const [query, setQuery] = useState('');

  const visibleArticles = useMemo(
    () =>
      articles.filter((article) =>
        [article.title, article.category, article.summary].some((text) => text.toLowerCase().includes(query.toLowerCase()))
      ),
    [query]
  );

  return (
    <div className="space-y-6">
      <Panel title="Knowledge Base" subtitle="Domain guides, troubleshooting and maintenance playbooks">
        <div className="space-y-6">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search SOPs, assets, connectors..."
            className="w-full rounded-3xl border border-white/10 bg-maintix-surface px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-maintix-primary focus:outline-none focus:ring-2 focus:ring-maintix-primary/20"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {visibleArticles.map((article) => (
              <Card key={article.id} title={article.title}>
                <p className="text-sm text-slate-300">{article.summary}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">{article.category}</p>
              </Card>
            ))}
            {visibleArticles.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-maintix-surface p-6 text-slate-400">
                No knowledge base articles match your search.
              </div>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
