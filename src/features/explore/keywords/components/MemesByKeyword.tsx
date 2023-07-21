import { useGetMemesByKeyword } from "@/api/search";
import { EmptyMemesView, InfiniteMemeList } from "@/features/common";

interface Props {
  searchQuery: string;
}
export const MemesByKeyword = ({ searchQuery }: Props) => {
  const {
    data: memeList,
    isFetchingNextPage,
    isEmpty,
    fetchNextPage,
  } = useGetMemesByKeyword(searchQuery);

  if (isEmpty) {
    return <EmptyMemesView />;
  }

  return (
    <InfiniteMemeList
      loading={isFetchingNextPage}
      memeList={memeList}
      onRequestAppend={() => fetchNextPage({ cancelRefetch: false })}
    />
  );
};
