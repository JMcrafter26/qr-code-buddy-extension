export async function shortenWithIsGd(url: string): Promise<string> {
  try {
    const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`, { method: 'POST' });
    if (!res.ok) return url;
    const text = await res.text();
    return text.trim().startsWith('http') ? text.trim() : url;
  } catch (e) {
    console.error('isgd error', e);
    return url;
  }
}
