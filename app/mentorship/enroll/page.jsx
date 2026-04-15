"use client";

const DELIVERABLES = [
  {
    title: "DFY Systems and Templates",
    description:
      "We give you the outreach scripts for every type of UGC, and portfolio templates to scale your UGC income.",
  },
  {
    title: "Brand Deal Network",
    description:
      "Private paid opportunities channel with unlimited applications, private referrals channel with student referrals, + 1,000 Contact Email List.",
  },
  {
    title: "Exclusive Creator Network",
    description:
      "Connections to top UGC creators in the space making +10K/month (Referrals & Community).",
  },
  {
    title: "Campaign Success",
    description:
      "We will teach you how to consistently go viral on campaigns with specific step-by-step docs on warm up, inspo lists, using softwares to track performance.",
  },
];

const COACHING = [
  {
    title: "Course Modules",
    description:
      "6 full in-depth modules on how to land your first brand deal as soon as possible.",
  },
  {
    title: "Weekly Group Coaching",
    description:
      "Get personalized advice to any bottlenecks you're facing with UGC.",
  },
  {
    title: "One on One",
    description:
      "Get one on one calls in every single phase of this program to make sure everything is dialed in.",
  },
  {
    title: "1-1 Check-in Calls",
    description:
      "60 days of weekly 1-1 check-in calls to make sure you're on track to hit your goal.",
  },
];

const BONUSES = [
  {
    title: "Agency Qualification Roadmap",
    description:
      "Systemized process to prepare content and mindset to join guaranteed paid opportunities in the agency.",
  },
  {
    title: "Access to My Network of Experts",
    description:
      "Ask experts whether it's our inhouse creative director (CCO), and systems and organization lead (COO), etc that have a proven track record.",
  },
];

const CALENDLY_URL =
  "https://calendly.com/vocreations/vo-creations-mentorship-discovery-call";

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      style={{ flexShrink: 0, marginTop: 2 }}
    >
      <circle cx="10" cy="10" r="10" fill="#16a34a" opacity="0.12" />
      <path
        d="M6 10.5L8.5 13L14 7"
        stroke="#16a34a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionBadge({ children }) {
  return (
    <div
      style={{
        display: "inline-block",
        padding: "6px 16px",
        borderRadius: 100,
        background: "#0f172a",
        color: "white",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.06em",
        marginBottom: 28,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function ItemCard({ title, description }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "18px 22px",
        borderRadius: 14,
        background: "#fafafa",
        border: "1px solid #e5e7eb",
      }}
    >
      <CheckIcon />
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#1e293b",
            marginBottom: 4,
            lineHeight: 1.4,
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default function EnrollPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fcfcfc",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            V
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: "#1e293b",
              letterSpacing: "-0.02em",
            }}
          >
            Vo Creators
          </span>
        </div>
        <a
          href="/mentorship"
          style={{
            fontSize: 13,
            color: "#64748b",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          &larr; Back to mentorship
        </a>
      </nav>

      {/* Hero */}
      <div
        style={{
          textAlign: "center",
          padding: "60px 24px 50px",
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-space), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(32px, 5vw, 48px)",
            lineHeight: 1.15,
            color: "#0f172a",
            margin: "0 0 16px",
            letterSpacing: "-0.03em",
          }}
        >
          Complete Program
          <br />
          Overview
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "#64748b",
            lineHeight: 1.6,
            maxWidth: 540,
            margin: "0 auto 8px",
          }}
        >
          We will build your personalized UGC success roadmap and teach you how
          to leverage your skills to go viral consistently on campaigns through
          systems and organization.
        </p>
      </div>

      {/* Deliverables */}
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px 48px" }}>
        <SectionBadge>Deliverables</SectionBadge>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DELIVERABLES.map((item, i) => (
            <ItemCard key={i} title={item.title} description={item.description} />
          ))}
        </div>
      </div>

      {/* Coaching Structure */}
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px 48px" }}>
        <SectionBadge>Coaching Structure</SectionBadge>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {COACHING.map((item, i) => (
            <ItemCard key={i} title={item.title} description={item.description} />
          ))}
        </div>
      </div>

      {/* Bonuses */}
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px 48px" }}>
        <SectionBadge>Bonuses</SectionBadge>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {BONUSES.map((item, i) => (
            <ItemCard key={i} title={item.title} description={item.description} />
          ))}
        </div>
      </div>

      {/* Guarantee */}
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px 60px" }}>
        <SectionBadge>Guarantees</SectionBadge>
        <div
          style={{
            padding: "28px 28px",
            borderRadius: 18,
            background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 60%)",
            border: "2px solid #bbf7d0",
          }}
        >
          <p
            style={{
              fontSize: 16,
              color: "#1e293b",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            If you don&apos;t land 3 brand deals within four months, we will
            give you a{" "}
            <strong>FULL REFUND</strong>, send you an{" "}
            <strong>EXTRA $1000</strong>, and continue working with you until
            you land your first deal&nbsp;&mdash;{" "}
            <strong>
              IF you attend coaching calls, watch video modules, etc.
            </strong>
          </p>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          textAlign: "center",
          padding: "0 24px 80px",
          maxWidth: 660,
          margin: "0 auto",
        }}
      >
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "16px 40px",
            borderRadius: 100,
            background: "linear-gradient(135deg, #16a34a, #15803d)",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            textDecoration: "none",
            letterSpacing: "-0.01em",
            transition: "all 0.2s ease",
          }}
        >
          Book a call &rarr;
        </a>
        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            marginTop: 16,
          }}
        >
          Schedule a free discovery call to see if this is the right fit for you.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          &copy; 2026 Vo Creations LLC &middot; vocreations.com
        </p>
      </div>
    </div>
  );
}
