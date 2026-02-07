import React from "react";
import { View, Image } from "react-native";
import BaseModal from "../components/modal/BaseModal";

export default function LoadingModal({ visible }) {
    return (
        <BaseModal hideCard
            visible={!!visible}
            title=""
            showClose={false}
            onRequestClose={() => {}}
            onBackdropPress={() => {}}
        >
            <View style={styles.overlay}>
                <Image
                    source={require("../assets/png/Loading.png")}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
        </BaseModal>
    );
}

const styles = {
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        width: 220,
        height: 220,
    },
};
