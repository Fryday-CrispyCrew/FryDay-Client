// src/features/todo/components/CharacterSkeleton.jsx
import React from "react";
import {View, StyleSheet} from "react-native";
import SkeletonBox from "../../../shared/components/SkeletonBox";

export default function CharacterSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBox width={140} height={32} borderRadius={14} />
      <View style={styles.characterArea}>
        <SkeletonBox width={140} height={140} borderRadius={70} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  characterArea: {
    alignItems: "center",
    justifyContent: "center",
  },
});
