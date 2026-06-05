import type { Metadata } from "next";

export const metadata: Metadata = {
  // Not sold through the website anymore. Kept reachable by direct link only
  // (Thienvu sends Stripe links directly), but excluded from search indexing
  // and the sitemap. See docs/stripe-slack-integration.md.
  robots: { index: false, follow: false },
  alternates: { canonical: "/mentorship/enroll" },
  title: "Enroll | Vo Creators Mentorship",
  description:
    "Your personalized UGC success roadmap. Pay in full for $4,500 or 2 monthly payments of $2,500. Learn to go viral on brand campaigns through systems and organization.",
  openGraph: {
    title: "Enroll | Vo Creators Mentorship",
    description:
      "Your personalized UGC success roadmap. Pay in full for $4,500 or 2 monthly payments of $2,500.",
    type: "website",
  },
};

export default function EnrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
