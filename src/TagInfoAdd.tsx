import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

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
} from "@mantine/core";
import "@mantine/core/styles.css";
type TagEntry = Database["public"]["Tables"]["tag_entry"];
type TagRow = TagEntry["Row"];
type TagEntryInsert = Database["public"]["Tables"]["tag_entry"]["Insert"];

function TagInfoAdd() : React.JSX.Element {
    const [tagName, setTagName] = useState<string>("Not Set Yet");
    const [tagDescription, setTagDescription] = useState<string>("Not Set Yet");
    const { MediaID: tagID } = useParams<{ MediaID: string }>();

    useEffect(() => {
        async function run(): Promise<void> {
            console.log("HELLO");
            if (tagID === undefined) {
                return;
            }
            const tagRow: TagRow | null = await GetTagInfo(tagID);
            if (tagRow !== null) {
                setTagName(tagRow.tag_name ?? "NOT SET YET");
            }
        }

        void run();
    }, [tagID]);

    
    async function InsertEntry(): Promise<void> {
        const newPayload : TagEntryInsert = 
        {
            //tag_id: tagID,
            tag_name:  tagName,
            tag_description: tagDescription, 
        };
        const { data, error } =
            await supabase.from("tag_entry").insert([newPayload]).select();

        console.log(data);
        console.log(error);
        if (error) {
            console.error("insert entry failed", error);
            return;
        }
    }
    if (tagID === null) {
        return <h1>Cannot find media ID</h1>;
    }
    else {
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
              <p>400 x 400</p>
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
}



async function GetTagInfo(mediaID: string): Promise<TagRow | null> {

    const { data }: { data: TagRow[] | null } = await supabase.from("media_entry").select("*").eq("media_id", mediaID);
    const selectedMedia: TagRow | undefined = data?.[0];
    return selectedMedia ?? null;
}
export default TagInfoAdd;
