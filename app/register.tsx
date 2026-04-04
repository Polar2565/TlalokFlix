import { setToken } from "@/src/auth/session";
import { registerApi } from "@/src/services/auth.api";
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

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert("Registro", "Correo y contraseña son obligatorios.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Registro", "La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Registro", "Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      const response: any = await registerApi({
        email: cleanEmail,
        password,
        name: name.trim() || null,
      });

      // Si tu backend devuelve token al registrar → autologin
      if (response?.accessToken) {
        await setToken(response.accessToken);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Registro exitoso", "Ahora puedes iniciar sesión.");
        router.replace("/login");
      }
    } catch (error: any) {
      Alert.alert("Registro", error?.message || "Error al crear la cuenta");
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
          <Text style={s.subtitle}>Crea tu cuenta</Text>
        </View>

        <Text style={s.label}>Nombre (opcional)</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor="rgba(255,255,255,0.4)"
          autoCapitalize="words"
          style={s.input}
        />

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
        />

        <Text style={s.label}>Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          placeholderTextColor="rgba(255,255,255,0.4)"
          secureTextEntry
          autoCapitalize="none"
          style={s.input}
        />

        <Text style={s.label}>Confirmar contraseña</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="********"
          placeholderTextColor="rgba(255,255,255,0.4)"
          secureTextEntry
          autoCapitalize="none"
          style={[s.input, s.inputLast]}
        />

        <Pressable
          onPress={onRegister}
          disabled={loading}
          style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
        >
          <Text style={s.primaryBtnText}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={s.linkCenter}>
          <Text style={s.linkText}>
            ¿Ya tienes cuenta? <Text style={s.linkStrong}>Inicia sesión</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
