import { useEffect, useState } from "react";
import "./App.css";
import "./MediaBrowse.css";
import { Link } from "react-router-dom";
import supabase from "./supabase-client.ts";
import { TagCard } from "./Components/TagCard.tsx";
import type { PostgrestError } from "@supabase/supabase-js";

import type { Database } from "./supabase-database.ts";
type TagEntryRow = Database["public"]["Tables"]["tag_entry"]["Row"];
import {
  Card,
  Container,
  Stack,
  Paper,
  TextInput,
} from "@mantine/core";
import "@mantine/core/styles.css";
  
function TagBrowse(): React.JSX.Element {
  const [cards, setCards] = useState<TagEntryRow[]>([]);
  const [, setError] = useState<string | null>(null);
  const [textSearch, setTextSearch] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function searchTrgm(): Promise<void> {
      await new Promise<void>((resolve: () => void) =>
        setTimeout(resolve, 100),
      );
      const {
        data,
        error,
      }: { data: TagEntryRow[] | null; error: PostgrestError | null } =
        textSearch.length === 0
          ? await supabase.from("tag_entry").select("*")
          : await supabase.rpc("search_tag_trgm", { q: textSearch });

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
        created_at: row.created_at ?? "",
        tag_description: row.tag_description ?? "",
        tag_id: row.tag_id ?? "",
        tag_name: row.tag_name,
      }));
      setCards(items);
    }

    async function run(): Promise<void> {
      console.log(cards);
      await searchTrgm();
    }

    void run();
    return () => {
      isMounted = false;
    };
  }, [textSearch]);

  return (
    <Container size="lg" py="xl">
          <Card>
          <Link to="/TagInfoAdd">Add New Tag</Link>
          </Card>
      <Paper withBorder radius="lg" shadow="sm" p="lg">
        <Stack gap="lg">
          <TextInput
            label="tagSearch"
            placeholder="Enter Tag to Search"
            value={textSearch}
            onChange={(event) => setTextSearch(event.target.value)}
          />
          <Stack>
            {/* {error ? <p className="error">{error}</p> : null} */}

            {cards.map((card, index) => (
              <TagCard key={`${card.tag_id}-${index}`} {...card} />
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

export default TagBrowse;
