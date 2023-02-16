import {
  useDeleteMemeFromCollection,
  useGetCollectionInfoByMemeId,
  usePostMemeToCollection,
  useToast,
} from "@/application/hooks";

interface CollectionInfo {
  collectionId: number | null;
  done: boolean;
}
interface UseCollectionArg {
  memeId: number;
}

/**
 * 추후 기획이 특정 폴더에 밈을 저장하게 되면 수정
 */
export const useCollection = ({ memeId }: UseCollectionArg) => {
  const { data: collectionInfo } = useGetCollectionInfoByMemeId<CollectionInfo>(memeId, {
    select: ({ collectionId }) => {
      return { collectionId, done: !!collectionId };
    },
  });
  const { mutate: postMemeToCollection } = usePostMemeToCollection({ memeId });
  const { mutate: deleteMemeFromCollection } = useDeleteMemeFromCollection({ memeId });

  const { show } = useToast();

  const onUpdateCollection = () => {
    if (collectionInfo.done) {
      deleteMemeFromCollection(memeId, {
        onSuccess: () => {
          show("콜렉션에서 삭제했습니다!");
        },
        onError: () => {
          show("콜렉션 삭제에 실패했습니다!");
        },
      });
    } else {
      postMemeToCollection(memeId, {
        onSuccess: () => {
          show("콜렉션에 저장했습니다!");
        },
        onError: () => {
          show("콜렉션 저장에 실패했습니다!");
        },
      });
    }
  };
  return { collectionInfo, onUpdateCollection };
};
