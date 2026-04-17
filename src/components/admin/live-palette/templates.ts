import {
  AlignLeft,
  LayoutPanelTop,
  MessageCircle,
  MousePointerClick,
  Sparkles,
  Type,
} from "lucide-react";

export const STRUCTURE_TEMPLATES = [
  {
    id: "constructor",
    title: "\u041f\u0443\u0441\u0442\u043e\u0439 \u0431\u043b\u043e\u043a",
    icon: LayoutPanelTop,
    kind: "constructor",
    isElement: false,
  },
];

export const ELEMENT_TEMPLATES = [
  {
    id: "badge",
    title: "\u041f\u043b\u0430\u0448\u043a\u0430",
    icon: Sparkles,
    kind: "badge",
    isElement: true,
    content: "\u041d\u043e\u0432\u0430\u044f \u043f\u043b\u0430\u0448\u043a\u0430",
    colSpan: 24,
  },
  {
    id: "heading",
    title: "\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a",
    icon: Type,
    kind: "heading",
    isElement: true,
    content: "\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a",
    colSpan: 24,
  },
  {
    id: "paragraph",
    title: "\u0422\u0435\u043a\u0441\u0442",
    icon: AlignLeft,
    kind: "paragraph",
    isElement: true,
    content: "\u041e\u0431\u044b\u0447\u043d\u044b\u0439 \u0442\u0435\u043a\u0441\u0442",
    colSpan: 24,
  },
  {
    id: "button",
    title: "\u041a\u043d\u043e\u043f\u043a\u0430",
    icon: MousePointerClick,
    kind: "button",
    isElement: true,
    content: "\u041a\u043d\u043e\u043f\u043a\u0430",
    target: "booking",
    colSpan: 8,
  },
  {
    id: "socials",
    title: "\u041e\u0431\u043b\u0430\u043a\u043e \u0441\u043e\u0446\u0441\u0435\u0442\u0435\u0439",
    icon: MessageCircle,
    kind: "socials",
    isElement: true,
    content:
      "\u0421\u0432\u044f\u0436\u0438\u0442\u0435\u0441\u044c \u0441 \u043d\u0430\u043c\u0438",
    colSpan: 24,
  },
];

export type PaletteTemplate =
  | (typeof STRUCTURE_TEMPLATES)[number]
  | (typeof ELEMENT_TEMPLATES)[number];
