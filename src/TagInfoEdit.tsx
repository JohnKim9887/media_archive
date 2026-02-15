import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import supabase from "./supabase-client.ts";
import type { Database } from "./supabase-database.ts";

import "./MediaInfo.css";
import {
  Card,
  Container,
  Stack,
  Flex,
  Paper,
  Text,
  Button,
  TextInput,
  Textarea,
  FileButton,
  Image,
} from "@mantine/core";
import "@mantine/core/styles.css";
type TagEntry = Database["public"]["Tables"]["tag_entry"];
type TagRow = TagEntry["Row"];
type TagEntryUpdate = Database["public"]["Tables"]["tag_entry"]["Update"];

function TagInfoAdd(): React.JSX.Element {
  const [tagName, setTagName] = useState<string>("Not Set Yet");
  const [tagDescription, setTagDescription] = useState<string>("Not Set Yet");
  const { TagID: tagID } = useParams<{ TagID: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    async function run(): Promise<void> {
      console.log("HELLO");
      if (tagID === undefined) {
        return;
      }
      const tagRow: TagRow | null = await GetTagInfo(tagID);
      if (tagRow !== null) {
        setTagName(tagRow.tag_name ?? "NOT SET YET");
        setTagDescription(tagRow.tag_description ?? "NOT SET YET");
      }
    }

    void run();
  }, [tagID]);

  useEffect(() => {
    async function run(): Promise<void> {
      if (tagID === undefined) {
        return;
      }
      const { data } = supabase.storage
        .from("media_image")
        .getPublicUrl(`tag_image/${tagID}.jpg`);
      setImageUrl(data?.publicUrl ?? null);
    }

    void run();
  }, [tagID]);

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

  async function InsertEntry(): Promise<void> {
    if (tagID === undefined) {
      console.log("tagID is undefined");
      return;
    }
    const newPayload: TagEntryUpdate = {
      tag_id: tagID,
      tag_name: tagName,
      tag_description: tagDescription,
    };
    const { data, error } = await supabase
      .from("tag_entry")
      .update(newPayload)
      .eq("tag_id", tagID)
      .select();

    console.log(data);
    console.log(error);
    if (error) {
      console.error("insert entry failed", error);
      return;
    }
    navigate(`/TagInfo/${tagID}`);
  }
  if (tagID) {
    //
  } else {
    return <h1>Cannot find media ID</h1>;
  }
  return (
    <Container size="lg" py="xl">
      <Paper withBorder radius="lg" shadow="sm" p="lg">
        <Stack gap="lg">
          <Flex align="center" justify="space-between">
            <Text size="xl">Add New Tag</Text>
            <Button onClick={InsertEntry} mt="md" radius="md">
              Add New Tag
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
                <FileButton onChange={setFile} accept="image/png,image/jpeg">
                  {(props) => <Button {...props}>Upload image</Button>}
                </FileButton>
                {file && (
                  <Text size="sm" ta="center" mt="sm">
                    Picked file: {file.name}
                  </Text>
                )}
                <p>400 x 400</p>
                <Button onClick={() => submitImage(tagID, file)}>
                   Submit Image
                   </Button>
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
                  <Flex gap="md" wrap="wrap">
                    <Text size="sm">Tag ID: {tagID}</Text>
                  </Flex>

                  <TextInput
                    label="Tag Name"
                    placeholder="Enter tag name"
                    value={tagName}
                    onChange={(event) => setTagName(event.target.value)}
                  />

                  <Textarea
                    label="Tag Description"
                    placeholder="Enter tag description"
                    autosize
                    minRows={4}
                    value={tagDescription}
                    onChange={(event) => setTagDescription(event.target.value)}
                  />
                </Stack>
              </Card>
            </Flex>
          </Paper>
        </Stack>
      </Paper>
    </Container>
  );
}

async function submitImage(
  tagId: string,
  avatarFile: File | null,
): Promise<void> {
  if (avatarFile === null) {
    console.log("The File is NULL");
    return;
  }
  const { data, error } = await supabase.storage
    .from("media_image")
    .upload(`tag_image/${tagId}.jpg`, avatarFile);
  console.log(data);
  console.log(error);
}

async function GetTagInfo(tagID: string): Promise<TagRow | null> {
  const { data }: { data: TagRow[] | null } = await supabase
    .from("tag_entry")
    .select("*")
    .eq("tag_id", tagID);
  const selectedMedia: TagRow | undefined = data?.[0];
  return selectedMedia ?? null;
}
export default TagInfoAdd;
