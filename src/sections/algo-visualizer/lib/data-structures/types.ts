export type DataStructureId =
  | 'array'
  | 'linkedList'
  | 'stack'
  | 'queue'
  | 'deque'
  | 'priorityQueue'
  | 'set'
  | 'map'
  | 'hashTable'
  | 'tree'
  | 'bst'
  | 'heap'
  | 'trie'
  | 'disjointSet'
  | 'graph';

export interface DSOperationComplexity {
  name: string;
  timeComplexity: string;
  description: string;
}

export interface DSQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DataStructureDefinition {
  id: DataStructureId;
  name: string;
  englishName: string;
  icon: string;
  tag: string;
  tagColor: string;
  summary: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  realWorldUses: string[];
  operations: DSOperationComplexity[];
  spaceComplexity: string;
  quiz: DSQuizQuestion[];
}

export interface LinkedListNode {
  id: string;
  value: number;
  nextId: string | null;
  prevId?: string | null;
}

export interface HashEntry {
  key: string;
  value: number | string;
}

export interface HashBucket {
  index: number;
  entries: HashEntry[];
}

export interface GraphNodeData {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdgeData {
  from: string;
  to: string;
  weight?: number;
}
