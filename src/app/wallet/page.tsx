import { redirect } from "next/navigation"

export default async function WalletRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const customerId = (typeof params.c === "string" ? params.c : undefined) 
    || (typeof params.customerId === "string" ? params.customerId : undefined)

  if (customerId) {
    redirect(`/q/wallet/${customerId}`)
  }

  redirect("/")
}
