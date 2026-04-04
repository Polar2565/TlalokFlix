import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

type MovieCardProps = {
  title: string;
  poster: string | null;
  height?: number;
  onPress?: () => void;
};

export default function MovieCard({
  title,
  poster,
  height = 360,
  onPress,
}: MovieCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.posterWrap, { height }]}>
        {poster ? (
          <Image source={{ uri: poster }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.noPoster]}>
            <Text style={styles.noPosterText}>Sin imagen</Text>
          </View>
        )}
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
  },

  posterWrap: {
    width: "100%",
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  poster: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.surface2,
  },

  noPoster: {
    alignItems: "center",
    justifyContent: "center",
  },

  noPosterText: {
    color: theme.colors.textMuted,
    fontWeight: "800",
  },

  titleWrap: {
    paddingTop: 12,
    paddingHorizontal: 6,
  },

  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 24,
    minHeight: 48,
  },
});
