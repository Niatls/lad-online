import { HomePageClient } from "@/components/home/home-page-client";
import { getHomePageContent, getHomepageArticles } from "@/lib/content";

export default async function LadPage() {
  const [homeContent, articles] = await Promise.all([
    getHomePageContent(),
    getHomepageArticles(),
  ]);

  return <HomePageClient articles={articles} homeContent={homeContent} />;
}
