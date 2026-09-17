"use client";

import React, { createContext, useContext, useState } from "react";

interface AssetLoaderContextType {
  isLoaderFinished: boolean;
  markLoaderAsFinished: () => void;
}

const AssetLoaderContext = createContext<AssetLoaderContextType>({
  isLoaderFinished: false,
  markLoaderAsFinished: () => {},
});

export function AssetLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaderFinished, setIsLoaderFinished] = useState<boolean>(false);

  const markLoaderAsFinished = () => {
    setIsLoaderFinished(true);
  };

  return (
    <AssetLoaderContext.Provider
      value={{ isLoaderFinished, markLoaderAsFinished }}
    >
      {children}
    </AssetLoaderContext.Provider>
  );
}

export function useAssetLoader() {
  return useContext(AssetLoaderContext);
}
