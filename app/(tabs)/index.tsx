import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { clearSession, getUser } from "../../src/auth/session";
import { postJson } from "../../src/services/api.service";
import { homeStyles } from "../../src/styles/screens/home.styles";
import { theme } from "../../src/styles/theme";
import AppHeader from "../../src/ui/AppHeader";
import PrimaryButton from "../../src/ui/PrimaryButton";

type HomeGreetingResponse = {
  ok: boolean;
  data?: {
    greeting?: string;
    subtitle?: string;
    lead?: string;
  };
};

const tlalLogo = require("../../assets/images/tlal.png");

const quickMoods = [
  "Quiero distraerme",
  "Algo ligero",
  "Romántico",
  "Con energía",
  "Suspenso",
  "Sorpréndeme",
];

const quickActions = [
  {
    title: "Responder encuesta",
    description:
      "Cuéntanos tu ánimo actual para ajustar mejor la recomendación.",
    route: "/survey",
    accent: "#31c3c9",
  },
  {
    title: "Explorar catálogo",
    description:
      "Consulta fichas, trailers y opciones sugeridas por género o mood.",
    route: "/(tabs)/explore",
    accent: "#7dd3fc",
  },
  {
    title: "Mis favoritos",
    description:
      "Guarda recomendaciones para revisarlas después cuando tú quieras.",
    route: "/(tabs)/favorites",
    accent: "#f59e0b",
  },
];

const discoverCards = [
  {
    eyebrow: "Paso 1",
    title: "Empieza por cómo te sientes",
    text: "La encuesta nos ayuda a recomendarte algo más cercano a tu ánimo real.",
  },
  {
    eyebrow: "Paso 2",
    title: "Explora fichas y trailers",
    text: "Después podrás revisar detalles de cada película y ver su trailer antes de decidir.",
  },
  {
    eyebrow: "Paso 3",
    title: "Guarda lo que te interese",
    text: "Si una recomendación te llama la atención, puedes dejarla en favoritos para volver luego.",
  },
];

const HOME_FACTS = [
  "Dato cinéfilo: muchas escenas nocturnas clásicas se grababan de día.",
  "Dato cinéfilo: el cine mudo casi nunca se proyectaba en silencio total.",
  "Dato cinéfilo: el montaje puede cambiar por completo el ritmo de una escena.",
  "Dato cinéfilo: el sonido transformó para siempre la forma de contar historias.",
  "Dato cinéfilo: un buen póster puede definir la identidad de una película.",
  "Dato cinéfilo: la música suele guiar emociones incluso antes del diálogo.",
];

function normalizeText(value: unknown) {
  return String(value || "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[{}<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasChinese(text: string) {
  return /[\u4E00-\u9FFF]/.test(text);
}

function hasWeirdContent(text: string) {
  return [
    /tu name is/i,
    /your name/i,
    /placeholder/i,
    /student/i,
    /physics/i,
    /mental effort/i,
    /subsetsola/i,
    /universidad/i,
    /universitario/i,
    /estudiante/i,
    /física/i,
    /this series/i,
    /action\b/i,
    /undefined/i,
    /null/i,
    /\{.*\}/,
  ].some((rx) => rx.test(text));
}

function isValidShortSpanishText(value: unknown, maxLen: number) {
  const text = normalizeText(value);

  if (!text) return false;
  if (text.length > maxLen) return false;
  if (hasChinese(text)) return false;
  if (hasWeirdContent(text)) return false;

  return true;
}

function hashString(value: string) {
  return String(value || "")
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function pickHomeFact(name: string, hour: number) {
  const day = new Date().getDate();
  const index =
    (hashString(name) + Number(hour || 0) + day) % HOME_FACTS.length;
  return HOME_FACTS[index];
}

function getLocalGreeting(name: string) {
  const hour = new Date().getHours();
  const safeName = String(name || "").trim();

  let greeting = "Hola";

  if (hour < 12) {
    greeting = safeName ? `Buenos días, ${safeName}` : "Buenos días";
  } else if (hour < 19) {
    greeting = safeName ? `Hola, ${safeName}` : "Hola";
  } else {
    greeting = safeName ? `Qué tal, ${safeName}` : "Qué tal";
  }

  return {
    greeting,
    subtitle: "Dato cinéfilo",
    lead: pickHomeFact(safeName, hour),
  };
}

function sanitizeHomeResponse(
  raw: HomeGreetingResponse["data"] | undefined,
  fallback: { greeting: string; subtitle: string; lead: string },
) {
  return {
    greeting: isValidShortSpanishText(raw?.greeting, 28)
      ? normalizeText(raw?.greeting)
      : fallback.greeting,

    subtitle: isValidShortSpanishText(raw?.subtitle, 22)
      ? normalizeText(raw?.subtitle)
      : fallback.subtitle,

    lead: isValidShortSpanishText(raw?.lead, 110)
      ? normalizeText(raw?.lead)
      : fallback.lead,
  };
}

export default function HomeRoute() {
  const [displayName, setDisplayName] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroGreeting, setHeroGreeting] = useState("Hola");
  const [heroSubtitle, setHeroSubtitle] = useState("Dato cinéfilo");
  const [heroLead, setHeroLead] = useState(
    "Dato cinéfilo: la música en el cine puede cambiar por completo cómo se siente una escena.",
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      const u = await getUser();
      if (!alive) return;

      const name =
        (u?.name && u.name.trim()) || (u?.email ? u.email.split("@")[0] : "");

      setDisplayName(name);

      const localGreeting = getLocalGreeting(name);
      setHeroGreeting(localGreeting.greeting);
      setHeroSubtitle(localGreeting.subtitle);
      setHeroLead(localGreeting.lead);

      try {
        const data = await postJson<HomeGreetingResponse>(
          "/api/ai/home-greeting",
          {
            name,
            hour: new Date().getHours(),
          },
        );

        if (!alive) return;

        if (data?.ok) {
          const clean = sanitizeHomeResponse(data.data, localGreeting);
          setHeroGreeting(clean.greeting);
          setHeroSubtitle(clean.subtitle);
          setHeroLead(clean.lead);
        }
      } catch {}
    })();

    return () => {
      alive = false;
    };
  }, []);

  const headerUserText = useMemo(() => {
    return displayName ? `Hola, ${displayName}` : "Cuenta";
  }, [displayName]);

  async function onLogout() {
    setMenuOpen(false);
    await clearSession();
    router.replace("/login" as any);
  }

  function goTo(route: string) {
    router.push(route as any);
  }

  return (
    <View style={homeStyles.container}>
      <AppHeader
        title="TLÁLOCFLIX"
        subtitle="Películas que van con tu ánimo, en segundos"
        rightText={headerUserText}
        onRightPress={() => setMenuOpen(true)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ui.scrollContent}
      >
        <View style={ui.heroCard}>
          <View style={ui.glowOne} />
          <View style={ui.glowTwo} />

          <View style={ui.heroTopRow}>
            <View style={ui.brandWrap}>
              <View style={ui.logoBubble}>
                <Image
                  source={tlalLogo}
                  style={ui.logoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={ui.brandTextWrap}>
                <Text style={ui.kicker}>{heroSubtitle}</Text>
                <Text style={ui.greet}>{heroGreeting}</Text>
              </View>
            </View>

            <Pressable
              style={ui.catalogPill}
              onPress={() => goTo("/(tabs)/explore")}
            >
              <Text style={ui.catalogPillText}>Explorar</Text>
            </Pressable>
          </View>

          <Text style={ui.lead}>{heroLead}</Text>

          <View style={ui.mainButtonWrap}>
            <PrimaryButton
              label="¿Cómo te sientes?"
              onPress={() => goTo("/survey")}
            />
          </View>

          <Pressable
            style={ui.secondaryButton}
            onPress={() => goTo("/(tabs)/explore")}
          >
            <Text style={ui.secondaryButtonText}>
              Explorar catálogo y trailers
            </Text>
          </Pressable>

          <View style={ui.statsRow}>
            <View style={ui.statCard}>
              <Text style={ui.statLabel}>Primero</Text>
              <Text style={ui.statValue}>Cuéntanos tu mood actual</Text>
            </View>

            <View style={ui.statSpacer} />

            <View style={ui.statCard}>
              <Text style={ui.statLabel}>Después</Text>
              <Text style={ui.statValue}>
                Recibe recomendaciones y revisa trailers
              </Text>
            </View>
          </View>
        </View>

        <View style={ui.section}>
          <Text style={ui.sectionTitle}>¿Qué mood traes hoy?</Text>
          <Text style={ui.sectionText}>
            Elige una opción rápida o entra a la encuesta para afinar mejor la
            recomendación.
          </Text>

          <View style={ui.moodsWrap}>
            {quickMoods.map((mood) => (
              <Pressable
                key={mood}
                style={ui.moodChip}
                onPress={() => goTo("/survey")}
              >
                <Text style={ui.moodChipText}>{mood}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={ui.section}>
          <Text style={ui.sectionTitle}>Accesos rápidos</Text>

          <View style={ui.actionsGrid}>
            {quickActions.map((item) => (
              <Pressable
                key={item.title}
                style={ui.actionCard}
                onPress={() => goTo(item.route)}
              >
                <View
                  style={[
                    ui.actionAccent,
                    {
                      backgroundColor: item.accent,
                    },
                  ]}
                />
                <Text style={ui.actionTitle}>{item.title}</Text>
                <Text style={ui.actionDescription}>{item.description}</Text>
                <Text style={ui.actionLink}>Abrir</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={ui.section}>
          <Text style={ui.sectionTitle}>Cómo funciona</Text>

          {discoverCards.map((card) => (
            <Pressable
              key={card.title}
              style={ui.discoverCard}
              onPress={() => goTo("/survey")}
            >
              <Text style={ui.discoverEyebrow}>{card.eyebrow}</Text>
              <Text style={ui.discoverTitle}>{card.title}</Text>
              <Text style={ui.discoverText}>{card.text}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={ui.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={ui.menuCard}>
            <Text style={ui.menuTitle}>
              {displayName ? displayName : "Cuenta"}
            </Text>
            <Text style={ui.menuSub}>Accesos rápidos</Text>

            <View style={ui.menuDivider} />

            <Pressable
              style={ui.menuItem}
              onPress={() => {
                setMenuOpen(false);
                goTo("/(tabs)/explore");
              }}
            >
              <Text style={ui.menuItemText}>Explorar catálogo</Text>
            </Pressable>

            <View style={ui.menuDivider} />

            <Pressable
              style={ui.menuItem}
              onPress={() => {
                setMenuOpen(false);
                goTo("/(tabs)/favorites");
              }}
            >
              <Text style={ui.menuItemText}>Favoritos</Text>
            </Pressable>

            <View style={ui.menuDivider} />

            <Pressable
              style={ui.menuItem}
              onPress={() => {
                setMenuOpen(false);
                goTo("/survey");
              }}
            >
              <Text style={ui.menuItemText}>Responder encuesta</Text>
            </Pressable>

            <View style={ui.menuDivider} />

            <Pressable style={[ui.menuItem, ui.danger]} onPress={onLogout}>
              <Text style={[ui.menuItemText, ui.dangerText]}>
                Cerrar sesión
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const ui = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 34,
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 28,
    padding: 20,
    backgroundColor: "rgba(8, 25, 35, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(49, 195, 201, 0.18)",
    shadowColor: "#31c3c9",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  glowOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(49, 195, 201, 0.12)",
    top: -80,
    right: -60,
  },

  glowTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    bottom: -80,
    left: -50,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brandWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },

  logoBubble: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: "rgba(49, 195, 201, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(49, 195, 201, 0.32)",
    overflow: "hidden",
  },

  logoImage: {
    width: 56,
    height: 56,
  },

  brandTextWrap: {
    flex: 1,
  },

  kicker: {
    color: "#8fdde1",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    fontSize: 11,
    fontWeight: "900",
  },

  greet: {
    color: theme.colors.text,
    marginTop: 6,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },

  catalogPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  catalogPillText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 12,
  },

  lead: {
    color: theme.colors.textMuted,
    marginTop: 18,
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.96,
  },

  mainButtonWrap: {
    marginTop: 20,
  },

  secondaryButton: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(49, 195, 201, 0.28)",
    backgroundColor: "rgba(49, 195, 201, 0.08)",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#d9ffff",
    fontWeight: "800",
    fontSize: 14,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 18,
  },

  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  statSpacer: {
    width: 12,
  },

  statLabel: {
    color: "#8fdde1",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  statValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
    lineHeight: 18,
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: "900",
  },

  sectionText: {
    color: theme.colors.textMuted,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
  },

  moodsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    marginRight: -10,
  },

  moodChip: {
    marginRight: 10,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  moodChipText: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 13,
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },

  actionCard: {
    width: "48.4%",
    minHeight: 156,
    marginBottom: 12,
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(12, 27, 39, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  actionAccent: {
    width: 44,
    height: 5,
    borderRadius: 999,
    marginBottom: 14,
  },

  actionTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 19,
  },

  actionDescription: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    flex: 1,
  },

  actionLink: {
    color: "#8fdde1",
    fontWeight: "800",
    marginTop: 14,
    fontSize: 13,
  },

  discoverCard: {
    marginTop: 12,
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  discoverEyebrow: {
    color: "#8fdde1",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontWeight: "900",
  },

  discoverTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 8,
  },

  discoverText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 16,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },

  menuCard: {
    width: 260,
    marginTop: 86,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },

  menuTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
  },

  menuSub: {
    color: theme.colors.textMuted,
    paddingHorizontal: 14,
    paddingBottom: 10,
    fontSize: 12,
  },

  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.8,
  },

  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  menuItemText: {
    color: theme.colors.text,
    fontWeight: "800",
  },

  danger: {
    backgroundColor: "rgba(255,0,0,0.06)",
  },

  dangerText: {
    color: "#ff6b6b",
  },
});
