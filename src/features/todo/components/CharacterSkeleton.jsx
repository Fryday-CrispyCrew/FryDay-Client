// src/features/todo/components/CharacterSkeleton.jsx
import React from "react";
import {View, StyleSheet} from "react-native";
import SkeletonBox from "../../../shared/components/SkeletonBox";

export default function CharacterSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.boxArea}>
        <SkeletonBox width={140} height={32} borderRadius={14} />
      </View>
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
    // borderWidth: 1,
  },
  boxArea: {
    position: "absolute",
    top: 0,
  },
  characterArea: {
    alignItems: "center",
    justifyContent: "center",
  },
});
