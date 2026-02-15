import React from "react";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import supabase from "./supabase-client.ts";
import { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "./supabase-database.ts";
import { TextInput, Textarea, Image } from "@mantine/core";
import "./MediaInfo.css";
import {
  Card,
  Container,
  Stack,
  Group,
  Flex,
  Paper,
  Text,
  Button,
  FileButton,
} from "@mantine/core";
import "@mantine/core/styles.css";


type MediaTable = Database["public"]["Tables"]["media_entry"];
type MediaRow = MediaTable["Row"];
type MediaEntryUpdate = Database["public"]["Tables"]["media_entry"]["Update"];

type TagEntryRow = Database["public"]["Tables"]["tag_entry"]["Row"];
type MediaTagRow = Database["public"]["Tables"]["media_tag_entry"]["Row"];

function MediaInfoEdit(): React.JSX.Element {
  const [title, setTitle] = useState<string>("Not Set Yet");
  const [mediaDescription, setDescription] = useState<string>("Not Set Yet");
  const { MediaID: mediaID } = useParams<{ MediaID: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  //const [tagEntries, setTagEntries] = useState<TagEntryRow[]>([]);
  const [, setError] = useState<string | null>(null);
  const [textSearch, setTextSearch] = useState<string>("");
  const [draftTagsInMedia, setDraftTags] = useState<TagEntryRow[]>([]);
  const [searchedTags, setSearchedTags] = useState<TagEntryRow[]>([]);


  useEffect(() => {
    let isMounted = true;

    async function tagSearch(): Promise<void> {
      await new Promise<void>((resolve: () => void) =>
        setTimeout(resolve, 100),
      );

      const {
        data,
        error,
      }: { data: TagEntryRow[] | null; error: PostgrestError | null } =
        textSearch.length === 0
          ? await supabase.from("tag_entry").select("*")
          : await supabase
              .from("tag_entry")
              .select("*")
              .textSearch("tag_name || description", textSearch);
      console.log(data);
      console.log(error);
      if (!isMounted) {
        return;
      }
      if (error) {
        setError(error.message);
        return;
      }

      const items: TagEntryRow[] = (data ?? []).map((row) => ({
        tag_id: row.tag_id ?? "",
        tag_name: row.tag_name ?? "",
        created_at: row.created_at ?? "",
        tag_description: row.tag_description ?? "",
      }));
      setSearchedTags(items);
    }
    async function run(): Promise<void> {
      console.log(searchedTags);
      await tagSearch();
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, [textSearch]);

  useEffect(() => {
    async function getTagAlreadyAdded(): Promise<void> {
      const { data }: { data: TagEntryRow[] | null } = await supabase
        .from("tag_entry")
        .select("*, media_tag_entry!inner(media_id)")
        .eq("media_tag_entry.media_id", mediaID);

      setDraftTags(data ?? []);
    }

    async function run(): Promise<void> {
      console.log("HELLO");
      void getTagAlreadyAdded();
      if (mediaID === undefined) {
        return;
      }

      const mediaRow: MediaRow | null = await GetMediaInfo(mediaID);
      if (mediaRow !== null) {
        setTitle(mediaRow.title ?? "NOT SET YET");
        setDescription(mediaRow.media_description ?? "NOT SET YET");
      }
    }

    void run();
  }, [mediaID]);

  useEffect(() => {
    async function run(): Promise<void> {
      if (mediaID === undefined) {
        return;
      }
      const { data } = supabase.storage
        .from("media_image")
        .getPublicUrl(`public/${mediaID}.jpg`);
      const url = data?.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : null;
      setImageUrl(url);
    }

    void run();
  }, [mediaID]);

  useEffect(() => {
    let objectUrl: string | null = null;
    async function run(): Promise<void> {
      if (!file) {
        setPreviewUrl(null);
        return;
      }
      objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }

    void run();
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  async function addTagToDraftNew(
    tagEntry: TagEntryRow,
    draftTags: TagEntryRow[],
  ): Promise<void> {
    const alreadyExists: boolean = draftTags.some(
      (tag: TagEntryRow) => tag.tag_id === tagEntry.tag_id,
    );
    if (alreadyExists) {
      console.log("Entry already exists!");
    } else {
      const appended: TagEntryRow[] = [...draftTags, tagEntry];
      setDraftTags(appended);
    }
    console.log(draftTagsInMedia);
  }
  async function updateTags(): Promise<void> {
    if (mediaID === undefined) {
      console.error("media ID is undefined");
      return;
    }
    const tagMediaPairToInsert: MediaTagRow[] = draftTagsInMedia.map((tag) => ({
      media_id: mediaID,
      tag_id: tag.tag_id,
    }));
    const tagIdArray: string[] = tagMediaPairToInsert.map(
      (pair) => pair.tag_id,
    );
    const { error: upsertError } = await supabase
      .from("media_tag_entry")
      .upsert(tagMediaPairToInsert, { onConflict: "media_id,tag_id" });
    if (upsertError) {
      console.error("updateTags upsert failed", upsertError);
      return;
    }

    if (tagIdArray.length === 0) {
      const { error: deleteAllError } = await supabase
        .from("media_tag_entry")
        .delete()
        .eq("media_id", mediaID);
      if (deleteAllError) {
        console.error("updateTags delete failed", deleteAllError);
      }
      return;
    }

    const inList: string = `(${tagIdArray.map((id) => `"${id}"`).join(",")})`;
    const { error: deleteError } = await supabase
      .from("media_tag_entry")
      .delete()
      .eq("media_id", mediaID)
      .not("tag_id", "in", inList);
    if (deleteError) {
      console.error("updateTags delete failed", deleteError);
    }
  }
  async function UpdateEntry(): Promise<void> {
    if (mediaID === undefined) {
      console.log("MediaID is undefined");
      return;
    }
    const newPayload: MediaEntryUpdate = {
      media_id: mediaID,
      title: title,
      media_description: mediaDescription,
    };
    const { data, error } = await supabase
      .from("media_entry")
      .update(newPayload)
      .eq("media_id", mediaID)
      .select();
    await updateTags();
    console.log(data);
    console.log(error);
    if (error) {
      console.error("updateEntry failed", error);
      return;
    }
    navigate(`/MediaInfo/${mediaID}`);
  }

  async function submitImage(avatarFile: File | null): Promise<void> {
    if (mediaID === undefined) {
      console.log("MediaID cannot be null");
      return;
    }
    if (avatarFile === null) {
      console.log("The File is NULL");
      return;
    }

    const { data, error } = await supabase.storage
      .from("media_image")
      .upload(`public/${mediaID}.jpg`, avatarFile, { upsert: true });
    console.log(data);
    console.log(error);
    if (!error) {
      const { data: publicData } = supabase.storage
        .from("media_image")
        .getPublicUrl(`public/${mediaID}.jpg`);
      const url = publicData?.publicUrl
        ? `${publicData.publicUrl}?t=${Date.now()}`
        : null;
      setImageUrl(url);
    }
  }

  useEffect(() => {
    async function run(): Promise<void> {
      if (!file) {
        return;
      }
      void submitImage(file);
    }

    void run();
  }, [file, mediaID]);

  function smallTagForMedia(
    tagToAdd: TagEntryRow,
    index: number,
  ): React.JSX.Element {
    return (
      <Card key={index}>
        <Stack>
          <p>{tagToAdd.tag_name}</p>
          <Button
            variant="filled"
            onClick={() => addTagToDraftNew(tagToAdd, draftTagsInMedia)}
          >
            Add to draft
          </Button>
        </Stack>
      </Card>
    );
  }
  function SmallTagForMediaNewRemove(
    tag_name: string,
    index: number,
  ): React.JSX.Element {
    return (
      <Card key={index}>
        <Stack>
          <p>{tag_name}</p>
          <Button
            variant="filled"
            color="red"
            onClick={() =>
              removeTagFromDraftWithName(tag_name, draftTagsInMedia)
            }
          >
            Remove From Draft
          </Button>
        </Stack>
      </Card>
    );
  }
  function removeTagFromDraftWithName(
    tagName: string,
    draftTags: TagEntryRow[],
  ): void {
    const removed: TagEntryRow[] = draftTags.filter(
      (tag: TagEntryRow) => tag.tag_name !== tagName,
    );
    setDraftTags(removed);
    console.log(draftTagsInMedia);
  }
  if (mediaID === null) {
    return <h1>Cannot find media ID</h1>;
  } else {
    return (
      <Container size="lg" py="xl">
        <Paper withBorder radius="lg" shadow="sm" p="lg">
          <Stack gap="lg">
            <Flex align="center" justify="space-between">
              <Text size="xl">MediaPage Edit</Text>
              <Group>
                <Button radius="md" onClick={UpdateEntry}>
                  Apply Change
                </Button>
                <Button
                  component={Link}
                  to={`/MediaInfo/${mediaID}`}
                  radius="md"
                >
                  Back to Media Page
                </Button>
              </Group>
            </Flex>

            {/* Image + basic fields (same “card row” style as view page) */}
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
                  <FileButton onChange={setFile} accept="image/png,image/jpeg">
                    {(props) => <Button {...props}>Upload image</Button>}
                  </FileButton>
                  {file && (
                    <Text size="sm" ta="center" mt="sm">
                      Picked file: {file.name}
                    </Text>
                  )}
                  {previewUrl || imageUrl ? (
                    <Image
                      src={previewUrl ?? imageUrl ?? undefined}
                      radius="md"
                      h={240}
                      w="auto"
                      fit="contain"
                      mt="md"
                    />
                  ) : (
                    <Text size="sm" ta="center" c="dimmed" mt="md">
                      No image uploaded
                    </Text>
                  )}
                </Card>

                <Card
                  withBorder
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  style={{ flex: 1, maxWidth: 720 }}
                >
                  <Stack gap="sm">
                    <TextInput
                      label="Title"
                      placeholder="Enter title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                    <Textarea
                      label="Description"
                      placeholder="Enter description"
                      autosize
                      minRows={4}
                      value={mediaDescription}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </Stack>
                </Card>
              </Flex>
            </Paper>

            {/* Tags section (match view page Paper + Container + Stack) */}
            <Paper withBorder radius="md" p="lg">
              <Container size="md" px={0}>
                <Stack gap="sm">
                  <TextInput
                    label="Search tags"
                    placeholder="Type to search..."
                    value={textSearch}
                    onChange={(event) => setTextSearch(event.target.value)}
                  />
                  <Flex gap="lg" align="stretch" wrap="wrap">
                    <Card
                      withBorder
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      style={{ flex: 1, minWidth: 280 }}
                    >
                      <Stack gap="xs">
                        <Text fw={600}>Tags already on this page</Text>
                        <Stack gap="xs">
                          {draftTagsInMedia.map((card, index) =>
                            SmallTagForMediaNewRemove(card.tag_name, index),
                          )}
                        </Stack>
                      </Stack>
                    </Card>

                    <Card
                      withBorder
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      style={{ flex: 1, minWidth: 280 }}
                    >
                      <Stack gap="xs">
                        <Text fw={600}>Search results</Text>
                        <Stack gap="xs">
                          SmallTagForMedia
                          {searchedTags.map((card, index) =>
                            smallTagForMedia(card, index),
                          )}
                        </Stack>
                      </Stack>
                    </Card>
                  </Flex>
                </Stack>
              </Container>
            </Paper>

          </Stack>
        </Paper>
      </Container>
    );
  }
}

async function GetMediaInfo(mediaID: string): Promise<MediaRow | null> {
  const { data }: { data: MediaRow[] | null } = await supabase
    .from("media_entry")
    .select("*")
    .eq("media_id", mediaID);
  const selectedMedia: MediaRow | undefined = data?.[0];
  return selectedMedia ?? null;
}

export default MediaInfoEdit;
