// Safe dynamic loader for AlaSQL in browser environment
// Uses alasql.min.js standalone build to prevent Turbopack/Next.js SSR from importing alasql.fs.js (which requires react-native-fs)

export async function loadAlaSql(): Promise<any> {
  if (typeof window === 'undefined') {
    return null;
  }
  if ((window as any).alasql) {
    return (window as any).alasql;
  }
  try {
    const mod = await import('alasql');
    const instance = (window as any).alasql || mod.default || mod;
    return instance;
  } catch (err) {
    console.error('Failed to load AlaSQL:', err);
    return null;
  }
}
