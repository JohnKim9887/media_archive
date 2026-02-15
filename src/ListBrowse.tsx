import React, { useState, useEffect } from "react";

import type { Database } from "./supabase-database.ts";

import { ListCardPublic } from "./Components/Cards.tsx";
import supabase from "./supabase-client.ts";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  Container,
  Stack,
  Paper,
  TextInput,
} from "@mantine/core";
import "@mantine/core/styles.css";

type ListUserMediaRow = Database["public"]["Tables"]["list_entry"]["Row"];
type UserRow = Database["public"]["Tables"]["profile"]["Row"];
type ListWithCreator = ListUserMediaRow & {
  profile: Pick<UserRow, "user_id" | "username"> | null;
};


function ListBrowse(): React.JSX.Element {
  const [textSearch, setTextSearch] = useState<string>("");
  const [listEntries, setListEntries] = useState<ListWithCreator[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function searchTrgm(): Promise<void> {
      await new Promise<void>((resolve: () => void) =>
        setTimeout(resolve, 100),
      );
      const {
        data,
        error,
      }: { data: ListWithCreator[] | null; error: PostgrestError | null } = 
              textSearch.length === 0
          ? await supabase.from("list_entry").select("*")
          : await supabase.rpc("search_list_trgm", { q: textSearch });
      
      console.log(data);
      console.log(error);
      if (!isMounted) {
        return;
      }
      if (error) {
        
        return;
      }
      setListEntries(data ?? []);
    }

    async function run(): Promise<void> {
      console.log(listEntries);
      await searchTrgm();
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, [textSearch]);
  async function getListsWithCreators(): Promise<ListWithCreator[]> {
    const response: {
      data: ListWithCreator[] | null;
      error: PostgrestError | null;
    } = await supabase
      .from("list_entry")
      .select("*, profile (user_id, username)")
      .eq("is_public", true );

    if (response.error) {
      throw response.error;
    }
    setListEntries(response.data ?? []);
    return response.data ?? [];
  }

  useEffect(() => {
    async function run(): Promise<void> {
      console.log("response");
      await getListsWithCreators();
    }

    void run();
  }, []);
  return (
    <Container size="lg" py="xl">
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

            {renderListCards(listEntries)}
          </Stack>

        </Stack>
      </Paper>
    </Container>
  );
}

function renderListCards(lists: ListWithCreator[]): React.JSX.Element[] {
  return lists.map((listRow: ListWithCreator, index: number) => (
    <ListCardPublic key={index} {...listRow} />
  ));
}

export default ListBrowse;
