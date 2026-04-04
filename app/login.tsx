import { setToken, setUser } from "@/src/auth/session";
import { loginApi } from "@/src/services/auth.api";
import { loginStyles as s } from "@/src/styles/screens/login.styles";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert("Login", "Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginApi(cleanEmail, cleanPassword);

      if (!response?.accessToken || !response?.user) {
        throw new Error("Respuesta inválida del servidor");
      }

      await setToken(response.accessToken);
      await setUser(response.user);

      setEmail("");
      setPassword("");

      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login", error?.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={s.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.card}>
        <View style={s.header}>
          <Image
            source={require("../assets/images/tlal.png")}
            style={s.logo}
            resizeMode="contain"
          />
          <Text style={s.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <Text style={s.label}>Correo</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="rgba(255,255,255,0.4)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          style={s.input}
          editable={!loading}
        />

        <Text style={s.label}>Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          placeholderTextColor="rgba(255,255,255,0.4)"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          style={[s.input, s.inputLast]}
          editable={!loading}
        />

        <Pressable
          onPress={onLogin}
          disabled={loading}
          style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
        >
          <Text style={s.primaryBtnText}>
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </Pressable>

        <View style={s.linksWrap}>
          <Pressable
            onPress={() => router.push("/register" as any)}
            style={s.linkCenter}
            disabled={loading}
          >
            <Text style={s.linkText}>
              ¿No tienes cuenta? <Text style={s.linkStrong}>Crear cuenta</Text>
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/privacy-modal" as any)}
            style={s.linkCenter}
            disabled={loading}
          >
            <Text style={s.linkText}>Aviso de privacidad y uso de datos</Text>
          </Pressable>

          <Text style={s.legal}>
            Al iniciar sesión aceptas el tratamiento de tus datos conforme al
            aviso de privacidad.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
