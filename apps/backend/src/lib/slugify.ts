import slugifyLib from 'slugify';

export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function uniqueSlug(text: string, suffix?: string): string {
  const base = slugify(text);
  return suffix ? `${base}-${suffix}` : base;
}
