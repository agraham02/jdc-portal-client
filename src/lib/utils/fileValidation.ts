export function validateFiles(
  files: File[],
  opts: { maxSizeMB: number; allowedTypes: string[] }
): string[] {
  const errors: string[] = [];
  const maxBytes = opts.maxSizeMB * 1024 * 1024;
  for (const f of files) {
    if (f.size > maxBytes) errors.push(`File ${f.name} exceeds ${opts.maxSizeMB}MB`);
    if (!opts.allowedTypes.includes(f.type)) errors.push(`File ${f.name} type not allowed`);
  }
  return errors;
}

export function validateMultipleFiles(files: File[], maxFiles: number, opts: { maxSizeMB: number; allowedTypes: string[] }) {
  const errors = validateFiles(files, opts);
  if (files.length > maxFiles) {
    errors.push(`Too many files. Max ${maxFiles}.`);
  }
  return errors;
}

export const APPLICATION_FILE_VALIDATION = { maxSizeMB: 10, allowedTypes: ["application/pdf", "image/png", "image/jpeg"] };
export const CONTRACT_FILE_VALIDATION = { maxSizeMB: 10, allowedTypes: ["application/pdf", "image/png", "image/jpeg"] };
