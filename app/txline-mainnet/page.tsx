import { TxlineMainnetOnboarding } from "@/components/txline-devnet-onboarding"
import { notFound } from "next/navigation"

export default function TxlineMainnetPage() {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }
  return <TxlineMainnetOnboarding />
}
