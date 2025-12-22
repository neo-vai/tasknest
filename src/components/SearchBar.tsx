"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { RiSearchLine, RiFolderLine, RiTaskLine } from "@remixicon/react";
import Link from "next/link";

interface ProjectResult {
  id: string;
  name: string;
  description: string | null;
  _count: { tasks: number; members: number };
}

interface TaskResult {
  id: string;
  title: string;
  project: { id: string; name: string };
}

interface SearchResults {
  projects: ProjectResult[];
  tasks: TaskResult[];
}

export function SearchBar() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const enabled = !!session?.user && debouncedQuery.length >= 2;

  const { data, isLoading, isError } = useQuery<SearchResults>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled,
  });

  const hasResults =
    data && (data.projects.length > 0 || data.tasks.length > 0);

  useEffect(() => {
    if (enabled) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [enabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleClear = useCallback(() => {
    setQuery("");
    setOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative w-64" ref={containerRef}>
      <div className="relative">
        <RiSearchLine className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search projects and tasks..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (enabled && hasResults) setOpen(true);
          }}
          className="h-8 pl-8 pr-8 text-xs"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label="Clear search"
          >
            <span className="text-xs leading-none">×</span>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 w-full z-50 bg-popover text-popover-foreground rounded-lg border border-border shadow-md overflow-hidden">
          {isLoading && (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              Searching...
            </div>
          )}
          {isError && (
            <div className="px-3 py-4 text-xs text-destructive text-center">
              Search failed. Please try again.
            </div>
          )}
          {!isLoading && !isError && enabled && !hasResults && (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              No results found for &quot;{debouncedQuery}&quot;
            </div>
          )}
          {!isLoading && !isError && hasResults && (
            <div className="max-h-[60vh] overflow-y-auto">
              {data.projects.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
                    Projects
                  </div>
                  {data.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      onClick={handleItemClick}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <RiFolderLine className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {project._count.tasks} tasks · {project._count.members} members
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {data.tasks.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
                    Tasks
                  </div>
                  {data.tasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/projects/${task.project.id}/tasks/${task.id}`}
                      onClick={handleItemClick}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <RiTaskLine className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {task.project.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}