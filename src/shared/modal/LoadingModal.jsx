import React from "react";
import { View, Image } from "react-native";
import BaseModal from "../components/modal/BaseModal";

export default function LoadingModal({ visible }) {
    return (
        <BaseModal
            visible={!!visible}
            title=""
            showClose={false}
            onRequestClose={() => {}}
            onBackdropPress={() => {}}
        >
            <View style={styles.wrap}>
                <Image
                    source={require("../assets/png/loading-icon.png")}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
        </BaseModal>
    );
}

const styles = {
    wrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 4,
    },
    image: {
        width: 220,
        height: 220,
    },
};
