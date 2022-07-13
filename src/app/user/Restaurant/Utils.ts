import { ref, onUnmounted, computed, Ref } from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import {
  query,
  onSnapshot,
  collection,
  where,
  DocumentData,
} from "firebase/firestore";

import { doc2data, array2obj } from "@/utils/utils";

export const useTitles = (restaurantId: Ref) => {
  const titles = ref<DocumentData[]>([]);

  const titleDetacher = ref();
  const detacheTitle = () => {
    if (titleDetacher.value) {
      titleDetacher.value();
    }
  };
  onUnmounted(() => {
    detacheTitle();
  });

  const loadTitle = () => {
    detacheTitle();
    titleDetacher.value = onSnapshot(
      query(
        collection(db, `restaurants/${restaurantId.value}/titles`),
        where("deletedFlag", "==", false)
      ),
      (title) => {
        if (!title.empty) {
          titles.value = title.docs.map(doc2data("title"));
        }
      }
    );
  };
  const titleLists = computed(() => {
    return titles.value.filter((title) => title.name !== "");
  });

  return {
    loadTitle,
    titles,
    titleLists,
  };
};

export const useCategory = (moPrefix: string) => {
  const categoryDetacher = ref();
  const detacheCategory = () => {
    if (categoryDetacher.value) {
      categoryDetacher.value();
    }
  };
  onUnmounted(() => {
    detacheCategory();
  });

  const categoryData = ref<DocumentData[]>([]);
  const loadCategory = () => {
    detacheCategory();
    categoryDetacher.value = onSnapshot(
      query(collection(db, `groups/${moPrefix}/category`)),
      (category) => {
        if (!category.empty) {
          // categoryData.value = category.docs.map(doc2data("category"))
          categoryData.value = category.docs
            .map((doc) => {
              return [
                doc2data("category")(doc),
                doc2data("category")(doc),
                doc2data("category")(doc),
                doc2data("category")(doc),
                doc2data("category")(doc),
                doc2data("category")(doc),
                doc2data("category")(doc),
                doc2data("category")(doc),
                doc2data("category")(doc),
                doc2data("category")(doc),
              ];
            })
            .flat();
        }
      },
      (error) => {
        console.log("load category error");
      }
    );
  };

  return {
    loadCategory,
    categoryData,
  };
};

export const useSubcategory = (moPrefix: string, category: Ref<string>) => {
  const subCategoryDetacher = ref();
  const detacheSubCategory = () => {
    if (subCategoryDetacher.value) {
      subCategoryDetacher.value();
    }
  };

  onUnmounted(() => {
    detacheSubCategory();
  });
  const subCategoryData = ref<DocumentData[]>([]);
  const loadSubcategory = () => {
    detacheSubCategory();
    console.log(`groups/${moPrefix}/category/${category.value}/subCategory`);
    subCategoryDetacher.value = onSnapshot(
      query(
        collection(
          db,
          `groups/${moPrefix}/category/${category.value}/subCategory`
        )
      ),
      (category) => {
        if (!category.empty) {
          subCategoryData.value = category.docs.map(doc2data("subCategory"));
          console.log(subCategoryData.value);
        }
      },
      (error) => {
        console.log("load subCategory error");
      }
    );
  };
  return {
    subCategoryData,
    loadSubcategory,
  };
};

export const useMenu = (
  restaurantId: Ref<string>,
  isInMo: Ref<string>,
  category: Ref<string>,
  subCategory: Ref<string>,
  groupData: any
) => {
  const menus = ref<DocumentData[]>([]);
  const menuCache: { [key: string]: any } = ref({});
  const menuDetacher = ref();
  const detacheMenu = () => {
    if (menuDetacher.value) {
      menuDetacher.value();
    }
  };
  const menuPath = computed(() => {
    if (isInMo.value && groupData?.restaurantId) {
      return `restaurants/${groupData.restaurantId}/menus`;
    }
    return `restaurants/${restaurantId.value}/menus`;
  });
  const setCache = (cache: any) => {
    menuCache.value = cache;
  };
  const loadMenu = () => {
    // TODO Cache for mo
    detacheMenu();
    if (isInMo.value && !category.value && !subCategory.value) {
      return;
    }
    const cacheKey =
      category.value && subCategory.value
        ? [category.value, subCategory.value].join("_")
        : "";
    if (menuCache.value[cacheKey]) {
      menus.value = menuCache.value[cacheKey];
      return;
    }

    const menuQuery =
      category.value && subCategory.value
        ? query(
            collection(db, menuPath.value),
            where("deletedFlag", "==", false),
            where("publicFlag", "==", true),
            where("category", "==", category.value),
            where("subCategory", "==", subCategory.value)
          )
        : query(
            collection(db, menuPath.value),
            where("deletedFlag", "==", false),
            where("publicFlag", "==", true)
          );

    menuDetacher.value = onSnapshot(query(menuQuery), (menu) => {
      if (!menu.empty) {
        menus.value = menu.docs
          .filter((a) => {
            const data = a.data();
            return data.validatedFlag === undefined || data.validatedFlag;
          })
          .map(doc2data("menu"));
        if (cacheKey) {
          menuCache.value[cacheKey] = menus.value;
        }
      }
    });
  };

  const menuObj = computed(() => {
    if (isInMo.value) {
      return array2obj(Object.values(menuCache.value).flat());
    }
    return array2obj(menus.value);
  });

  return {
    loadMenu,
    setCache,
    menus,
    menuObj,
    menuCache,
  };
};

export const useCategoryParams = (ctx: any) => {
  const category = computed(() => {
    return ctx.root.$route.params.category;
  });
  const subCategory = computed(() => {
    return ctx.root.$route.params.subCategory;
  });
  const watchCat = computed(() => {
    return [category.value, subCategory.value];
  });
  const hasCategory = computed(() => {
    return category.value && subCategory.value;
  });
  return {
    category,
    subCategory,
    watchCat,
    hasCategory,
  };
};