import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enroll — Vo Creators Mentorship",
  description:
    "Become a paid UGC creator in 60 days. The VoC Method bootcamp with live coaching from Thienvu Vo. Enroll now — pay in full or flexible payment plan.",
  openGraph: {
    title: "Enroll — Vo Creators Mentorship",
    description:
      "Become a paid UGC creator in 60 days. Live coaching, agency campaign access, private creator community.",
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
