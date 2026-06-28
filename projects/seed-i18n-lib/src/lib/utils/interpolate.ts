export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, paramKey: string) => {
    const value = params[paramKey];
    return value === undefined ? `{{${paramKey}}}` : String(value);
  });
}
