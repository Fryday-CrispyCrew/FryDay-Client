import { ScrollView, TouchableOpacity, View } from "react-native";
import AppText from "../../../../../shared/components/AppText";
import ChevronIcon from "../../../../../shared/components/ChevronIcon";

export default function CategorySelector({
  categories = [],
  draftCategoryId,
  categoryLabel = "카테고리",
  isCategoryOpen,
  setIsCategoryOpen,
  onPickCategory,
}) {
  const selectedCategory = categories.find(
    (s) => s.categoryId === draftCategoryId,
  );

  const otherCategories = categories
    .filter((s) => s.categoryId !== 0)
    .filter((s) => s.categoryId !== draftCategoryId);

  return (
    <TouchableOpacity
      onPress={() => setIsCategoryOpen(true)}
      disabled={isCategoryOpen}
      className="flex-row items-center gap-2 mb-3"
    >
      <View
        className="px-2.5 py-1.5 rounded-full"
        style={{ backgroundColor: selectedCategory?.color ?? "#FF5B22" }}
      >
        <AppText variant="M600" className="text-white">
          {selectedCategory?.label ?? categoryLabel}
        </AppText>
      </View>

      {!isCategoryOpen && (
        <ChevronIcon direction="right" size={14} strokeWidth={2.5} />
      )}

      {isCategoryOpen && (
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="always"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            gap: 8,
            paddingRight: 6,
          }}
        >
          {otherCategories.map((c) => (
            <TouchableOpacity
              key={c.categoryId}
              activeOpacity={0.7}
              onPress={() => onPickCategory(c.categoryId)}
              className="px-2.5 py-1.5 rounded-full bg-gray-100"
            >
              <AppText variant="M600" className="text-gr300">
                {c.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </TouchableOpacity>
  );
}
