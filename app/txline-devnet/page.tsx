import { TxlineDevnetOnboarding } from "@/components/txline-devnet-onboarding"
import { notFound } from "next/navigation"

export default function TxlineDevnetPage() {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }
  return <TxlineDevnetOnboarding />
}
