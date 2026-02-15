import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { PostgrestError } from "@supabase/supabase-js";

import supabase from "../supabase-client.ts";
import type { Database } from "../supabase-database.ts";

import "./CardStyle.css";
import { Card, Flex, Stack, Image, Box, Text } from "@mantine/core";
import "@mantine/core/styles.css";

import { SmallTag } from "./Cards.tsx";

type MediaEntryRow = Database["public"]["Tables"]["media_entry"]["Row"];
type TagEntryRow = Database["public"]["Tables"]["tag_entry"]["Row"];

export interface MediaProps {
  media_id: number;
  title: string;
}

type MediaScores = {
  ratingCount: number | undefined;
  averageScore: number | undefined;
};

function useMediaScores(mediaId: string | number): MediaScores {
  const [ratingCount, setRatingCount] = useState<number | undefined>();
  const [averageScore, setAverageScore] = useState<number | undefined>();

  useEffect(() => {
    async function loadScores(): Promise<void> {
      const { count }: { count: number | null; error: PostgrestError | null } =
        await supabase
          .from("media_review_entry")
          .select("*", { head: true, count: "exact" })
          .eq("media_id", mediaId);
      if (count === 0) {
        setRatingCount(undefined);
      } else {
        setRatingCount(count ?? 0);
      }

      const averageResult = await supabase
        .from("media_review_entry")
        .select("avg_score:review_score.avg()")
        .eq("media_id", mediaId)
        .maybeSingle();
      if (averageResult.error) {
        setAverageScore(undefined);
        return;
      }
      const avgScore: number | null = averageResult.data?.avg_score ?? null;
      setAverageScore(avgScore ?? undefined);
    }

    async function run(): Promise<void> {
      await loadScores();
    }

    void run();
  }, [mediaId]);

  return { ratingCount, averageScore };
}

function useMediaImageUrl(mediaId: string | number): string | undefined {
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    async function run(): Promise<void> {
      const { data } = supabase.storage
        .from("media_image")
        .getPublicUrl(`public/${mediaId}.jpg`);
      const url = data?.publicUrl
        ? `${data.publicUrl}?t=${Date.now()}`
        : undefined;
      setImageUrl(url);
    }

    void run();
  }, [mediaId]);

  return imageUrl;
}

function useMediaTags(mediaId: string | number): TagEntryRow[] {
  const [tagsInMedia, setTagsInMedia] = useState<TagEntryRow[]>([]);

  useEffect(() => {
    async function loadTags(): Promise<void> {
      const {
        data,
      }: {
        data: TagEntryRow[] | null;
        error: PostgrestError | null;
      } = await supabase
        .from("tag_entry")
        .select("*, media_tag_entry!inner(media_id)")
        .eq("media_tag_entry.media_id", mediaId);

      setTagsInMedia(data ?? []);
    }

    async function run(): Promise<void> {
      await loadTags();
    }

    void run();
  }, [mediaId]);

  return tagsInMedia;
}

export function MediaCard(props: MediaEntryRow): React.JSX.Element {
  const { ratingCount, averageScore } = useMediaScores(props.media_id);
  const imageUrl = useMediaImageUrl(props.media_id);
  const tagsInMedia = useMediaTags(props.media_id);

  return (
    <Card>
      <Flex align="flex-start" gap="md" wrap="nowrap">
        <Box w={150} h={150} style={{ flex: "0 0 150px" }}>
          <Image src={imageUrl} radius="lg" h={150} w={150} fit="cover" />
        </Box>

        <Box style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Stack align="center">
            <Link className="newCardLink" to={`/MediaInfo/${props.media_id}`}>
              {props.title}
            </Link>
            <Flex gap="xs" wrap="wrap" justify="center">
              {tagsInMedia.map((tagRow) => SmallTag(tagRow))}
            </Flex>
          </Stack>
        </Box>
        <Box style={{ flex: "0 0 200px", textAlign: "right" }}>
          <Stack align="flex-end">
            <p>Score: {averageScore ?? "No score yet"} / 5</p>
            <p>Rating count: {ratingCount ?? "No ratings yet"}</p>
          </Stack>
        </Box>
      </Flex>
    </Card>
  );
}

export function SimpleMediaCard(props: MediaEntryRow): React.JSX.Element {
  const { ratingCount, averageScore } = useMediaScores(props.media_id);

  return (
    <Card>
      <Stack gap={4}>
        <Link className="newCardLink" to={`/MediaInfo/${props.media_id}`}>
          {props.title}
        </Link>
        <Text size="sm">Score: {averageScore ?? "No score yet"} / 5</Text>
        <Text size="sm">Rating count: {ratingCount ?? "No ratings yet"}</Text>
      </Stack>
    </Card>
  );
}

type SmallMediaCardProps = MediaEntryRow & {
  fullWidth?: boolean;
};

export function SmallMediaCard(props: SmallMediaCardProps): React.JSX.Element {
  const { ratingCount, averageScore } = useMediaScores(props.media_id);
  const imageUrl = useMediaImageUrl(props.media_id);
  const tagsInMedia = useMediaTags(props.media_id);
  const cardWidth = props.fullWidth ? "100%" : 240;

  return (
    <Card padding="sm" radius="md" withBorder style={{ width: cardWidth }}>
      <Flex gap="sm" align="flex-start" wrap="nowrap">
        <Image src={imageUrl} radius="md" h={150} w={150} fit="cover" />
        <Stack gap={6} style={{ flex: 1 }}>
          <Link
            className="newCardLink"
            to={`/MediaInfo/${props.media_id}`}
            style={{ display: "block", fontSize: "1.2rem", fontWeight: 600 }}
          >
            {props.title}
          </Link>
          <Flex gap={4} wrap="wrap">
            {tagsInMedia.map((tagRow) => SmallTag(tagRow))}
          </Flex>
          <Text size="xs">Score: {averageScore ?? "No score yet"} / 5</Text>
          <Text size="xs">Rating count: {ratingCount ?? "No ratings yet"}</Text>
        </Stack>
      </Flex>
    </Card>
  );
}
