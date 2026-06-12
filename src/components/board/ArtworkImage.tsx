import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { getArtworkUri } from '../../utils/spriteUriCache';

export default function ArtworkImage({ dex, style }: { dex: number; style: StyleProp<ImageStyle> }) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getArtworkUri(dex)
      .then(u => { if (!cancelled) setUri(u); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [dex]);

  if (!uri) return null;
  return <Image source={{ uri }} style={style} resizeMode="contain" />;
}
