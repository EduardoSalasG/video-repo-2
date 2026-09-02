import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { IVideoStorage, StorageFile, UploadedFile } from '../../application/ports';

function safeExtension(originalName: string): string {
  const ext = path.extname(path.basename(originalName)).toLowerCase();
  if (!ext) return '.mp4';
  return ext;
}

@Injectable()
export class LocalVideoStorage implements IVideoStorage {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = process.env.VIDEO_STORAGE_LOCAL_PATH ?? 'uploads';
  }

  async upload(file: StorageFile): Promise<UploadedFile> {
    const key = `${randomUUID()}${safeExtension(file.originalname)}`;
    const storageKey = `videos/${key}`;
    const target = path.join(this.baseDir, storageKey);

    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, file.buffer);

    return {
      storageKey,
      filename: path.basename(file.originalname),
      mimeType: file.mimetype,
      fileSize: file.size,
    };
  }

  async getUrl(storageKey: string): Promise<string> {
    return `/uploads/${storageKey}`;
  }

  async delete(storageKey: string): Promise<void> {
    const target = path.join(this.baseDir, storageKey);
    await fs.unlink(target);
  }
}
