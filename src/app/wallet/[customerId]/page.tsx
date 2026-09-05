import { redirect } from "next/navigation"

export default async function WalletCustomerRedirectPage({
  params,
}: {
  params: Promise<{ customerId: string }>
}) {
  const { customerId } = await params
  if (customerId) {
    redirect(`/q/wallet/${customerId}`)
  }
  redirect("/")
}
