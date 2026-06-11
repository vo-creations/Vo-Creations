CREATE TABLE "creator_aliases" (
	"source" text DEFAULT 'sideshift' NOT NULL,
	"alias_external_id" text NOT NULL,
	"canonical_creator_id" uuid NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creator_aliases_source_alias_external_id_pk" PRIMARY KEY("source","alias_external_id")
);
--> statement-breakpoint
ALTER TABLE "creator_aliases" ADD CONSTRAINT "creator_aliases_canonical_creator_id_creators_id_fk" FOREIGN KEY ("canonical_creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_aliases_canonical" ON "creator_aliases" USING btree ("canonical_creator_id");