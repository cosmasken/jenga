import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  X, 
  History, 
  TrendingUp, 
  Users, 
  Star,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  type: 'chama' | 'user' | 'transaction';
  description?: string;
  metadata?: {
    members?: number;
    round?: number;
    status?: string;
    amount?: number;
    currency?: string;
  };
}

interface EnhancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => Promise<SearchResult[]>;
  onResultSelect: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

interface SearchFilters {
  type?: 'all' | 'chama' | 'user' | 'transaction';
  status?: 'active' | 'completed' | 'recruiting';
  minMembers?: number;
  maxMembers?: number;
}

export function EnhancedSearch({ 
  onSearch, 
  onResultSelect, 
  placeholder = "Search chamas, users, or transactions...",
  className = ""
}: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ type: 'all' });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await onSearch(searchQuery.trim(), filters);
      setResults(searchResults);
      setShowResults(true);
      
      // Save to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = (value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result);
    setShowResults(false);
    setQuery('');
  };

  const clearFilters = () => {
    setFilters({ type: 'all' });
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'chama': return <Users className="h-4 w-4 text-blue-600" />;
      case 'user': return <Star className="h-4 w-4 text-green-600" />;
      case 'transaction': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default: return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          {/* Search Input */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowResults(true)}
                className="pl-10 pr-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`relative ${activeFilterCount > 0 ? 'border-bitcoin text-bitcoin' : ''}`}
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-bitcoin text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type:</span>
                    {['all', 'chama', 'user', 'transaction'].map((type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant={filters.type === type ? "default" : "outline"}
                        onClick={() => setFilters({ ...filters, type: type as any })}
                        className={filters.type === type ? 'bg-bitcoin hover:bg-bitcoin/90' : ''}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>

                  {filters.type === 'chama' && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                      {['active', 'recruiting', 'completed'].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={filters.status === status ? "default" : "outline"}
                          onClick={() => setFilters({ ...filters, status: status as any })}
                          className={filters.status === status ? 'bg-bitcoin hover:bg-bitcoin/90' : ''}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  )}

                  {activeFilterCount > 0 && (
                    <div className="flex justify-end">
                      <Button size="sm" variant="ghost" onClick={clearFilters}>
                        <X className="h-3 w-3 mr-1" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (query || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="border shadow-lg bg-white dark:bg-gray-900">
              <CardContent className="p-0">
                {/* Recent Searches */}
                {!query && recentSearches.length > 0 && (
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setQuery(search);
                            handleSearch(search);
                          }}
                          className="text-xs"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {results.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start gap-3">
                          {getResultIcon(result.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {result.name}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                              {result.address.slice(0, 10)}...{result.address.slice(-8)}
                            </p>
                            {result.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                {result.description}
                              </p>
                            )}
                            {result.metadata && (
                              <div className="flex gap-2 flex-wrap">
                                {result.metadata.members && (
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                    {result.metadata.members} members
                                  </span>
                                )}
                                {result.metadata.round && (
                                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                    Round {result.metadata.round}
                                  </span>
                                )}
                                {result.metadata.status && (
                                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                                    {result.metadata.status}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : query && !isSearching && (
                  <div className="p-8 text-center">
                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No results found for "{query}"
                    </p>
                  </div>
                )}

                {isSearching && (
                  <div className="p-8 text-center">
                    <Loader2 className="h-6 w-6 text-bitcoin animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Searching...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick Action Bar Component
interface QuickAction {
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  shortcut?: string;
  color?: string;
}

interface QuickActionBarProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActionBar({ actions, className = "" }: QuickActionBarProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        const action = actions.find(a => a.shortcut === event.key);
        if (action) {
          event.preventDefault();
          action.action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {actions.map((action, index) => (
        <Button
          key={index}
          size="sm"
          variant="outline"
          onClick={action.action}
          className={`flex items-center gap-2 ${action.color || ''}`}
          title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
        >
          <action.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{action.label}</span>
          {action.shortcut && showShortcuts && (
            <Badge variant="secondary" className="text-xs">
              ⌘{action.shortcut}
            </Badge>
          )}
        </Button>
      ))}
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowShortcuts(!showShortcuts)}
        className="text-gray-500"
        title="Show keyboard shortcuts"
      >
        ⌘
      </Button>
    </div>
  );
}
