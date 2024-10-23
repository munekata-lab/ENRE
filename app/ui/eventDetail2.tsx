import { fetchAllPrograms, fetchPlace } from "@/lib/dbActions";
import { getUserFromCookie } from "@/lib/session";
import { redirect } from "next/navigation";
import EventListComponent from "./eventListCard";

type Props = {
  key: string,
  value: string
}

export default async function EventDetail2Component({key, value}: Props) {
  const user = await getUserFromCookie();
  user === null && redirect("/login");
  const programList = await fetchAllPrograms();
  const allPlaceList = await fetchPlace();
  const spotsInfo = programList.map((item) => {
    // if (key !== "" && value !== "") { /*空じゃなかったら*/
    //   if (item[key] === value) {
    //     const place = allPlaceList.find((p: { id: string }) => p.id === item.place);
    //     return {
    //       title: item.title,
    //       content: item.content,
    //       process: item.process,
    //       caution: item.caution,
    //       condition: item.condition,
    //       place: place.name,
    //     };
    //   }
    // } else { /*空なら絞り込まない*/
      const place = allPlaceList.find((p: { id: string }) => p.id === item.place);
        return {
          title: item.title,
          content: item.content,
          process: item.process,
          caution: item.caution,
          condition: item.condition,
          place: item.name,
          owner: item.owner,
          schedule: item.schedule,
          isOpen: item.isOpen,
          exit: item.exit,
        };
    // }
  });

  return (
    <div>
      {spotsInfo.length === 0 ? (
        <div>
          <h1 className="text-2xl font-bold text-center mb-10">
            イベントはありません
          </h1>
        </div>
      ) : (
        <EventListComponent spotsInfo={spotsInfo} />
      )}
    </div>
  );
}
