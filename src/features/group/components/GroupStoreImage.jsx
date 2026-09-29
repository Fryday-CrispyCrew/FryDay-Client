import React from "react";
import { Image } from "react-native";
import { groupStatusLabels } from "../lib/groupPresentation";

const STATUS_IMAGES = {
  BEFORE_OPEN: require("../assets/png/Group_1.png"),
  PREPARING: require("../assets/png/Group_2.png"),
  FRYING: require("../assets/png/Group_3.png"),
  CLOSED: require("../assets/png/Group_4.png"),
};

export default function GroupStoreImage({ status }) {
  const source = STATUS_IMAGES[status];
  if (!source) return null;
  return (
    <Image
      source={source}
      style={{ width: 120, height: 120 }}
      resizeMode="contain"
      accessibilityLabel={groupStatusLabels[status]}
    />
  );
}
