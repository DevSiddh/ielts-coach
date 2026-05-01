import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IELTS Coach",
    short_name: "IELTS Coach",
    description: "Single-user IELTS speaking, writing, vocabulary, strategy, and progress trainer.",
    id: "/speaking",
    start_url: "/speaking",
    scope: "/",
    display: "standalone",
    background_color: "#05070d",
    theme_color: "#05070d",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
