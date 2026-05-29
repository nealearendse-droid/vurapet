// FILE: src/app/robots.ts
// This file creates a /robots.txt file for your site.
// robots.txt is like a note to Google saying "here's what you're allowed to look at"
// This one says: scan everything, and here's where the sitemap is.

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*", // applies to ALL search engines (Google, Bing, etc)
      allow: "/",     // allow them to scan everything
    },
    sitemap: "https://vurapet.vercel.app/sitemap.xml",
  };
}