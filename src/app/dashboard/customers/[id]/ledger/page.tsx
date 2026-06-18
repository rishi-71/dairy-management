import { getCustomerById } from "@/actions/customerActions";
import { notFound } from "next/navigation";
import LedgerClient from "./LedgerClient";

export const dynamic = 'force-dynamic';

export default async function CustomerLedgerPage({ params }: { params: Promise<{id: string}> }) {
    const { id } = await params;
  
  // Database IDs ab Number hain, toh Number() use karein
  const customer = await getCustomerById(id);
  
  if (!customer) {
    return notFound();
  }

  return <LedgerClient customer={customer} />;
}