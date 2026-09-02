export async function shortenWithJm26(url: string): Promise<string> {
  try {
    const res = await fetch(`https://jm26.net/l/?format=text&url=${encodeURIComponent(url)}`, { method: 'POST' });
    if (!res.ok) return url;
    const text = await res.text();
    return text.trim().startsWith('http') ? text.trim() : url;
  } catch (e) {
    console.error('jm26 error', e);
    return url;
  }
}
