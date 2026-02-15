import React from "react";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import supabase from "./supabase-client.ts";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "./supabase-database";
import { SmallMediaCard } from "./Components/MediaCard.tsx";
import "./MediaInfo.css";
import {
  Card,
  Container,
  Stack,
  Flex,
  Paper,
  Text,
  Button,
  SimpleGrid,
} from "@mantine/core";
import "@mantine/core/styles.css";
function TagInfo(): React.JSX.Element {
  type TagTable = Database["public"]["Tables"]["tag_entry"];
  type TagRow = TagTable["Row"];

  type MediaEntryRow = Database["public"]["Tables"]["media_entry"]["Row"];
  const [mediaData, setTagData] = useState<TagRow[]>();
  const { TagID: tagID } = useParams<{ TagID: string }>();
  const [mediaFoundSet, setMediaFoundSet] = useState<Set<MediaEntryRow>>(
    new Set<MediaEntryRow>(),
  );
  async function InsertEntry(): Promise<void> {
    if (tagID === undefined) {
      console.log("tagID is undefined");
      return;
    }

    const {
      data,
      error,
    }: { data: TagRow[] | null; error: PostgrestError | null } = await supabase
      .from("tag_entry")
      .select("*")
      .eq("tag_id", tagID);

    if (error) {
      console.error("InsertEntry failed", error);
      return;
    }
    if (data === null) {
      console.error("failed retrieving data");
      return;
    }
    //setMediaID(MediaID);
    setTagData(data);
  }

  useEffect(() => {
    async function getMediaMatchingTags(
      selectedTagIds: Set<string>,
    ): Promise<void> {
      const tagIds: string[] = Array.from(selectedTagIds);
      const {
        data,
        error,
      }: { data: MediaEntryRow[] | null; error: PostgrestError | null } =
        await supabase.rpc("search_media_all_tags", {
          tag_ids: tagIds,
        });
      console.log(data);
      console.log(error);
      if (data === null) {
        return;
      }
      const mediaFound: Set<MediaEntryRow> = new Set<MediaEntryRow>(data);
      setMediaFoundSet(mediaFound);
    }

    async function run(): Promise<void> {
      const mediaFound: Set<string> = new Set<string>();
      mediaFound.add(tagID ?? "");
      void getMediaMatchingTags(mediaFound);
      void InsertEntry();
    }

    void run();
  }, [tagID]);

  if (tagID === null) {
    return <h1>Cannot find media ID</h1>;
  } else {
    const selectedMedia: TagRow | undefined = mediaData?.[0];
    return (
      <Container size="lg" py="xl">
        <Paper withBorder radius="lg" shadow="sm" p="lg">
          <Stack gap="lg">
            <Flex align="center" justify="space-between">
              <Text size="xl">TagPage</Text>
              <Button
                component={Link}
                to={`/TagInfoEdit/${tagID}`}
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
                  <p>400 x 400</p>
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
                      {selectedMedia?.tag_name ?? "Tag Title"}
                    </h2>
                    <Flex gap="md" wrap="wrap">
                      <p style={{ margin: 0 }}>Media ID: {tagID}</p>
                    </Flex>
                    <p style={{ margin: 0 }}>
                      <Text size="sm">{selectedMedia?.tag_description}</Text>
                    </p>
                  </Stack>
                </Card>
              </Flex>
            </Paper>

            <Paper withBorder radius="md" p="lg">
              <Container size="md" px={0}>
                <Stack gap="sm">
                  <p style={{ margin: 0 }}>To be Added</p>
                </Stack>
              </Container>
            </Paper>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
              {Array.from(mediaFoundSet).map((mediaEntry: MediaEntryRow) => (
                <SmallMediaCard
                  key={mediaEntry.media_id}
                  fullWidth
                  {...mediaEntry}
                />
              ))}
            </SimpleGrid>
          </Stack>
        </Paper>
      </Container>
    );
  }
}

export default TagInfo;
