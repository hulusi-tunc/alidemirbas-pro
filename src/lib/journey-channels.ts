import type { ChannelId } from "@/canonical/types";

/* Channel display vocabulary for the Journey Library.

   The values themselves are canonical (`ChannelId` in src/canonical/types.ts)
   and come from the retired CRM Journey Archive, which carried them on its
   own 90 journeys. This module only holds how they are written on screen -
   the same split the Goal vocabulary uses, so a label change never means
   touching canonical data.

   Order is fixed and is the archive's own frequency order (email was on 89 of
   its 90 journeys, whatsapp on 8), so a card's channel list reads the same
   way every time rather than in whatever order a journey happens to declare
   them. */

export const CHANNELS: readonly ChannelId[] = [
  "email",
  "push",
  "sms",
  "in-app",
  "whatsapp",
  "sales",
  "task",
];

const ORDER = new Map<ChannelId, number>(CHANNELS.map((c, i) => [c, i]));

export const CHANNEL_LABEL: Record<ChannelId, { en: string; tr: string }> = {
  email: { en: "Email", tr: "E-posta" },
  push: { en: "Push", tr: "Push" },
  sms: { en: "SMS", tr: "SMS" },
  "in-app": { en: "In-app", tr: "Uygulama içi" },
  whatsapp: { en: "WhatsApp", tr: "WhatsApp" },
  sales: { en: "Sales", tr: "Satış" },
  task: { en: "Task", tr: "Görev" },
};

/** Canonical display order, so two journeys declaring the same channels in a
    different order still render identically. */
export function sortChannels(channels: readonly ChannelId[]): ChannelId[] {
  return [...channels].sort((a, b) => (ORDER.get(a) ?? 99) - (ORDER.get(b) ?? 99));
}

/* `sales` and `task` are how a person is reached, not a surface a message is
   delivered on. A card listing the journey's whole channel set is right - it
   is what the journey may use - but a Message node claiming it sends "on
   Task" is not, and a Human node claiming it sends "on SMS" is not either.
   Splitting them here keeps one canonical list on the journey and lets each
   node name only the part that applies to it. */
const HUMAN_ROUTES: ReadonlySet<ChannelId> = new Set(["sales", "task"]);

export const isHumanRoute = (c: ChannelId): boolean => HUMAN_ROUTES.has(c);

/** Message-delivery surfaces only - what a communication action can run on. */
export function messageChannels(channels: readonly ChannelId[]): ChannelId[] {
  return sortChannels(channels.filter((c) => !HUMAN_ROUTES.has(c)));
}

/** Human routes only - what a human action can be picked up through. */
export function humanChannels(channels: readonly ChannelId[]): ChannelId[] {
  return sortChannels(channels.filter((c) => HUMAN_ROUTES.has(c)));
}
