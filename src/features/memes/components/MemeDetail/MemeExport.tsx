import tw from "twin.macro";

import { usePostMemeToSharedCollection } from "@/api/collection";
import { useGetMemeDetailById } from "@/api/meme";
import { DropDown } from "@/common/components/DropDown";
import { Icon } from "@/common/components/Icon";
import { useToast } from "@/common/hooks";
import { DOMAIN, PATH } from "@/common/utils";
import { useAuth, useCollection } from "@/features/common";

interface Props {
  id: string;
}

export const MemeExport = ({ id }: Props) => {
  const { name, description } = useGetMemeDetailById(id);
  const { validate, isLogin, user } = useAuth();
  const { onUpdateCollection } = useCollection({ memeId: Number(id), isLogin });

  const { show } = useToast();
  const { mutate: postMemeToSharedCollection } = usePostMemeToSharedCollection({
    memeId: Number(id),
    sharedId: user?.sharedCollectionId as number,
  });

  const handleNativeShare = async () => {
    if (!navigator.share) return show("공유하기가 지원되지 않는 브라우저 입니다");
    await navigator
      .share({
        title: name,
        text: description,
        url: `${DOMAIN}${PATH.getMemeDetailPage(Number(id))}`,
      })
      .then(validate(postMemeToSharedCollection, { needSignUpModal: false }));
  };

  return (
    <>
      <DropDown>
        <DropDown.Trigger>
          <span className="ga-meme-add-click absolute top-16 right-16 flex h-40 w-40 items-center justify-center rounded-10 bg-black shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Icon color="white" name="meatball" />
          </span>
        </DropDown.Trigger>
        <DropDown.Contents css={tw`w-full right-0 top-72`}>
          <DropDown.Content
            className="ga-meme-add-save-click flex h-56 items-center p-16 font-suit text-18-bold-140 hover:bg-primary-100"
            onClick={validate(onUpdateCollection)}
          >
            콜렉션에 저장하기
          </DropDown.Content>
          <DropDown.Content
            className="ga-meme-add-share-click flex h-56 items-center p-16 font-suit text-18-bold-140 hover:bg-primary-100"
            onClick={handleNativeShare}
          >
            공유하기
          </DropDown.Content>
          <DropDown.Content className="ga-meme-add-channeltalk-click flex h-56 items-center p-16 font-suit text-18-bold-140 hover:bg-primary-100">
            신고
          </DropDown.Content>
        </DropDown.Contents>
      </DropDown>
    </>
  );
};
