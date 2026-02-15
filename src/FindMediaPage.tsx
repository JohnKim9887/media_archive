import React, { useEffect, useState } from "react";
import {
  Combobox,
  Container,
  Loader,
  Paper,
  Pill,
  PillsInput,
  Stack,
  Text,
  useCombobox,
} from "@mantine/core";
import type { PostgrestError } from "@supabase/supabase-js";

import supabase from "./supabase-client.ts";
import type { Database } from "./supabase-database.ts";
import { MediaCard } from "./Components/MediaCard.tsx";

type TagEntryRow = Database["public"]["Tables"]["tag_entry"]["Row"];
type MediaEntryRow = Database["public"]["Tables"]["media_entry"]["Row"];
type TagSuggestion = {
  tag_id: string;
  tag_name: string;
};

function FindMediaPage(): React.JSX.Element {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [searchText, setSearchText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagEntryRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [mediaFoundSet, setMediaFoundSet] = useState<Set<MediaEntryRow>>(
    new Set<MediaEntryRow>(),
  );

  function addSelectedTag(tag: TagSuggestion): void {
    const nextTag: TagEntryRow = {
      tag_id: tag.tag_id,
      tag_name: tag.tag_name,
      created_at: "",
      tag_description: null,
    };

    const nextSelected: TagEntryRow[] = [...selectedTags, nextTag];
    setSelectedTags(nextSelected);
    setSearchText("");
    setSuggestions([]);
    combobox.closeDropdown();
  }

  function removeSelectedTag(tagId: string): void {
    const nextSelected: TagEntryRow[] = selectedTags.filter(
      (tag: TagEntryRow) => (tag.tag_id ?? "") !== tagId,
    );
    setSelectedTags(nextSelected);
  }

  useEffect(() => {
    let isActive: boolean = true;

    //const handle: number = window.setTimeout(() => {
    async function fetchSuggestions(): Promise<void> {
      const query: string = searchText.trim();
      if (query.length === 0) {
        setSuggestions([]);
        setErrorMessage("");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      const response: {
        data: TagSuggestion[] | null;
        error: PostgrestError | null;
      } = await supabase
        .from("tag_entry")
        .select("tag_id, tag_name")
        .ilike("tag_name", `%${query}%`)
        .limit(20);

      if (!isActive) {
        return;
      }

      setIsLoading(false);

      if (response.error) {
        setSuggestions([]);
        setErrorMessage(response.error.message);
        return;
      }

      const selectedIds: Set<string> = new Set<string>(
        selectedTags.map((tag: TagEntryRow) => tag.tag_id ?? ""),
      );

      const filtered: TagSuggestion[] = (response.data ?? []).filter(
        (tag: TagSuggestion) => selectedIds.has(tag.tag_id) === false,
      );

      setSuggestions(filtered);
    }

    //}, 200);
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
      void fetchSuggestions();
      const selectedIds: Set<string> = new Set<string>(
        selectedTags.map((tag: TagEntryRow) => tag.tag_id ?? ""),
      );
      void getMediaMatchingTags(selectedIds);
    }

    void run();
    return () => {
      isActive = false;
      //window.clearTimeout(handle);
    };
  }, [searchText, selectedTags]);

  const optionItems: React.JSX.Element[] = suggestions.map(
    (tag: TagSuggestion) => (
      <Combobox.Option key={tag.tag_id} value={tag.tag_id}>
        {tag.tag_name}
      </Combobox.Option>
    ),
  );

  return (
    <Container size="lg" py="xl">
      <Paper withBorder radius="lg" shadow="sm" p="lg">
        <Stack gap="md">
          <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(tagId: string) => {
              const match: TagSuggestion | undefined = suggestions.find(
                (tag: TagSuggestion) => tag.tag_id === tagId,
              );
              if (match === undefined) {
                return;
              }
              addSelectedTag(match);
            }}
          >
            <Combobox.DropdownTarget>
              <PillsInput onClick={() => combobox.openDropdown()}>
                <Pill.Group>
                  {selectedTags.map((tag: TagEntryRow) => (
                    <Pill
                      key={tag.tag_id ?? tag.tag_name ?? ""}
                      withRemoveButton
                      onRemove={() => removeSelectedTag(tag.tag_id ?? "")}
                    >
                      {tag.tag_name ?? ""}
                    </Pill>
                  ))}

                  <PillsInput.Field
                    value={searchText}
                    onChange={(event) => {
                      setSearchText(event.currentTarget.value);
                      combobox.openDropdown();
                      combobox.updateSelectedOptionIndex();
                    }}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => combobox.closeDropdown()}
                    placeholder="Search tags…"
                  />
                </Pill.Group>
              </PillsInput>
            </Combobox.DropdownTarget>

            <Combobox.Dropdown>
              <Combobox.Options>
                {isLoading ? (
                  <Combobox.Empty>
                    <Loader size="xs" />
                  </Combobox.Empty>
                ) : optionItems.length > 0 ? (
                  optionItems
                ) : (
                  <Combobox.Empty>Nothing found</Combobox.Empty>
                )}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
          <Stack>
            {Array.from(mediaFoundSet).map((mediaEntry) => (
              <MediaCard key={mediaEntry.media_id} {...mediaEntry} />
            ))}
          </Stack>
          {errorMessage.length > 0 ? <Text c="red">{errorMessage}</Text> : null}
        </Stack>
      </Paper>
    </Container>
  );
}

export default FindMediaPage;
