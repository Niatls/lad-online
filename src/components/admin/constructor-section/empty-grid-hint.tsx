import { LayoutPanelTop } from "lucide-react";

import { GRID_COLS, GRID_EMPTY_HINT } from "./constants";

export function EmptyGridHint() {
  return (
    <div className="text-center" style={{ gridColumn: `1 / span ${GRID_COLS}` }}>
      <LayoutPanelTop className="mx-auto mb-2 h-8 w-8 text-sage/30" />
      <p className="text-sm font-medium text-forest/30">{GRID_EMPTY_HINT}</p>
    </div>
  );
}
