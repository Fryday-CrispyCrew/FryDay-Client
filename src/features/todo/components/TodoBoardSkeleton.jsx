// src/features/todo/components/TodoBoardSkeleton.jsx
import React from "react";
import {View, StyleSheet} from "react-native";
import SkeletonBox from "../../../shared/components/SkeletonBox";

function SkeletonTodoRow() {
  return (
    <View style={styles.todoRow}>
      <SkeletonBox width={12} height={16} borderRadius={3} />
      <SkeletonBox
        width={160}
        height={14}
        borderRadius={6}
        style={{marginLeft: 12}}
      />
      <View style={{flex: 1}} />
      <SkeletonBox width={24} height={24} borderRadius={12} />
    </View>
  );
}

function SkeletonCategorySection({todoCount = 3}) {
  return (
    <View>
      <SkeletonBox width={80} height={28} borderRadius={999} />
      <View style={styles.listArea}>
        {Array.from({length: todoCount}, (_, i) => (
          <SkeletonTodoRow key={i} />
        ))}
      </View>
    </View>
  );
}

export default function TodoBoardSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonCategorySection todoCount={3} />
      <SkeletonCategorySection todoCount={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
    gap: 24,
  },
  listArea: {
    marginTop: 10,
    gap: 8,
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 6,
  },
});
