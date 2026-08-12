"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

const CAL_LINK = "ali-demirbas/30min";

/* Inline Cal.com booking calendar. calLink is the public slug from
   https://cal.com/ali-demirbas/30min - not a secret, unlike the API key
   this page's data never touches (this embed needs none). Brand color
   matches this site's --color-blue-600 (#154ce4) so the calendar reads as
   part of the page rather than a foreign iframe. */
export function CalEmbed() {
  useEffect(() => {
    (async function run() {
      const cal = await getCalApi({ namespace: "30min" });
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#154ce4" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <Cal
      namespace="30min"
      calLink={CAL_LINK}
      style={{ width: "100%", height: "100%", minHeight: "600px", overflow: "scroll" }}
      config={{ layout: "month_view" }}
    />
  );
}
