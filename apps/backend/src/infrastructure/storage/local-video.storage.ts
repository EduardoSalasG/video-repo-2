import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { IVideoStorage, StorageFile, UploadedFile } from '../../application/ports';

@Injectable()
export class LocalVideoStorage implements IVideoStorage {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = process.env.LOCAL_UPLOAD_DIR ?? 'uploads';
  }

  async upload(file: StorageFile): Promise<UploadedFile> {
    const key = `${randomUUID()}-${file.originalname}`;
    const storageKey = `videos/${key}`;
    const target = path.join(this.baseDir, storageKey);

    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, file.buffer);

    return {
      storageKey,
      filename: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const target = path.join(this.baseDir, storageKey);
    await fs.unlink(target);
  }
}
