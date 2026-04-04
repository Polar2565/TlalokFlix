import {
  clearSession,
  getUser,
  getUserDisplayName,
  type AuthUser,
} from "@/src/auth/session";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

type Props = {
  title: string;
  subtitle?: string;
  rightText?: string;
  onRightPress?: () => void;

  showBack?: boolean;
  onBackPress?: () => void;

  userName?: string;
  onCatalogPress?: () => void;
  onFavoritesPress?: () => void;
  onLogoutPress?: () => void;
};

function cleanText(value?: string | null) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return text || "";
}

export default function AppHeader({
  title,
  subtitle,
  rightText,
  onRightPress,
  showBack = false,
  onBackPress,
  userName,
  onCatalogPress,
  onFavoritesPress,
  onLogoutPress,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const user = await getUser();
        if (!alive) return;
        setSessionUser(user);
      } catch {
        if (!alive) return;
        setSessionUser(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const safeUserName = useMemo(() => {
    const fromProp = cleanText(userName);
    if (fromProp) return fromProp;

    return getUserDisplayName(sessionUser);
  }, [userName, sessionUser]);

  const chipText = useMemo(() => {
    const fromRight = cleanText(rightText);
    if (fromRight) return fromRight;

    return safeUserName ? `Hola, ${safeUserName}` : "Cuenta";
  }, [rightText, safeUserName]);

  function handleBack() {
    if (onBackPress) {
      onBackPress();
      return;
    }

    router.back();
  }

  function handleRightPress() {
    if (onRightPress) {
      onRightPress();
      return;
    }

    setMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleCatalog() {
    closeMenu();

    if (onCatalogPress) {
      onCatalogPress();
      return;
    }

    router.push("/(tabs)" as any);
  }

  function handleFavorites() {
    closeMenu();

    if (onFavoritesPress) {
      onFavoritesPress();
      return;
    }

    router.push("/(tabs)/favorites" as any);
  }

  async function handleLogout() {
    closeMenu();

    if (onLogoutPress) {
      onLogoutPress();
      return;
    }

    await clearSession();
    router.replace("/login" as any);
  }

  return (
    <>
      <View style={styles.wrap}>
        <View style={styles.topRow}>
          <View style={styles.leftArea}>
            {showBack ? (
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
                hitSlop={10}
              >
                <Text style={styles.backIcon}>‹</Text>
              </Pressable>
            ) : (
              <View style={styles.leftPlaceholder} />
            )}
          </View>

          <Pressable
            onPress={handleRightPress}
            style={({ pressed }) => [
              styles.userChip,
              pressed && styles.userChipPressed,
            ]}
            hitSlop={10}
          >
            <View style={styles.userDot} />
            <Text style={styles.userText} numberOfLines={1}>
              {chipText}
            </Text>
            <Text style={styles.chev}>{menuOpen ? "▴" : "▾"}</Text>
          </Pressable>
        </View>

        <View style={styles.headerTextBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}

          <View style={styles.dividerWrap}>
            <View style={styles.divider} />
            <View style={styles.dividerSoft} />
          </View>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closeMenu} />

          <View style={styles.menuAnchor}>
            <Pressable style={styles.menuCard} onPress={() => {}}>
              <View style={styles.menuHeader}>
                <View style={styles.menuAvatar}>
                  <Text style={styles.menuAvatarText}>
                    {safeUserName?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </View>

                <View style={styles.menuHeaderText}>
                  <Text style={styles.menuUser} numberOfLines={1}>
                    {safeUserName}
                  </Text>

                  <Text style={styles.menuSub} numberOfLines={1}>
                    {sessionUser?.email || "Accesos rápidos"}
                  </Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={handleCatalog}
              >
                <Text style={styles.menuItemText}>Inicio</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={handleFavorites}
              >
                <Text style={styles.menuItemText}>Favoritos</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  styles.menuItemDanger,
                  pressed && styles.menuItemDangerPressed,
                ]}
                onPress={handleLogout}
              >
                <Text style={styles.menuItemDangerText}>Cerrar sesión</Text>
              </Pressable>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  leftArea: {
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  leftPlaceholder: {
    width: 40,
    height: 40,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  },

  backButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },

  backIcon: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 26,
    marginTop: -2,
  },

  userChip: {
    maxWidth: 220,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  },

  userChipPressed: {
    opacity: 0.94,
  },

  userDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    marginRight: 8,
  },

  userText: {
    flexShrink: 1,
    color: theme.colors.text,
    fontWeight: "800",
    marginRight: 6,
    fontSize: 13,
  },

  chev: {
    color: theme.colors.textMuted,
    fontWeight: "900",
    fontSize: 12,
  },

  headerTextBlock: {
    alignItems: "flex-start",
    marginTop: 2,
  },

  title: {
    color: theme.colors.text,
    fontSize: theme.font.h1 + 2,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  subtitle: {
    color: theme.colors.textMuted,
    marginTop: 8,
    fontSize: theme.font.body,
    lineHeight: 21,
    textAlign: "left",
    maxWidth: "92%",
  },

  dividerWrap: {
    marginTop: 14,
  },

  divider: {
    height: 4,
    width: 66,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    opacity: 1,
  },

  dividerSoft: {
    marginTop: 5,
    height: 2,
    width: 34,
    backgroundColor: "rgba(49, 195, 201, 0.35)",
    borderRadius: 999,
  },

  modalRoot: {
    flex: 1,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },

  menuAnchor: {
    paddingTop: theme.spacing.xl + 26,
    paddingRight: theme.spacing.lg,
    alignItems: "flex-end",
  },

  menuCard: {
    width: 286,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  menuAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(49, 195, 201, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(49, 195, 201, 0.28)",
    marginRight: 12,
  },

  menuAvatarText: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 18,
  },

  menuHeaderText: {
    flex: 1,
  },

  menuUser: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  menuSub: {
    marginTop: 3,
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  menuItem: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  menuItemPressed: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  menuItemText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  menuItemDanger: {
    backgroundColor: "rgba(120,18,38,0.14)",
  },

  menuItemDangerPressed: {
    backgroundColor: "rgba(120,18,38,0.24)",
  },

  menuItemDangerText: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: "900",
  },
});
