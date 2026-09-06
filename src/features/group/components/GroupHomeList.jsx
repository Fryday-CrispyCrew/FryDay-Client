import React from "react";
import { View } from "react-native";
import AppText from "../../../shared/components/AppText";
import GroupHomeCard from "./GroupHomeCard";

/**
 * "내 그룹 목록" 섹션. GroupHomeCard 를 map 으로 렌더.
 *
 * @prop {Array<{id: number|string, name: string, current: number, max: number}>} groups
 * @prop {(group) => void} onPressGroup
 */
export default function GroupHomeList({ groups = [], onPressGroup }) {
  return (
    <View style={{ alignSelf: "stretch" }}>
      <AppText variant="M500" className="text-gr500">
        내 그룹 목록
      </AppText>

      <View style={{ marginTop: 8, gap: 12 }}>
        {groups.map((g) => (
          <GroupHomeCard
            key={g.id}
            name={g.name}
            current={g.current}
            max={g.max}
            onPress={() => onPressGroup?.(g)}
          />
        ))}
      </View>
    </View>
  );
}
