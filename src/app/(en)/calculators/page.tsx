import { CalculatorIndexPage, calculatorIndexMetadata } from "@/components/CalculatorRoutes";

export const metadata = calculatorIndexMetadata("en");

export default function CalculatorsPage() {
  return <CalculatorIndexPage lang="en" />;
}
