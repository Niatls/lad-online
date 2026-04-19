import { NextResponse } from 'next/server';

export async function GET() {
  // In a real application, you might fetch this from a database or environment variables.
  // For simplicity, we hardcode the latest version details here.
  // When you release a new version, update this file and push to Vercel.
  return NextResponse.json({
    version: "1.0.1",
    releaseNotes: "Initial automated update system enabled. Bug fixes.",
    downloadUrl: "https://lad-online.vercel.app/lad_admin_update.zip", 
    mandatory: false
  });
}
