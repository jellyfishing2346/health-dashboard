import useSWR, { mutate } from 'swr';

export const fetcher = (url: string) => fetch(url).then(async (r) => {
  const json = await r.json();
  if (!r.ok) throw new Error(json?.error || 'Request failed');
  return json?.data ?? json;
});

export function usePhysical() {
  const { data, error, isLoading } = useSWR('/api/physical', fetcher);
  return { data: (data || []) as any[], error, isLoading };
}

export function useMental() {
  const { data, error, isLoading } = useSWR('/api/mental', fetcher);
  return { data: (data || []) as any[], error, isLoading };
}

export function useGoals() {
  const { data, error, isLoading } = useSWR('/api/goals', fetcher);
  return { data: (data || []) as any[], error, isLoading };
}

export function useProfile() {
  const { data, error, isLoading } = useSWR('/api/profile', fetcher);
  return { data, error, isLoading };
}

export async function optimisticPost<T>(url: string, payload: any, key: string, updater: (prev: T[]) => T[]) {
  // Optimistic update
  await mutate(key, (prev: any) => updater(prev || []), { revalidate: false });
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    await mutate(key); // revalidate
    return json.data;
  } catch (err) {
    await mutate(key); // rollback by revalidating
    throw err;
  }
}

export async function optimisticPut<T>(url: string, payload: any, key: string, updater: (prev: T[]) => T[]) {
  await mutate(key, (prev: any) => updater(prev || []), { revalidate: false });
  try {
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    await mutate(key);
    return json.data;
  } catch (err) {
    await mutate(key);
    throw err;
  }
}

export async function optimisticDelete<T>(url: string, key: string, updater: (prev: T[]) => T[]) {
  await mutate(key, (prev: any) => updater(prev || []), { revalidate: false });
  try {
    const res = await fetch(url, { method: 'DELETE' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || 'Failed');
    await mutate(key);
  } catch (err) {
    await mutate(key);
    throw err;
  }
}
