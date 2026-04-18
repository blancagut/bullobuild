import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BrandRedirectPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/shop/${slug}`);
}
