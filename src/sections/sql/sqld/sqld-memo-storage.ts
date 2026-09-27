import { get, set, createStore } from 'idb-keyval';

const memoStore = createStore('sqld-practice-memos', 'problem-memos');
const pendingWrites = new Map<string, Promise<void>>();

export async function getSqldMemo(problemKey: string): Promise<string> {
  await pendingWrites.get(problemKey)?.catch(() => {});
  return (await get<string>(problemKey, memoStore)) ?? '';
}

export async function saveSqldMemo(problemKey: string, content: string): Promise<void> {
  const previous = pendingWrites.get(problemKey) ?? Promise.resolve();
  const write = previous.catch(() => {}).then(() => set(problemKey, content, memoStore));
  pendingWrites.set(problemKey, write);

  try {
    await write;
  } finally {
    if (pendingWrites.get(problemKey) === write) pendingWrites.delete(problemKey);
  }
}
