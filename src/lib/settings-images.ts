// Shared resolver for CMS-managed images stored in src/assets/settings/.
// Mirrors the events cover pattern: each Astro section calls
// resolveSettingsImage(path) to turn a Keystatic-stored path
// (e.g. "/src/assets/settings/logo.svg") into an ImageMetadata
// suitable for <Image> or getImage().

const settingsImageModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/settings/**/*.{jpg,jpeg,png,webp,avif,gif,svg}',
);

export async function resolveSettingsImage(
  path: string | null | undefined,
): Promise<ImageMetadata | null> {
  if (!path) return null;
  const mod = settingsImageModules[path];
  if (!mod) return null;
  return (await mod()).default;
}
