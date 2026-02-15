import { useState } from "react";
import type { Dispatch } from "react";

import type { PostgrestError } from "@supabase/supabase-js";

import "./App.css";
import "./Components/CardStyle.css";
import supabase from "./supabase-client.ts";
import type { Database } from "./supabase-database.ts";
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

type MediaEntryInsert = Database["public"]["Tables"]["media_entry"]["Insert"];

function MediaInfoAdd(): React.JSX.Element {
  const [title, setTitle]: [string, Dispatch<string>] = useState<string>("");
  const [description, setMediaDescription]: [string, Dispatch<string>] =
    useState<string>("");
  async function InsertEntry(): Promise<void> {
    const newPayload: MediaEntryInsert = {
      title: title,
      media_description: description,
    };

    const { error }: { error: PostgrestError | null } = await supabase
      .from("media_entry")
      .insert([newPayload]);

    if (error) {
      console.error("InsertEntry failed", error);
      return;
    }
    setTitle("");
    setMediaDescription("");
  }
  return (
    <Container size="lg" py="xl">
      <Paper withBorder radius="lg" shadow="sm" p="lg">
        <Stack gap="lg">
          <Flex align="center" justify="space-between">
            <Text size="xl">Add New Media</Text>
            <Button type="button" onClick={InsertEntry} mt="md" radius="md">
              Insert Entry
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
                    label="Title"
                    placeholder="Enter media title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                  <Textarea
                    label="Description"
                    placeholder="Enter media description"
                    autosize
                    minRows={4}
                    value={description}
                    onChange={(event) =>
                      setMediaDescription(event.target.value)
                    }
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

export default MediaInfoAdd;

// async function SelectMedias(): Promise<MediaProps[]> {
//   const result = await supabase
//     .from('characters')
//     .select('title');

//   if (result.error) {
//     console.error("SelectEntry failed", result.error);
//     return [];
//   }

//   setMediaID("");
//   setTitle("");

//   const titles: string[] = result.data.map(function (
//     row: { title: string | null }
//   ): string {
//     return row.title ?? "";
//   });

//   const result2 = await supabase
//     .from("mediaTestTable")
//     .select("media_id, title");

//   if (result2.error) {
//     console.error("SelectEntry failed", result2.error);
//     return [];
//   }
//   const items: MediaProps[] = result2.data.map(row => ({
//     media_id: row.media_id ?? "",
//     title: row.title ?? ""
//   }));
//   return items;
// }
