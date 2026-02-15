import { useEffect, useState } from "react";
import "./App.css";
import { SmallMediaCard } from "./Components/MediaCard.tsx";
import supabase from "./supabase-client.ts";

import type { Database } from "./supabase-database.ts";

import {
  Container,
  Stack,
  Flex,
  Paper,
  Text,
} from "@mantine/core";
import "@mantine/core/styles.css";

type MediaEntryRow = Database["public"]["Tables"]["media_entry"]["Row"];
type MediaReviewRow =
  Database["public"]["Tables"]["media_review_entry"]["Row"];

function Home(): React.JSX.Element {
  const [topRatedMedia, setTopRatedMedia] = useState<MediaEntryRow[]>([]);
  const [topReviewedMedia, setTopReviewedMedia] = useState<MediaEntryRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isActive = true;

    async function loadHomeData(): Promise<void> {
      try {
        const [topRated, mostReviewed] = await Promise.all([
          loadTopRatedMedia(),
          loadTopReviewedMedia(),
        ]);
        if (!isActive) {
          return;
        }
        setTopRatedMedia(topRated);
        setTopReviewedMedia(mostReviewed);
      } catch (error) {
        if (!isActive) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Failed to load home data.";
        setErrorMessage(message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    async function run(): Promise<void> {
      await loadHomeData();
    }

    void run();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <Container size="lg" py="xl">
      <Paper withBorder radius="lg" shadow="sm" p="lg">
        <Stack gap="lg">
          <Flex align="flex-start" justify="space-between" gap="xl">
            <Container size="md" py="xl" style={{ flex: 1, minWidth: 320 }}>
              <Paper withBorder radius="lg" shadow="sm" p="lg">
                <h1 className="heading">Highest Rated Media</h1>
                {isLoading ? (
                  <Text>Loading...</Text>
                ) : errorMessage ? (
                  <Text>{errorMessage}</Text>
                ) : topRatedMedia.length === 0 ? (
                  <Text>No ratings yet.</Text>
                ) : (
                  topRatedMedia.map((media) => (
                    <SmallMediaCard key={media.media_id} fullWidth {...media} />
                  ))
                )}
              </Paper>
            </Container>
            <Container size="md" py="xl" style={{ flex: 1, minWidth: 320 }}>
              <Paper withBorder radius="lg" shadow="sm" p="lg">
                <h1 className="heading">Most Reviewed Media</h1>
                {isLoading ? (
                  <Text>Loading...</Text>
                ) : errorMessage ? (
                  <Text>{errorMessage}</Text>
                ) : topReviewedMedia.length === 0 ? (
                  <Text>No reviews yet.</Text>
                ) : (
                  topReviewedMedia.map((media) => (
                    <SmallMediaCard key={media.media_id} fullWidth {...media} />
                  ))
                )}
              </Paper>
            </Container>
          </Flex>
        </Stack>
      </Paper>
    </Container>
  );
}

async function loadTopReviewedMedia(): Promise<MediaEntryRow[]> {
  const { data, error }: { data: MediaReviewRow[] | null; error: Error | null } =
    await supabase.from("media_review_entry").select("media_id");
  if (error) {
    throw error;
  }
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.media_id, (counts.get(row.media_id) ?? 0) + 1);
  }
  const topIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([mediaId]) => mediaId);
  if (topIds.length === 0) {
    return [];
  }

  const {
    data: mediaRows,
    error: mediaError,
  }: { data: MediaEntryRow[] | null; error: Error | null } = await supabase
    .from("media_entry")
    .select("*")
    .in("media_id", topIds);
  if (mediaError) {
    throw mediaError;
  }
  const mediaById = new Map(
    (mediaRows ?? []).map((row) => [row.media_id, row]),
  );
  return topIds
    .map((mediaId) => mediaById.get(mediaId))
    .filter((row) => row !== undefined);
}

async function loadTopRatedMedia(): Promise<MediaEntryRow[]> {
  const { data, error }: { data: MediaReviewRow[] | null; error: Error | null } =
    await supabase.from("media_review_entry").select("media_id, review_score");
  if (error) {
    throw error;
  }
  const scoreTotals = new Map<string, { total: number; count: number }>();
  for (const row of data ?? []) {
    if (row.review_score === null) {
      continue;
    }
    const current = scoreTotals.get(row.media_id) ?? { total: 0, count: 0 };
    scoreTotals.set(row.media_id, {
      total: current.total + row.review_score,
      count: current.count + 1,
    });
  }
  const topIds = [...scoreTotals.entries()]
    .map(([mediaId, score]) => ({
      mediaId,
      avg: score.count === 0 ? 0 : score.total / score.count,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)
    .map((entry) => entry.mediaId);
  if (topIds.length === 0) {
    return [];
  }

  const {
    data: mediaRows,
    error: mediaError,
  }: { data: MediaEntryRow[] | null; error: Error | null } = await supabase
    .from("media_entry")
    .select("*")
    .in("media_id", topIds);
  if (mediaError) {
    throw mediaError;
  }
  const mediaById = new Map(
    (mediaRows ?? []).map((row) => [row.media_id, row]),
  );
  return topIds
    .map((mediaId) => mediaById.get(mediaId))
    .filter((row) => row !== undefined);
}

export default Home;
