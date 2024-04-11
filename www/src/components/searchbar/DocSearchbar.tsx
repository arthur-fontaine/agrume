/* eslint-disable */

import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { getOramaDB } from "@orama/plugin-astro/client";
import type { defaultSchema } from '@orama/plugin-astro';
import { searchWithHighlight, afterInsert as highlightAfterInsert } from '@orama/plugin-match-highlight'
import { create as createOramaDB, insert as insertInOramaDB } from '@orama/orama';
import { HighlightedDocument } from './HighlightedDocument.js';

interface CommandMenuProps {
  dbSchema: typeof defaultSchema;
}

export const DocSearchbar = ({ children, dbSchema }: PropsWithChildren<CommandMenuProps>) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const db = useMemo(
    () => (
      getOramaDB("mydb")
        .then(async (db) => {
          const dbClone = await createOramaDB({
            schema: dbSchema,
            components: {
              afterInsert: [highlightAfterInsert],
            },
          })

          let docs = await db.documentsStore.getAll(db.data);
          if ('docs' in docs) {
            docs = docs.docs as typeof docs;
          }

          for (const doc of Object.values(docs)) {
            await insertInOramaDB(dbClone, doc)
          }

          return dbClone
        })
    ),
    [],
  );
  const resultsPromise = useMemo(() =>
    db.then((db) => searchWithHighlight(db, {
      term: searchTerm,
      properties: ['h1', 'content'],
      boost: { h1: 2, content: 1 },
    })),
    [searchTerm],
  );

  const [results, setResults] = useState<Awaited<typeof resultsPromise>>();

  useEffect(() => {
    setLoading(true);

    resultsPromise
      .then(setResults)
      .finally(() => setLoading(false));
  }, [resultsPromise]);

  useEffect(() => {
    console.log(results);
  }, [results]);

  // Open the menu when the user presses the '/' key
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault()
        inputRef.current?.focus()
      }

      if (event.key === 'Escape') {
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!(event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      return;
    }

    const items = listRef.current?.querySelectorAll('[cmdk-item]') ?? []
    const currentIndex = Array.from(items)
      .findIndex((item) => item.getAttribute('data-selected') === 'true')

    if (currentIndex === -1) {
      return;
    }

    const newIndex = event.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1

    if (newIndex === 0) {
      listRef.current?.scrollTo(0, 0)
    } else if (newIndex === items.length - 1) {
      listRef.current?.scrollTo(0, listRef.current.scrollHeight)
    }
  }, []);

  return (
    <>
      <Command
        shouldFilter={false}
        onKeyDown={onKeyDown}
      >
        <Command.Input
          placeholder="Search"
          value={searchTerm}
          onValueChange={setSearchTerm}
          ref={inputRef}
        />

        <Command.List ref={listRef}>
          {loading && <Command.Loading>Hang on…</Command.Loading>}

          <Command.Empty>No results found.</Command.Empty>

          {results?.hits?.map((result) => (
            <Command.Item
              key={result.id}
              onSelect={() => {
                location.href = result.document.path as string;
                inputRef.current?.blur();
                setSearchTerm("");
              }}
            >
              {result.document.h1 as string}
              <div className='content'>
                <HighlightedDocument hit={result} />
              </div>
            </Command.Item>
          ))}
        </Command.List>

        {children}
      </Command>
    </>
  )
}
