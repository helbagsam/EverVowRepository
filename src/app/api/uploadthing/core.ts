import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { assets } from "@/db/schema";

const f = createUploadthing();

// Dibatasi JPG/PNG saja (sesuai keputusan kamu), ukuran kecil, maksimal
// 1 file per request — sengaja diminimalkan supaya kuota free tier
// UploadThing (2GB storage / bulan) tahan lama dipakai banyak pembeli.
export const ourFileRouter = {
  weddingImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session.accountId) {
        throw new UploadThingError("Belum login.");
      }
      return { accountId: session.accountId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(assets).values({
        accountId: metadata.accountId,
        fileKey: file.key,
        url: file.ufsUrl,
      });
      return { url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
