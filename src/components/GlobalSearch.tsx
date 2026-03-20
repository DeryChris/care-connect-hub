// src/components/GlobalSearch.tsx
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Search, X, Loader2, BookOpen, Users, User, Calendar, FlaskConical } from 'lucide-react';
import { useSearch } from '@/hooks';

const TYPE_ICONS: Record<string, React.ElementType> = {
  knowledge: BookOpen,
  patient: User,
  user: Users,
  appointment: Calendar,
  labtest: FlaskConical,
};

const TYPE_COLORS: Record<string, string> = {
  knowledge: 'bg-primary/10 text-primary',
  patient: 'bg-info/10 text-info',
  user: 'bg-success/10 text-success',
  appointment: 'bg-warning/10 text-warning',
  labtest: 'bg-destructive/10 text-destructive',
};

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useSearch(query);
  const results = data?.data ?? [];

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search knowledge, patients, staff..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="pl-10 pr-9 h-9 bg-card"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7 p-0"
            onClick={clearSearch}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {showResults && query.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg border-border overflow-hidden">
          <CardContent className="p-0">
            {isLoading || isFetching ? (
              <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-muted-foreground mt-1">Try different keywords</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {results.map(result => {
                  const Icon = TYPE_ICONS[result.type] ?? Search;
                  const colorClass = TYPE_COLORS[result.type] ?? 'bg-muted text-muted-foreground';
                  return (
                    <Link
                      key={result.id}
                      to={result.url}
                      className="flex items-start gap-3 p-3 hover:bg-accent border-b border-border/50 last:border-b-0 transition-colors"
                      onClick={handleResultClick}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground line-clamp-1">{result.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{result.excerpt}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full capitalize">{result.type}</span>
                          {result.category && (
                            <span className="text-xs text-muted-foreground capitalize">{result.category.replace('_', ' ')}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <div className="p-2 text-center border-t border-border/50">
                  <p className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;
