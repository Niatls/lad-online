import * as React from "react"

import { useCustomPasteContextMenu } from "@/components/ui/use-custom-paste-context-menu"
import { useExtensionOverlaySuppressor } from "@/components/ui/use-extension-overlay-suppressor"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ autoComplete, className, onContextMenu, spellCheck, type, ...props }, ref) => {
    const { handleContextMenu, menu } = useCustomPasteContextMenu()
    const { handleBlur, handleFocus } = useExtensionOverlaySuppressor()

    return (
      <>
        <input
          ref={ref}
          type={type}
          data-slot="input"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          data-gramm="false"
          data-gramm_editor="false"
          data-lt-active="false"
          data-lpignore="true"
          data-translation-ignore="true"
          data-translation-proxy="none"
          autoComplete={autoComplete ?? (type === "password" ? "current-password" : "off")}
          lang="zxx"
          onBlur={handleBlur}
          onFocus={handleFocus}
          spellCheck={spellCheck ?? false}
          translate="no"
          className={cn(
            "notranslate",
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          onContextMenu={(event) => {
            onContextMenu?.(event)
            if (!event.defaultPrevented) {
              handleContextMenu(event)
            }
          }}
          {...props}
        />
        {menu}
      </>
    )
  }
)

Input.displayName = "Input"

export { Input }
