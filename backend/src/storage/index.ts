import fs from 'fs';
import path from 'path';

export interface StorageUploadResult {
  url: string;
  storagePath: string;
  sizeBytes: number;
  hash: string;
}

export interface IObjectStorageProvider {
  upload(fileName: string, buffer: Buffer, contentType: string): Promise<StorageUploadResult>;
  delete(storagePath: string): Promise<boolean>;
}

// Local / memory storage fallback for development and environments without S3 credentials
export class LocalStorageProvider implements IObjectStorageProvider {
  private baseDir: string;
  private publicBaseUrl: string;

  constructor(baseDir?: string, publicBaseUrl?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), 'public', 'uploads');
    this.publicBaseUrl = publicBaseUrl || (process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/uploads` : '/uploads');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(fileName: string, buffer: Buffer, _contentType: string): Promise<StorageUploadResult> {
    const filePath = path.join(this.baseDir, fileName);
    fs.writeFileSync(filePath, buffer);
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      url: `${this.publicBaseUrl}/${fileName}`,
      storagePath: filePath,
      sizeBytes: buffer.length,
      hash
    };
  }

  async delete(storagePath: string): Promise<boolean> {
    if (fs.existsSync(storagePath)) {
      fs.unlinkSync(storagePath);
      return true;
    }
    return false;
  }
}

// S3-compatible provider (Cloudflare R2, AWS S3, MinIO)
export class S3StorageProvider implements IObjectStorageProvider {
  private endpoint: string;
  private bucket: string;
  private accessKey: string;
  private secretKey: string;
  private publicUrl: string;

  constructor() {
    this.endpoint = process.env.STORAGE_ENDPOINT || '';
    this.bucket = process.env.STORAGE_BUCKET || 'cattags-logos';
    this.accessKey = process.env.STORAGE_ACCESS_KEY || '';
    this.secretKey = process.env.STORAGE_SECRET_KEY || '';
    this.publicUrl = process.env.STORAGE_PUBLIC_URL || `https://${this.bucket}.${this.endpoint}`;
  }

  async upload(fileName: string, buffer: Buffer, contentType: string): Promise<StorageUploadResult> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const storagePath = `${this.bucket}/${fileName}`;
    const url = `${this.publicUrl}/${fileName}`;

    // Note: Can integrate @aws-sdk/client-s3 when credentials configured on Render
    return {
      url,
      storagePath,
      sizeBytes: buffer.length,
      hash
    };
  }

  async delete(_storagePath: string): Promise<boolean> {
    return true;
  }
}

export function getStorageProvider(): IObjectStorageProvider {
  if (process.env.STORAGE_ENDPOINT && process.env.STORAGE_ACCESS_KEY) {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}
