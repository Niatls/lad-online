import * as React from "react"

import { useCustomPasteContextMenu } from "@/components/ui/use-custom-paste-context-menu"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, onContextMenu, spellCheck, ...props }, ref) => {
  const { handleContextMenu, menu } = useCustomPasteContextMenu()

  return (
    <>
      <textarea
        ref={ref}
        data-slot="textarea"
        data-1p-ignore="true"
        data-bwignore="true"
        data-form-type="other"
        data-gramm="false"
        data-gramm_editor="false"
        data-lt-active="false"
        data-lpignore="true"
        data-translation-ignore="true"
        data-translation-proxy="none"
        autoComplete="off"
        lang="zxx"
        spellCheck={spellCheck ?? false}
        translate="no"
        className={cn(
          "notranslate",
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
})

Textarea.displayName = "Textarea"

export { Textarea }
