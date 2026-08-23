import { AbLibraryIndexPage, abLibraryIndexMetadata } from "@/components/AbTestRoutes";

export const metadata = abLibraryIndexMetadata("en");

export default function Page() {
  return <AbLibraryIndexPage lang="en" />;
}
