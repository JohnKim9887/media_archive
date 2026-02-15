import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "./supabase-client.ts";
import { MediaCard } from "./Components/MediaCard.tsx";

import "./ListBuilder.css";
import type { Database } from "./supabase-database.ts";
type MediaEntryRow = Database["public"]["Tables"]["media_entry"]["Row"];
function ListPage(): React.JSX.Element {
  const { ListID: listID } = useParams<{ ListID: string }>();
  const [selectedCards, setSelectedCards] = useState<MediaEntryRow[]>([]);


  useEffect(() => {
    async function getAllListEntries(): Promise<void> {
      const response = await supabase
        .from("list_media_entry")
        .select("*")
        .eq("list_id", listID);
      setSelectedCards(response?.data ?? []);
    }
    // async function run(): Promise<void> {
    //   await getAllListEntries();
    // }

    // void run();
    getAllListEntries();
    return;
  }, [listID]);



  // function CreateNewList() : void {
  //   await supabase
  //       .from("listTable")
  //       .select("*, (userID, username)");
  // }




  return (
    <div>
      <Link className="newCardLink" to={`/ListBuilder/${listID}`}>
        {" "}
        LINK{" "}
      </Link>
      <div className="verticalFlexCenter addGap">
        {selectedCards.map((card, index) => (
          <MediaCard key={`${card.media_id}-${index}`} {...card} />
        ))}
      </div>
    </div>
  );
}

export default ListPage;
