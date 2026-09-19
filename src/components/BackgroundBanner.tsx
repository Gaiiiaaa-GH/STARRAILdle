import React, { useMemo } from 'react';
import manifest from '../data/bannerManifest.json';

// One random official character banner per page load, as a full-viewport
// backdrop. `.app-backdrop-overlay` (styled in index.css) is responsible for
// keeping content legible regardless of which of the ~79 busy banners lands.
export const BackgroundBanner: React.FC = () => {
  const bannerId = useMemo(() => {
    const ids = manifest as string[];
    return ids[Math.floor(Math.random() * ids.length)];
  }, []);

  return (
    <div className="app-backdrop" aria-hidden="true">
      <img src={`/assets/banners/${bannerId}.webp`} alt="" className="app-backdrop-img" />
      <div className="app-backdrop-overlay" />
    </div>
  );
};
