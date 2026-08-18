'use client';

import type {
  SqlDataset,
  SqlProblem,
  QueryResult,
  QueryHistoryItem,
  VerificationResult,
} from './types';

import alasql from 'alasql';
import { useRef, useState, useEffect, useCallback } from 'react';

import { SAMPLE_DATASETS } from './sample-datasets';

const STORAGE_KEY_SOLVED = 'ultra_sql_solved_problems';
const STORAGE_KEY_HISTORY = 'ultra_sql_query_history';

// ----------------------------------------------------------------------

export function useSqlEngine() {
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('ecommerce');
  const [datasets] = useState<SqlDataset[]>(SAMPLE_DATASETS);
  const [isDbReady, setIsDbReady] = useState(false);
  const [solvedProblemIds, setSolvedProblemIds] = useState<string[]>([]);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  // Separate database instances by dataset id in alasql
  const initializedDatasets = useRef<Set<string>>(new Set());

  // Load localStorage data safely after mounting
  useEffect(() => {
    try {
      const savedSolved = localStorage.getItem(STORAGE_KEY_SOLVED);
      if (savedSolved) {
        setSolvedProblemIds(JSON.parse(savedSolved));
      }
      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        setQueryHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load SQL practice storage', e);
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  // Save solved problems to storage when changed
  useEffect(() => {
    if (hasLoadedStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_SOLVED, JSON.stringify(solvedProblemIds));
      } catch (e) {
        console.error('Failed to save solved problems', e);
      }
    }
  }, [solvedProblemIds, hasLoadedStorage]);

  // Save query history to storage when changed
  useEffect(() => {
    if (hasLoadedStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(queryHistory.slice(0, 50)));
      } catch (e) {
        console.error('Failed to save query history', e);
      }
    }
  }, [queryHistory, hasLoadedStorage]);

  // Initialize or reset database tables for a specific dataset
  const initDatasetDb = useCallback((datasetId: string, forceReset = false) => {
    const dataset = SAMPLE_DATASETS.find((d) => d.id === datasetId);
    if (!dataset) return;

    if (!forceReset && initializedDatasets.current.has(datasetId)) {
      return;
    }

    try {
      // Create separate database if not exists and switch context
      alasql(`CREATE DATABASE IF NOT EXISTS db_${datasetId}`);
      alasql(`USE db_${datasetId}`);

      // Drop existing tables and recreate
      dataset.tables.forEach((table) => {
        try {
          alasql(`DROP TABLE IF EXISTS ${table.name}`);
        } catch {
          // ignore drop errors
        }
        alasql(table.ddl);
        if (table.initialData.length > 0) {
          // Insert initial data records
          const columns = Object.keys(table.initialData[0]).join(', ');
          table.initialData.forEach((row) => {
            const values = Object.values(row)
              .map((val) => {
                if (val === null || val === undefined) return 'NULL';
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                return val;
              })
              .join(', ');
            alasql(`INSERT INTO ${table.name} (${columns}) VALUES (${values})`);
          });
        }
      });

      initializedDatasets.current.add(datasetId);
    } catch (err) {
      console.error(`Failed to init database for ${datasetId}`, err);
    }
  }, []);

  // Initialize DB on dataset change
  useEffect(() => {
    initDatasetDb(currentDatasetId);
    setIsDbReady(true);
  }, [currentDatasetId, initDatasetDb]);

  // Reset current dataset to original state
  const resetCurrentDb = useCallback(() => {
    initDatasetDb(currentDatasetId, true);
  }, [currentDatasetId, initDatasetDb]);

  // Execute an arbitrary SQL query on current dataset
  const runQuery = useCallback(
    (sqlQuery: string, targetDatasetId = currentDatasetId): QueryResult => {
      const startTime = performance.now();
      const trimmedQuery = sqlQuery.trim();

      if (!trimmedQuery) {
        return {
          columns: [],
          rows: [],
          executionTimeMs: 0,
          rowCount: 0,
          error: 'SQL 쿼리가 비어있습니다. 실행할 쿼리를 작성해 주세요.',
        };
      }

      try {
        initDatasetDb(targetDatasetId);
        alasql(`USE db_${targetDatasetId}`);

        // Handle single or multi queries
        const rawResult: unknown = alasql(trimmedQuery);
        const endTime = performance.now();
        const executionTimeMs = Math.round((endTime - startTime) * 10) / 10;

        let rows: Record<string, unknown>[] = [];
        let columns: string[] = [];

        if (Array.isArray(rawResult)) {
          // If multi statements, get the last statement's result
          const lastItem =
            rawResult.length > 0 && Array.isArray(rawResult[0])
              ? (rawResult[rawResult.length - 1] as unknown[])
              : rawResult;

          if (
            Array.isArray(lastItem) &&
            lastItem.length > 0 &&
            typeof lastItem[0] === 'object' &&
            lastItem[0] !== null
          ) {
            rows = lastItem as Record<string, unknown>[];
            columns = Object.keys(rows[0]);
          } else if (Array.isArray(lastItem)) {
            rows = (lastItem as unknown[]).map((val, idx) => ({ [`col_${idx + 1}`]: val }));
            columns = rows.length > 0 ? Object.keys(rows[0]) : [];
          } else if (typeof lastItem === 'number' || typeof lastItem === 'string') {
            rows = [{ result: lastItem }];
            columns = ['result'];
          }
        } else if (typeof rawResult === 'number') {
          rows = [{ affected_rows: rawResult }];
          columns = ['affected_rows'];
        }

        // Add to query history
        const newHistoryItem: QueryHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          query: trimmedQuery,
          datasetId: targetDatasetId,
          timestamp: Date.now(),
          success: true,
          rowCount: rows.length,
          executionTimeMs,
        };
        setQueryHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);

        return {
          columns,
          rows,
          executionTimeMs,
          rowCount: rows.length,
          rawResult,
        };
      } catch (err: unknown) {
        const endTime = performance.now();
        const executionTimeMs = Math.round((endTime - startTime) * 10) / 10;
        const errorMessage = err instanceof Error ? err.message : String(err);

        // Add error to query history
        const newHistoryItem: QueryHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          query: trimmedQuery,
          datasetId: targetDatasetId,
          timestamp: Date.now(),
          success: false,
          executionTimeMs,
        };
        setQueryHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);

        return {
          columns: [],
          rows: [],
          executionTimeMs,
          rowCount: 0,
          error: errorMessage,
        };
      }
    },
    [currentDatasetId, initDatasetDb]
  );

  // Normalize cell value for comparison
  const normalizeValue = (val: unknown): string => {
    if (val === null || val === undefined) return '__NULL__';
    if (typeof val === 'number') {
      // Rounded float check to avoid minor float precision diffs
      return Number(val.toFixed(4)).toString();
    }
    return String(val).trim().toLowerCase();
  };

  // Verify user's solution against expected solution query
  const verifySolution = useCallback(
    (userSql: string, problem: SqlProblem): VerificationResult => {
      const userRes = runQuery(userSql, problem.datasetId);
      if (userRes.error) {
        return {
          isCorrect: false,
          message: `쿼리 실행 중 오류가 발생했습니다: ${userRes.error}`,
          userResult: userRes,
        };
      }

      // Run expected solution query
      const expectedRes = runQuery(problem.solutionQuery, problem.datasetId);
      if (expectedRes.error) {
        return {
          isCorrect: false,
          message: `시스템 정답 쿼리 실행 실패: ${expectedRes.error}`,
          userResult: userRes,
          expectedResult: expectedRes,
        };
      }

      // Compare column counts
      if (userRes.columns.length !== expectedRes.columns.length) {
        return {
          isCorrect: false,
          message: `반환된 컬럼 개수가 다릅니다. (작성: ${userRes.columns.length}개, 기대: ${expectedRes.columns.length}개)`,
          userResult: userRes,
          expectedResult: expectedRes,
          diffSummary: `작성 컬럼: [${userRes.columns.join(', ')}]\n기대 컬럼: [${expectedRes.columns.join(', ')}]`,
        };
      }

      // Compare row counts
      if (userRes.rowCount !== expectedRes.rowCount) {
        return {
          isCorrect: false,
          message: `반환된 행(Row) 개수가 일치하지 않습니다. (작성: ${userRes.rowCount}행, 기대: ${expectedRes.rowCount}행)`,
          userResult: userRes,
          expectedResult: expectedRes,
          diffSummary: `작성한 쿼리는 ${userRes.rowCount}개의 행을 반환했지만, 정답은 ${expectedRes.rowCount}개의 행이어야 합니다. WHERE 조건절이나 JOIN 방식을 다시 확인해 보세요.`,
        };
      }

      // Compare contents of each row
      for (let r = 0; r < userRes.rowCount; r++) {
        const userRow = userRes.rows[r];
        const expectedRow = expectedRes.rows[r];
        const userVals = Object.values(userRow).map(normalizeValue);
        const expectedVals = Object.values(expectedRow).map(normalizeValue);

        // Check if values in row match (considering column order or values match)
        const rowMatches = userVals.every((uVal, cIdx) => uVal === expectedVals[cIdx]);
        if (!rowMatches) {
          return {
            isCorrect: false,
            message: `${r + 1}번째 행의 데이터 값이 정답과 일치하지 않습니다.`,
            userResult: userRes,
            expectedResult: expectedRes,
            diffSummary: `${r + 1}번째 행:\n- 작성 결과: ${JSON.stringify(userRow)}\n- 기대 결과: ${JSON.stringify(expectedRow)}`,
          };
        }
      }

      // Mark problem as solved if not already
      if (!solvedProblemIds.includes(problem.id)) {
        setSolvedProblemIds((prev) => [...prev, problem.id]);
      }

      return {
        isCorrect: true,
        message: '🎉 정답입니다! 모든 조건과 결과 데이터가 완벽하게 일치합니다.',
        userResult: userRes,
        expectedResult: expectedRes,
      };
    },
    [runQuery, solvedProblemIds]
  );

  const currentDataset = datasets.find((d) => d.id === currentDatasetId) || datasets[0];

  return {
    datasets,
    currentDatasetId,
    setCurrentDatasetId,
    currentDataset,
    isDbReady,
    runQuery,
    verifySolution,
    resetCurrentDb,
    solvedProblemIds,
    queryHistory,
    setQueryHistory,
  };
}
