export function getStringValue(
  components: Array<{
    components?: Array<{ custom_id?: string; value?: string }>;
  }>,
  customId: string
) {
  for (const row of components) {
    for (const component of row.components ?? []) {
      if (component.custom_id === customId) {
        return component.value?.trim() ?? "";
      }
    }
  }

  return "";
}
