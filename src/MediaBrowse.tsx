import { useEffect, useState } from "react";
import type { SetStateAction, Dispatch } from "react";
import "./App.css";
import "./MediaBrowse.css";
import supabase from "./supabase-client.ts";
import { MediaCard } from "./Components/MediaCard.tsx";
import type { PostgrestError } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import type { Database } from "./supabase-database.ts";

import {
  Card,
  Container,
  Stack,
  Paper,
  TextInput,
} from "@mantine/core";
import "@mantine/core/styles.css";

type MediaEntryRow = Database["public"]["Tables"]["media_entry"]["Row"];

function MediaBrowse(): React.JSX.Element {
  const [cards, setCards]: [
    MediaEntryRow[],
    Dispatch<SetStateAction<MediaEntryRow[]>>,
  ] = useState<MediaEntryRow[]>([]);
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
      }: { data: MediaEntryRow[] | null; error: PostgrestError | null } = 
              textSearch.length === 0
          ? await supabase.from("media_entry").select("*")
          : await supabase.rpc("search_media_trgm", { q: textSearch });
      
      console.log(data);
      console.log(error);
      if (!isMounted) {
        return;
      }
      if (error) {
        setError(error.message);
        return;
      }

      const items: MediaEntryRow[] = (data ?? []).map((row) => ({
        media_id: row.media_id ?? "",
        title: row.title ?? "",
        created_at: row.title ?? "",
        media_description: row.title ?? "",
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
          <Link to="/AddMedia">Add New Media</Link>
          </Card>
      <Paper withBorder radius="lg" shadow="sm" p="lg">
        <Stack gap="lg">
          <TextInput
            label="mediaSearch"
            placeholder="Enter Media to Search"
            value={textSearch}
            onChange={(event) => setTextSearch(event.target.value)}
          />
          <Stack>
            {/* {error ? <p className="error">{error}</p> : null} */}

            {cards.map((card, index) => (
              <MediaCard key={`${card.media_id}-${index}`} {...card} />
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

export default MediaBrowse;
