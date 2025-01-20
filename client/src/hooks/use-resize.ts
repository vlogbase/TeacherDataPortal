import { useEffect, useState } from 'react';

type DimensionObject = {
  width: number;
  height: number;
};

export function useResizeObserver(element: HTMLElement | null): DimensionObject | undefined {
  const [dimensions, setDimensions] = useState<DimensionObject>();

  useEffect(() => {
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) return;

      // We only observe one element, so we can use entries[0]
      if (!entries.length) return;

      const entry = entries[0];

      // Use border box size if available, falling back to content box size
      const boxSize = entry.borderBoxSize?.[0] ?? entry.contentBoxSize?.[0];

      if (boxSize) {
        setDimensions({
          width: boxSize.inlineSize,
          height: boxSize.blockSize,
        });
      } else {
        // Fallback to getBoundingClientRect() if boxSize is not available
        const { width, height } = element.getBoundingClientRect();
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [element]);

  return dimensions;
}
