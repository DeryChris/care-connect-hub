import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { mockKnowledgeArticles } from '@/lib/mock-knowledge';
import { mockPatients, mockUsers, mockAppointments, mockLaboratoryTests } from '@/lib/mock-data';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'knowledge' | 'patient' | 'user' | 'appointment' | 'labtest';
  category?: string;
  excerpt: string;
  url: string;
}

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const allData = [
      ...mockKnowledgeArticles.map(article => ({
        id: article.id,
        title: article.title,
        type: 'knowledge' as const,
        category: article.category,
        excerpt: article.content.substring(0, 100) + '...',
        url: `/knowledge/${article.id}`
      })),
      ...mockPatients.map(patient => ({
        id: patient.id,
        title: patient.name,
        type: 'patient' as const,
        category: undefined,
        excerpt: `DOB: ${patient.date_of_birth} | ${patient.phone}`,
        url: `/patients/${patient.id}`
      })),
      ...mockUsers.map(user => ({
        id: user.id,
        title: user.name,
        type: 'user' as const,
        category: user.designation,
        excerpt: `${user.role} | ${user.email}`,
        url: `/users/${user.id}`
      })),
      ...mockAppointments.map(appointment => ({
        id: appointment.id,
        title: `${appointment.patient_name} - ${appointment.doctor_name}`,
        type: 'appointment' as const,
        category: undefined,
        excerpt: `${appointment.appointment_date} ${appointment.status}`,
        url: `/appointments/${appointment.id}`
      })),
      ...mockLaboratoryTests.map(test => ({
        id: test.id,
        title: `${test.patient_name} - ${test.test_name}`,
        type: 'labtest' as const,
        category: undefined,
        excerpt: `${test.status} | ${test.ordered_by_name}`,
        url: `/laboratory/${test.id}`
      }))
    ];

    // Simple fuzzy search
    return allData
      .filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8); // Top 8 results
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
  };

  // Manage dropdown open state for search results
  const setIsOpen = (open: boolean) => {
    setShowResults(open);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative w-80">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search knowledge, patients, staff..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="pl-10 pr-10 h-9 bg-card"
            onAnimationEnd={() => !query && setShowResults(false)}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-auto shadow-lg border-border">
          <CardContent className="p-0">
            {results.map((result) => (
              <Link
                key={result.id}
                to={result.url}
                className="block p-4 hover:bg-accent first:rounded-t-lg last:rounded-b-lg border-b border-border/50 last:border-b-0"
                onClick={() => {
                  setShowResults(false);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-medium`}>
                    {result.type === 'knowledge' && '📚'}
                    {result.type === 'patient' && '👤'}
                    {result.type === 'user' && '👨‍⚕️'}
                    {result.type === 'appointment' && '📅'}
                    {result.type === 'labtest' && '🧪'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm line-clamp-1">{result.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{result.excerpt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                        {result.type}
                      </span>
                      {result.category && (
                        <span className="text-xs bg-accent/50 px-1.5 py-0.5 rounded-full capitalize">
                          {result.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {showResults && query && results.length === 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg border-border">
          <CardContent className="p-6 text-center py-8">
            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-sm font-medium text-muted-foreground mb-1">No results found</h3>
            <p className="text-xs text-muted-foreground mb-4">Try different keywords</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;

