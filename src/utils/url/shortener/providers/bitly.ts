export async function shortenWithBitly(url: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    console.error('Bitly: No API key');
    return url;
  }
  try {
    const res = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ long_url: url }),
    });
    if (!res.ok) return url;
    const data = await res.json();
    return data.link ?? url;
  } catch (e) {
    console.error('bitly error', e);
    return url;
  }
}
