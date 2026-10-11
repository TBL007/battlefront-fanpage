import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Object-URL preview for a locally picked file.
 *
 * The URL is created in `select` rather than in an effect, so the preview
 * shows up in the same render as the input event and the previous URL can be
 * revoked immediately instead of one commit later.
 */
export function useFilePreview() {
  const [preview, setPreview] = useState<string>();
  const urlRef = useRef<string | undefined>(undefined);

  // Cleanup only — no state is set here.
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const select = useCallback((file: File | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);

    const url = file ? URL.createObjectURL(file) : undefined;
    urlRef.current = url;
    setPreview(url);
  }, []);

  const clear = useCallback(() => select(null), [select]);

  return { preview, select, clear };
}