import type { QueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSuspendedQuery } from "@/application/hooks/api/core";
import type { QuerySelectOption } from "@/application/hooks/api/core/types";
import { delay } from "@/application/util";
import { api } from "@/infra/api";
import type {
  GetFavoriteTagsResponse,
  GetPopularTagsResponse,
  GetTagSearchResponse,
} from "@/infra/api/tags/types";

import { QUERY_KEYS } from "./queryKey";

/**
 * 인기 태그 조회 API
 */
export const useGetPopularTags = () => {
  const { data, ...rest } = useQuery<GetPopularTagsResponse>({
    queryKey: QUERY_KEYS.getPopularTags,
    queryFn: () => api.tags.getPopularTags(),
  });

  return { tags: data?.tags, ...rest };
};

/**
 * 태그 자동완성 API
 * @param value 검색어
 */
export const useGetTagSearch = (value: string) => {
  const { data, ...rest } = useQuery<GetTagSearchResponse>({
    queryKey: QUERY_KEYS.getTagSearch(value),
    queryFn: () => api.tags.getTagSearch(value),
    keepPreviousData: true,
    enabled: !!value,
  });
  return { autoCompletedTags: data?.tags, ...rest };
};

/**
 * @desc
 * Navigation Drawer (SideBar) 카테고리/태그
 */
export const useGetCategoryWithTag = <T>({
  select,
  enabled = true,
}: {
  select: QuerySelectOption<T, typeof api.tags.getCategoryWithTags>;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: QUERY_KEYS.getCategoryWithTags,
    queryFn: api.tags.getCategoryWithTags,
    enabled,
    select,
  });

export const useGetMemeTagsById = (id: string) => {
  const { data, ...rest } = useSuspendedQuery({
    queryKey: QUERY_KEYS.getMemeTagsById(id),
    queryFn: () => api.tags.getMemeTagsById(id),
    staleTime: Infinity,
  });
  return { ...data, ...rest };
};

export const fetchMemeTagsById = (id: string, queryClient: QueryClient) =>
  queryClient.fetchQuery(QUERY_KEYS.getMemeTagsById(id), () => api.tags.getMemeTagsById(id));

export const useGetTagInfo = (
  tagId: number,
  options: Pick<UseQueryOptions, "enabled"> = { enabled: true },
) => {
  return useQuery({
    queryKey: QUERY_KEYS.getTagInfo(tagId),
    queryFn: () => api.tags.getTagInfo(tagId),
    staleTime: 0,
    ...options,
  });
};

export const fetchTagInfo = (tagId: number, queryClient: QueryClient) =>
  queryClient.fetchQuery(QUERY_KEYS.getTagInfo(tagId), () => api.tags.getTagInfo(tagId));

export const useGetFavoriteTags = (
  options: Pick<UseQueryOptions, "enabled"> = { enabled: false },
) => {
  const { data, ...rest } = useQuery<GetFavoriteTagsResponse>({
    queryKey: QUERY_KEYS.getFavoriteTags,
    queryFn: () => api.tags.getFavoriteTags(),
    ...options,
  });

  const favoriteCategory = [
    {
      categoryId: 0,
      name: "",
      priority: 0,
      tags: data?.tags || [],
    },
  ];

  return { favoriteCategory: favoriteCategory, favoriteTags: data?.tags };
};

export const usePostFavoriteTag = (name: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.tags.postFavoriteTag,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.getTagInfo(id) });

      const previousTagInfo = queryClient.getQueryData(QUERY_KEYS.getTagInfo(id)) as Awaited<
        ReturnType<typeof api.tags.getTagInfo>
      >;

      queryClient.setQueryData(QUERY_KEYS.getFavoriteTags, (old) => {
        const newTags = [
          ...(old as Awaited<ReturnType<typeof api.tags.getFavoriteTags>>).tags,
          {
            tagId: id,
            name: name,
            isFav: true,
          },
        ];

        return { tags: newTags };
      });

      queryClient.setQueryData(QUERY_KEYS.getTagInfo(id), (old) => ({
        ...(old as Awaited<ReturnType<typeof api.tags.getCategoryWithTags>>),
        isFav: true,
      }));

      return { previousTagInfo };
    },

    onError: (err, id, context) => {
      queryClient.setQueryData(QUERY_KEYS.getTagInfo(id), context?.previousTagInfo);
    },
  });
};

export const useDeleteFavoriteTag = (wait = 0) => {
  const queryClient = useQueryClient();

  const controller = new AbortController();

  const mutation = useMutation({
    mutationFn: (id: number) => api.tags.deleteFavoriteTag(id, controller.signal),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.getTagInfo(id) });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.getFavoriteTags });

      const previousFavoriteCategory = queryClient.getQueryData(QUERY_KEYS.getFavoriteTags);
      const previousTagInfo = queryClient.getQueryData(QUERY_KEYS.getTagInfo(id)) as Awaited<
        ReturnType<typeof api.tags.getTagInfo>
      >;

      queryClient.setQueryData(QUERY_KEYS.getFavoriteTags, (old) => {
        const newTags = (old as Awaited<ReturnType<typeof api.tags.getFavoriteTags>>).tags.filter(
          (tag) => tag.tagId !== id,
        );
        return { tags: newTags };
      });

      queryClient.setQueryData(QUERY_KEYS.getTagInfo(id), (old) => ({
        ...(old as Awaited<ReturnType<typeof api.tags.getFavoriteTags>>),
        isFav: false,
      }));

      await delay(wait);
      return { previousTagInfo, previousFavoriteCategory };
    },

    onError: (err, id, context) => {
      queryClient.setQueryData(QUERY_KEYS.getTagInfo(id), context?.previousTagInfo);
      queryClient.setQueryData(QUERY_KEYS.getFavoriteTags, context?.previousFavoriteCategory);
    },
  });
  return { ...mutation, onCancel: () => controller.abort() };
};
