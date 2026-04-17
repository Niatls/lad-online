import { closestCorners } from "@dnd-kit/core";

export function liveEditorCollisionDetection(args: any) {
  const activeData = args.active.data.current;
  const isElement =
    activeData?.type === "PageElement" ||
    (args.active.id.toString().startsWith("palette-") &&
      activeData?.template?.isElement);

  if (isElement) {
    const elementContainers = args.droppableContainers.filter(
      (container: any) =>
        container.data.current?.type === "PageElement" ||
        container.data.current?.type === "ConstructorSection"
    );

    return closestCorners({
      ...args,
      droppableContainers: elementContainers,
    });
  }

  const sectionContainers = args.droppableContainers.filter(
    (container: any) =>
      container.data.current?.type === "SortableSection" &&
      !container.id.toString().startsWith("palette-")
  );

  return closestCorners({
    ...args,
    droppableContainers: sectionContainers,
  });
}
