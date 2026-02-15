import React from "react";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { MediaReviewGroup, SmallTag } from "./Components/Cards.tsx";
import { Rating } from "@mantine/core";
import type { UserResponse } from "@supabase/supabase-js";
import supabase from "./supabase-client.ts";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "./supabase-database";
import {
  Card,
  Container,
  Stack,
  Flex,
  Paper,
  Text,
  Button,
  Image,
} from "@mantine/core";
import "@mantine/core/styles.css";

import "./MediaInfo.css";

type MediaTable = Database["public"]["Tables"]["media_entry"];
type MediaRow = MediaTable["Row"];
type TagRow = Database["public"]["Tables"]["tag_entry"]["Row"];
type MediaTagPair = Database["public"]["Tables"]["media_tag_entry"]["Row"];
type MediaReviewEntry =
  Database["public"]["Tables"]["media_review_entry"]["Row"];
type MediaReviewInsert =
  Database["public"]["Tables"]["media_review_entry"]["Insert"];
type MediaReviewEntryWithUsername = MediaReviewEntry & {
  profile: { username: string } | null;
};

type ReviewWithProfile = MediaReviewEntry & {
  profile: { username: string } | null;
};

function MediaInfo(): React.JSX.Element {
  const [mediaData, setMediaData] = useState<MediaRow[]>();
  const [mediaTagList, setMediaTagList] = useState<TagRow[]>();
  const [joinReviews, setJoinReviews] = useState<
    MediaReviewEntryWithUsername[]
  >([]);
  const { MediaID: mediaId } = useParams<{ MediaID: string }>();
  const [userId, setUserId] = useState<string>();
  const [ratingCount, setMediaScore] = useState<number | undefined>(undefined);
  const [averageScore, setAverageScore] = useState<number | undefined>(
    undefined,
  );
  const [imageURL, setImageURL] = useState<string>("invalid");
  async function buildJoinReview(mediaId: string): Promise<void> {
    const {
      data,
      error,
    }: { data: ReviewWithProfile[] | null; error: PostgrestError | null } =
      await supabase
        .from("media_review_entry")
        .select("*, profile(username)")
        .eq("media_id", mediaId);
    console.log("media_review_entry");
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

    console.log(data);
    console.log(error);
    setJoinReviews(data ?? []);
    const { count }: { count: number | null; error: PostgrestError | null } =
      await supabase
        .from("media_review_entry")
        .select("*", { head: true, count: "exact" })
        .eq("media_id", mediaId);
    if (count === 0) {
      setMediaScore(undefined);
    } else {
      setMediaScore(count ?? 0);
    }
  }

  useEffect(() => {
    async function run(): Promise<void> {
      await buildJoinReview(mediaId ?? "");
    }

    void run();
  }, [mediaId]);

  async function buildUserId(): Promise<void> {
    setUserId(await getUserId());
  }

  async function SelectMediaWithID(mediaID: string | undefined): Promise<void> {
    if (mediaID === undefined) {
      console.log("MediaID is undefined");
      return;
    }

    const {
      data,
      error,
    }: { data: MediaRow[] | null; error: PostgrestError | null } =
      await supabase.from("media_entry").select("*").eq("media_id", mediaID);

    if (error) {
      console.error("Error", error);
      return;
    }

    if (data === null) {
      console.error("failed retrieving data");
      return;
    }
    //setMediaID(MediaID);
    setMediaData(data);
  }

  async function SelectAllTagsWithID(
    mediaID: string | undefined,
  ): Promise<TagRow[]> {
    if (mediaID === undefined) {
      console.log("MediaID is undefined");
      return [];
    }

    const tagPairResponse: {
      data: MediaTagPair[] | null;
      error: PostgrestError | null;
    } = await supabase
      .from("media_tag_entry")
      .select("*")
      .eq("media_id", mediaID);

    if (tagPairResponse.error !== null) {
      throw tagPairResponse.error;
    }

    const tagPairs: MediaTagPair[] = tagPairResponse.data ?? [];
    const tagIds: string[] = tagPairs
      .map((pair: MediaTagPair) => pair.tag_id)
      .filter((tagId: string | null) => tagId !== null);
    if (tagIds.length === 0) {
      return [];
    }

    const tagResponse: {
      data: TagRow[] | null;
      error: PostgrestError | null;
    } = await supabase.from("tag_entry").select("*").in("tag_id", tagIds);

    if (tagResponse.error !== null) {
      throw tagResponse.error;
    }
    setMediaTagList(tagResponse.data ?? []);
    return tagResponse.data ?? [];
  }

  async function setImage(): Promise<void> {
    console.log("SET IMAGEEEEEEEEEEEEEEEEEEEEEEEEEEE");
    const { data } = supabase.storage
      .from("media_image")
      .getPublicUrl(`public/${mediaId}.jpg`);
    console.log(data);
    const url = data?.publicUrl
      ? `${data.publicUrl}?t=${Date.now()}`
      : "invalid";
    setImageURL(url);
  }

  useEffect(() => {
    async function run(): Promise<void> {
      void buildUserId();
      void SelectMediaWithID(mediaId);
      void SelectAllTagsWithID(mediaId);
      void setImage();
    }

    void run();
  }, [mediaId]);

  const handleRating = (rate: number) => {
    if (userId === undefined) {
      console.error("userId is undefined");
      return;
    }
    if (mediaId === undefined) {
      console.error("mediaId is undefined");
      return;
    }
    submitScore(userId, mediaId, rate);
  };

  if (mediaId === null || mediaId === undefined) {
    return <h1>Cannot find media ID</h1>;
  } else {
    const selectedMedia: MediaRow | undefined = mediaData?.[0];

    return (
      <Container size="lg" py="xl">
        <Paper withBorder radius="lg" shadow="sm" p="lg">
          <Stack gap="lg">
            <Flex align="center" justify="space-between">
              <Text size="xl">MediaPage</Text>
              <Button
                component={Link}
                to={`/MediaInfoEdit/${mediaId}`}
                mt="md"
                radius="md"
              >
                Edit This Page
              </Button>
            </Flex>

            <Paper withBorder radius="md" p="lg">
              <Flex
                direction={{ base: "column", sm: "row" }}
                gap="lg"
                justify="center"
                align="stretch"
              >
                <Card
                  withBorder
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  style={{ width: 400, height: 400 }}
                >
                  <Image
                    src={imageURL}
                    radius="xl"
                    h={300}
                    w="auto"
                    fit="contain"
                  />
                </Card>
                <Card
                  withBorder
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  style={{ flex: 1, maxWidth: 720 }}
                >
                  <Stack gap="xs">
                    <h2 style={{ margin: 0 }}>
                      {selectedMedia?.title ?? "Media Title"}
                    </h2>
                    <Flex gap="md" wrap="wrap">
                      <p style={{ margin: 0 }}>Media ID: {mediaId}</p>
                      <p style={{ margin: 0 }}>
                        Score: {averageScore ?? "No score yet"} / 5
                      </p>
                      <p style={{ margin: 0 }}>
                        Rating count: {ratingCount ?? "No count yet"}
                      </p>
                    </Flex>

                    <Text size="sm" component="div">
                      {selectedMedia?.media_description}
                    </Text>

                    <Stack gap={6}>
                      <p style={{ margin: 0 }}>Average score</p>
                      <Rating
                        value={averageScore}
                        fractions={2}
                        readOnly
                        size="lg"
                      />
                    </Stack>

                    <Stack gap={6}>
                      <p style={{ margin: 0 }}>My score</p>
                      <Rating
                        value={averageScore}
                        fractions={2}
                        size="lg"
                        onChange={handleRating}
                      />
                    </Stack>
                  </Stack>
                </Card>
              </Flex>
            </Paper>

            <Paper withBorder radius="md" p="lg">
              <Container size="md" px={0}>
                <Stack gap="sm">
                  <Flex gap="xs" wrap="wrap">
                    {mediaTagList?.map((tagRow: TagRow) => SmallTag(tagRow))}
                  </Flex>
                </Stack>
              </Container>
            </Paper>

            <Paper withBorder radius="md" p="lg">
              <Stack gap="sm">
                <MediaReviewGroup
                  user_id={userId}
                  media_id={mediaId}
                  reviews={joinReviews}
                />
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </Container>
    );
  }
}

async function submitScore(
  userId: string,
  mediaId: string,
  score: number,
): Promise<void> {
  const insertScore: MediaReviewInsert = {
    media_id: mediaId,
    review_score: score,
    user_id: userId,
  };
  const { data, error } = await supabase
    .from("media_review_entry")
    .upsert(insertScore)
    .select("*");
  console.log(data);
  console.log(error);
}

async function getUserId(): Promise<string> {
  const {
    data: { user },
    error,
  }: UserResponse = await supabase.auth.getUser();

  if (error) {
    console.log(error.message);
    return "ERROR";
  }
  if (!user) {
    console.log("Not logged in");
    return "Not logged in";
  } else {
    if (user.id !== undefined) {
      return user.id;
    } else {
      return "ERROR";
    }
  }
}

export default MediaInfo;
