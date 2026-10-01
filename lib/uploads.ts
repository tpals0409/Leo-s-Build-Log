import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? 'uploads');
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
export const MAX_MULTIPART_OVERHEAD = 64 * 1024;
export const MAX_UPLOAD_REQUEST_SIZE = MAX_UPLOAD_SIZE + MAX_MULTIPART_OVERHEAD;
export const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
};

export function validUploadContentLength(value: string | null): boolean {
  if (value === null || !/^\d+$/.test(value)) return false;
  const length = BigInt(value);
  return length > 0n && length <= BigInt(MAX_UPLOAD_REQUEST_SIZE);
}

export function uploadExtension(name: string, type: string, size: number): string | null {
  const ext = path.extname(name).toLowerCase();
  if (size < 1 || size > MAX_UPLOAD_SIZE || MIME[ext] !== type) return null;
  return ext === '.jpeg' ? '.jpg' : ext;
}

function hasImageSignature(data: Buffer, ext: string): boolean {
  switch (ext) {
    case '.jpg':
      return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
    case '.png':
      return data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case '.gif':
      return data.length >= 6 && (data.subarray(0, 6).toString('ascii') === 'GIF87a' || data.subarray(0, 6).toString('ascii') === 'GIF89a');
    case '.webp':
      return data.length >= 12 && data.subarray(0, 4).toString('ascii') === 'RIFF' && data.subarray(8, 12).toString('ascii') === 'WEBP';
    case '.avif': {
      if (data.length < 16 || data.subarray(4, 8).toString('ascii') !== 'ftyp') return false;
      const boxSize = data.readUInt32BE(0);
      if (boxSize < 16 || boxSize > data.length) return false;
      for (let offset = 8; offset + 4 <= boxSize; offset += offset === 8 ? 8 : 4) {
        const brand = data.subarray(offset, offset + 4).toString('ascii');
        if (brand === 'avif' || brand === 'avis') return true;
      }
      return false;
    }
    default:
      return false;
  }
}

export async function saveUpload(
  file: File,
  dir = UPLOAD_DIR,
  makeId: () => string = randomUUID,
): Promise<{ name: string; url: string }> {
  const ext = uploadExtension(file.name, file.type, file.size);
  if (!ext) throw new Error('invalid image');
  const data = Buffer.from(await file.arrayBuffer());
  if (!hasImageSignature(data, ext)) throw new Error('invalid image signature');
  const name = `${makeId()}${ext}`;
  if (!safeUploadName(name)) throw new Error('invalid generated filename');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), data, { flag: 'wx', mode: 0o600 });
  return { name, url: `/uploads/${name}` };
}

export function safeUploadName(name: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp|gif|avif)$/.test(name);
}

export async function readUpload(name: string, dir = UPLOAD_DIR): Promise<{ data: Buffer; type: string }> {
  if (!safeUploadName(name)) throw new Error('invalid upload filename');
  const ext = path.extname(name).toLowerCase();
  return { data: await readFile(path.join(/*turbopackIgnore: true*/ dir, name)), type: MIME[ext] };
}
