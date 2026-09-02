export async function shortenWithTinyUrl(url: string): Promise<string> {
  try {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    if (!res.ok) return url;
    const text = await res.text();
    return text.trim().startsWith('http') ? text.trim() : url;
  } catch (e) {
    console.error('tinyurl error', e);
    return url;
  }
}
