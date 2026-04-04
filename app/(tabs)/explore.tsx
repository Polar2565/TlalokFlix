import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { clearSession, getUser } from "../../src/auth/session";
import {
  Genre,
  Movie,
  MoviesPage,
  moviesService,
} from "../../src/services/movies.service";
import { theme } from "../../src/styles/theme";
import AppHeader from "../../src/ui/AppHeader";

function mergeUniqueMovies(current: Movie[], incoming: Movie[]) {
  const map = new Map<string, Movie>();

  for (const movie of current) map.set(String(movie.id), movie);
  for (const movie of incoming) map.set(String(movie.id), movie);

  return Array.from(map.values());
}

export default function ExploreRoute() {
  const [displayName, setDisplayName] = useState<string>("");

  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenreId, setActiveGenreId] = useState<number | null>(null);

  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const reqIdRef = useRef(0);

  const isSearching = query.trim().length > 0;

  useEffect(() => {
    let alive = true;

    (async () => {
      const u = await getUser();
      if (!alive) return;

      const name =
        (u?.name && u.name.trim()) || (u?.email ? u.email.split("@")[0] : "");

      setDisplayName(name);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const headerUserText = useMemo(() => {
    return displayName ? `Hola, ${displayName}` : "Cuenta";
  }, [displayName]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const g = await moviesService.getGenres();
        if (!alive) return;
        setGenres(g || []);
      } catch {}

      try {
        const myReq = ++reqIdRef.current;
        setLoading(true);
        setError(null);

        const first = await moviesService.getPopularPage(1);
        if (!alive || myReq !== reqIdRef.current) return;

        let mergedItems = first.items;
        let currentPage = first.page;
        let currentTotalPages = first.totalPages;

        if (first.totalPages > 1) {
          const second = await moviesService.getPopularPage(2);
          if (!alive || myReq !== reqIdRef.current) return;

          mergedItems = mergeUniqueMovies(mergedItems, second.items);
          currentPage = second.page;
          currentTotalPages = second.totalPages;
        }

        setItems(mergedItems);
        setPage(currentPage);
        setTotalPages(currentTotalPages);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Error cargando recomendaciones");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const q = query.trim();
    const handle = setTimeout(
      () => {
        const myReq = ++reqIdRef.current;

        (async () => {
          try {
            setLoading(true);
            setError(null);

            let firstPage: MoviesPage;

            if (q) {
              firstPage = await moviesService.searchMoviesPage(q, 1);
            } else if (activeGenreId != null) {
              firstPage = await moviesService.discoverByGenrePage(
                activeGenreId,
                1,
              );
            } else {
              firstPage = await moviesService.getPopularPage(1);
            }

            if (myReq !== reqIdRef.current) return;

            let mergedItems = firstPage.items;
            let currentPage = firstPage.page;
            let currentTotalPages = firstPage.totalPages;

            const shouldPreloadSecondPage = !q && firstPage.totalPages > 1;

            if (shouldPreloadSecondPage) {
              let secondPage: MoviesPage;

              if (activeGenreId != null) {
                secondPage = await moviesService.discoverByGenrePage(
                  activeGenreId,
                  2,
                );
              } else {
                secondPage = await moviesService.getPopularPage(2);
              }

              if (myReq !== reqIdRef.current) return;

              mergedItems = mergeUniqueMovies(mergedItems, secondPage.items);
              currentPage = secondPage.page;
              currentTotalPages = secondPage.totalPages;
            }

            setItems(mergedItems);
            setPage(currentPage);
            setTotalPages(currentTotalPages);
          } catch (e: any) {
            if (myReq !== reqIdRef.current) return;
            setError(e?.message ?? "Error cargando recomendaciones");
            setItems([]);
            setPage(1);
            setTotalPages(1);
          } finally {
            if (myReq !== reqIdRef.current) return;
            setLoading(false);
          }
        })();
      },
      q ? 450 : 0,
    );

    return () => clearTimeout(handle);
  }, [query, activeGenreId]);

  const activeGenreName = useMemo(() => {
    if (activeGenreId == null) return "Todo";
    return genres.find((g) => g.id === activeGenreId)?.name ?? "Categoría";
  }, [activeGenreId, genres]);

  const subtitle = useMemo(() => {
    const q = query.trim();

    if (q) return `Resultados para: ${q}`;

    return activeGenreId == null
      ? "Explora recomendaciones, fichas y trailers"
      : `Género: ${activeGenreName}`;
  }, [query, activeGenreId, activeGenreName]);

  function pickGenre(id: number | null) {
    if (isSearching) return;
    setActiveGenreId(id);
    setCategoryMenuOpen(false);
  }

  function getMovieMeta(movie: Movie) {
    const rawRating = Number((movie as any)?.rating ?? 0);
    const year = String((movie as any)?.year || "").trim();

    if (rawRating > 0 && year) return `${year} • ${rawRating.toFixed(1)}`;
    if (rawRating > 0) return `Puntuación ${rawRating.toFixed(1)}`;
    if (year) return year;

    return "Abrir ficha";
  }

  async function onLogout() {
    setAccountMenuOpen(false);
    await clearSession();
    router.replace("/login" as any);
  }

  async function loadMore() {
    if (loading || loadingMore) return;
    if (page >= totalPages) return;

    const nextPage = page + 1;
    const q = query.trim();

    setLoadingMore(true);

    try {
      let nextData: MoviesPage;

      if (q) {
        nextData = await moviesService.searchMoviesPage(q, nextPage);
      } else if (activeGenreId != null) {
        nextData = await moviesService.discoverByGenrePage(
          activeGenreId,
          nextPage,
        );
      } else {
        nextData = await moviesService.getPopularPage(nextPage);
      }

      setItems((prev) => mergeUniqueMovies(prev, nextData.items));
      setPage(nextData.page);
      setTotalPages(nextData.totalPages);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando más recomendaciones");
    } finally {
      setLoadingMore(false);
    }
  }

  function renderCompactToolbar() {
    return (
      <View style={styles.toolbarBlock}>
        <View style={styles.topRow}>
          <View style={styles.searchWrap}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Busca una película o título"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />

            {query.trim().length > 0 ? (
              <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
                <Text style={styles.clearText}>×</Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={() => setCategoryMenuOpen(true)}
            disabled={isSearching}
            style={[styles.filterBtn, isSearching && styles.filterBtnDisabled]}
          >
            <Text style={styles.filterBtnText} numberOfLines={1}>
              {isSearching ? "Filtro" : activeGenreName}
            </Text>
            <Text style={styles.filterBtnArrow}>▾</Text>
          </Pressable>
        </View>

        <View style={styles.compactInfoRow}>
          <View style={styles.miniChip}>
            <Text style={styles.miniChipText}>Fichas y trailers</Text>
          </View>

          {isSearching ? (
            <View style={styles.miniChip}>
              <Text style={styles.miniChipMuted}>Búsqueda activa</Text>
            </View>
          ) : (
            <View style={styles.miniChip}>
              <Text style={styles.miniChipMuted}>{activeGenreName}</Text>
            </View>
          )}

          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{items.length}</Text>
          </View>
        </View>
      </View>
    );
  }

  function renderFooter() {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.footerText}>Cargando más películas…</Text>
        </View>
      );
    }

    if (page < totalPages) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.footerHint}>Sigue bajando para ver más</Text>
        </View>
      );
    }

    return (
      <View style={styles.footerLoader}>
        <Text style={styles.footerHint}>Ya no hay más resultados</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Explorar"
        subtitle={subtitle}
        rightText={headerUserText}
        onRightPress={() => setAccountMenuOpen(true)}
      />

      {loading ? (
        <View style={styles.stateWrap}>
          {renderCompactToolbar()}
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.muted}>Cargando recomendaciones…</Text>
          </View>
        </View>
      ) : error ? (
        <View style={styles.stateWrap}>
          {renderCompactToolbar()}
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>
            <Text style={styles.muted}>
              Revisa tu conexión e intenta nuevamente.
            </Text>
          </View>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.stateWrap}>
          {renderCompactToolbar()}
          <View style={styles.center}>
            <Text style={styles.muted}>No encontramos resultados.</Text>
            <Text style={styles.mutedSmall}>
              Intenta con otro nombre o cambia el género.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(m) => String(m.id)}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={styles.list}
          onEndReachedThreshold={0.45}
          onEndReached={loadMore}
          ListHeaderComponent={renderCompactToolbar}
          ListFooterComponent={renderFooter}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/movie/${item.id}` as any)}
              style={styles.card}
            >
              <View style={styles.posterWrap}>
                {item.poster ? (
                  <Image source={{ uri: item.poster }} style={styles.poster} />
                ) : (
                  <View style={[styles.poster, styles.noPoster]}>
                    <Text style={styles.noPosterText}>Sin imagen</Text>
                  </View>
                )}

                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>Ficha / trailer</Text>
                </View>
              </View>

              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={styles.meta} numberOfLines={1}>
                {getMovieMeta(item)}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Modal
        visible={categoryMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryMenuOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setCategoryMenuOpen(false)}
        />

        <View style={styles.drawer}>
          <View style={styles.drawerTop}>
            <Text style={styles.drawerTitle}>Géneros</Text>
            <Pressable
              onPress={() => setCategoryMenuOpen(false)}
              style={styles.drawerClose}
            >
              <Text style={styles.drawerCloseText}>×</Text>
            </Pressable>
          </View>

          <Text style={styles.drawerIntro}>
            Filtra recomendaciones por género cuando no tengas una búsqueda
            activa.
          </Text>

          <Pressable
            onPress={() => pickGenre(null)}
            style={[
              styles.drawerItem,
              activeGenreId == null && styles.drawerItemActive,
              isSearching && styles.drawerItemDisabled,
            ]}
          >
            <Text
              style={[
                styles.drawerItemText,
                activeGenreId == null && styles.drawerItemTextActive,
                isSearching && styles.drawerItemTextDisabled,
              ]}
            >
              Todo
            </Text>
          </Pressable>

          {genres.map((g) => {
            const active = activeGenreId === g.id;

            return (
              <Pressable
                key={g.id}
                onPress={() => pickGenre(g.id)}
                style={[
                  styles.drawerItem,
                  active && styles.drawerItemActive,
                  isSearching && styles.drawerItemDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.drawerItemText,
                    active && styles.drawerItemTextActive,
                    isSearching && styles.drawerItemTextDisabled,
                  ]}
                >
                  {g.name}
                </Text>
              </Pressable>
            );
          })}

          {isSearching ? (
            <View style={styles.drawerHint}>
              <Text style={styles.drawerHintText}>
                Primero limpia la búsqueda para volver a usar categorías.
              </Text>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={accountMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountMenuOpen(false)}
      >
        <Pressable
          style={styles.accountBackdrop}
          onPress={() => setAccountMenuOpen(false)}
        >
          <View style={styles.accountCard}>
            <Text style={styles.accountTitle}>
              {displayName ? displayName : "Cuenta"}
            </Text>
            <Text style={styles.accountSub}>Accesos rápidos</Text>

            <View style={styles.accountDivider} />

            <Pressable
              style={styles.accountItem}
              onPress={() => {
                setAccountMenuOpen(false);
                router.push("/(tabs)" as any);
              }}
            >
              <Text style={styles.accountItemText}>Inicio</Text>
            </Pressable>

            <View style={styles.accountDivider} />

            <Pressable
              style={styles.accountItem}
              onPress={() => {
                setAccountMenuOpen(false);
                router.push("/survey" as any);
              }}
            >
              <Text style={styles.accountItemText}>Responder encuesta</Text>
            </Pressable>

            <View style={styles.accountDivider} />

            <Pressable
              style={styles.accountItem}
              onPress={() => {
                setAccountMenuOpen(false);
                router.push("/(tabs)/favorites" as any);
              }}
            >
              <Text style={styles.accountItemText}>Favoritos</Text>
            </Pressable>

            <View style={styles.accountDivider} />

            <Pressable
              style={[styles.accountItem, styles.danger]}
              onPress={onLogout}
            >
              <Text style={[styles.accountItemText, styles.dangerText]}>
                Cerrar sesión
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  stateWrap: {
    flex: 1,
  },

  toolbarBlock: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 8,
    paddingBottom: 12,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  searchWrap: {
    flex: 1,
    position: "relative",
    marginRight: 10,
  },

  searchInput: {
    height: 50,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 42,
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 14,
  },

  clearBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  clearText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 18,
    marginTop: -1,
  },

  filterBtn: {
    height: 50,
    minWidth: 94,
    maxWidth: 118,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  filterBtnDisabled: {
    opacity: 0.55,
  },

  filterBtnText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 13,
    maxWidth: 72,
  },

  filterBtnArrow: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginLeft: 6,
    fontWeight: "900",
  },

  compactInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  miniChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  miniChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  miniChipMuted: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },

  countChip: {
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(37,199,193,0.10)",
    borderWidth: 1,
    borderColor: "rgba(37,199,193,0.18)",
  },

  countChipText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  muted: {
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 10,
  },

  mutedSmall: {
    color: theme.colors.textMuted,
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
  },

  error: {
    color: theme.colors.primary,
    textAlign: "center",
    paddingHorizontal: 20,
    fontWeight: "800",
  },

  list: {
    paddingBottom: theme.spacing.xl,
    paddingTop: 2,
    paddingHorizontal: theme.spacing.lg,
  },

  columnWrap: {
    justifyContent: "space-between",
    marginBottom: 14,
  },

  card: {
    width: "48.2%",
  },

  posterWrap: {
    position: "relative",
  },

  poster: {
    width: "100%",
    height: 248,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
  },

  noPoster: {
    alignItems: "center",
    justifyContent: "center",
  },

  noPosterText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },

  cardBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(5,18,24,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  cardBadgeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: "800",
  },

  title: {
    color: theme.colors.text,
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    minHeight: 36,
  },

  meta: {
    color: theme.colors.textMuted,
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },

  footerLoader: {
    paddingTop: 10,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  footerText: {
    marginTop: 8,
    color: theme.colors.textMuted,
    fontWeight: "700",
  },

  footerHint: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },

  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 320,
    maxWidth: "86%",
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.10)",
    padding: 14,
    paddingTop: 18,
  },

  drawerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
    marginBottom: 10,
  },

  drawerTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
  },

  drawerClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  drawerCloseText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 18,
  },

  drawerIntro: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },

  drawerItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    marginBottom: 8,
  },

  drawerItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: "rgba(0,0,0,0)",
  },

  drawerItemDisabled: {
    opacity: 0.45,
  },

  drawerItemText: {
    color: theme.colors.text,
    fontWeight: "800",
  },

  drawerItemTextActive: {
    color: "#0b1220",
    fontWeight: "900",
  },

  drawerItemTextDisabled: {
    color: theme.colors.textMuted,
  },

  drawerHint: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  drawerHintText: {
    color: theme.colors.textMuted,
    fontWeight: "700",
    fontSize: 12,
  },

  accountBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 16,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },

  accountCard: {
    width: 260,
    marginTop: 86,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },

  accountTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
  },

  accountSub: {
    color: theme.colors.textMuted,
    paddingHorizontal: 14,
    paddingBottom: 10,
    fontSize: 12,
  },

  accountDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.8,
  },

  accountItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  accountItemText: {
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
