import React, { useState } from "react";
import { View } from "react-native";
import GroupMemberCell from "./GroupMemberCell";
import DottedDivider from "./DottedDivider";

/**
 * 2열 그리드. 셀 사이/줄 사이에 점선 디바이더.
 * 캐릭터 그래픽은 부모가 illustration 슬롯으로 주입 (미주입 시 빈 상자).
 *
 * @prop {Array} members - [{ id, name, current, max, reactionLabel, reactionIcon }, ...]
 * @prop {(m) => void} onPressReaction
 */
export default function GroupMemberGrid({ members = [], onPressReaction }) {
  // 2개씩 묶어서 rows 구성
  const rows = [];
  for (let i = 0; i < members.length; i += 2) {
    rows.push([members[i], members[i + 1]]);
  }

  return (
    <View style={{ width: "100%" }}>
      {rows.map((row, rowIdx) => (
        <React.Fragment key={rowIdx}>
          <MemberRow row={row} onPressReaction={onPressReaction} />

          {/* 마지막 행 아래는 가로 점선 안 그림 */}
          {rowIdx < rows.length - 1 ? <StretchDottedH /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

function MemberRow({ row, onPressReaction }) {
  const [rowHeight, setRowHeight] = useState(0);

  return (
    <View
      style={{ flexDirection: "row", alignItems: "stretch" }}
      onLayout={(e) => setRowHeight(e.nativeEvent.layout.height)}
    >
      <View style={{ flex: 1 }}>
        {row[0] ? (
          <GroupMemberCell
            {...row[0]}
            onPressReaction={() =>
              onPressReaction && onPressReaction(row[0])
            }
          />
        ) : null}
      </View>

      {/* 세로 점선 */}
      <View style={{ width: 1, justifyContent: "center" }}>
        {rowHeight > 0 ? (
          <DottedDivider direction="vertical" length={rowHeight} />
        ) : null}
      </View>

      <View style={{ flex: 1 }}>
        {row[1] ? (
          <GroupMemberCell
            {...row[1]}
            onPressReaction={() =>
              onPressReaction && onPressReaction(row[1])
            }
          />
        ) : null}
      </View>
    </View>
  );
}

/**
 * 부모 폭 100% 로 stretch 되는 가로 점선.
 * (react-native-svg 는 width="100%" 를 안 받아서 onLayout 으로 잰다.)
 */
function StretchDottedH() {
  const [w, setW] = useState(0);
  return (
    <View
      style={{ width: "100%", height: 1 }}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
    >
      {w > 0 ? <DottedDivider direction="horizontal" length={w} /> : null}
    </View>
  );
}
