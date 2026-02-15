import React from "react";
import { Link } from "react-router-dom";

import "./CardStyle.css";
import { Card, Stack } from "@mantine/core";
import "@mantine/core/styles.css";

import type { Database } from "../supabase-database.ts";

type TagEntryRow = Database["public"]["Tables"]["tag_entry"]["Row"];

export function TagCard(tagProp: TagEntryRow): React.JSX.Element {
  return (
    <Card>
      <Stack>
        <Link className="newCardLink" to={`/TagInfo/${tagProp.tag_id}`}>
          {tagProp.tag_name}
        </Link>
      </Stack>
    </Card>
  );
}
