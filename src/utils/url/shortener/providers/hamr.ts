import { hamrEncode } from '../../hamr/encoder';

export async function shortenWithHamr(url: string): Promise<string> {
  try {
    const hamrUrl = hamrEncode(url);
    if (hamrUrl && hamrUrl.length < url.length) return hamrUrl;
    return url;
  } catch (e) {
    console.error('hamr shorten error', e);
    return url;
  }
}
