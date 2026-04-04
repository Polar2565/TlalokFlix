import { theme } from "@/src/styles/theme";
import { router } from "expo-router";
import React from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

export default function PrivacyModal() {
  const c = theme.colors;
  const { width, height } = useWindowDimensions();

  // Card responsive (mobile + web/desktop)
  const maxCardWidth = Math.min(920, Math.max(320, width - 32));
  const maxCardHeight = Math.min(height - 80, 780);

  return (
    <View style={{ flex: 1 }}>
      {/* Backdrop (tap to close) */}
      <Pressable
        onPress={() => router.back()}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
        }}
      />

      {/* Center container */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        {/* Modal card */}
        <View
          style={{
            width: "100%",
            maxWidth: maxCardWidth,
            maxHeight: maxCardHeight,
            backgroundColor: c.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.10)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.08)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: c.text, fontSize: 16, fontWeight: "900" }}>
                Aviso de Privacidad
              </Text>
              <Text style={{ color: c.textMuted, fontSize: 12 }}>
                TLÁLOCFLIX – Privacidad y uso de datos
              </Text>
            </View>

            <Pressable
              onPress={() => router.back()}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.14)",
              }}
            >
              <Text style={{ color: c.primary, fontWeight: "900" }}>
                Cerrar
              </Text>
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView
            contentContainerStyle={{ padding: 16, gap: 12 }}
            showsVerticalScrollIndicator
          >
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>
              TLÁLOCFLIX – Aviso de Privacidad
            </Text>

            <Text style={{ color: c.textMuted, lineHeight: 20 }}>
              En cumplimiento con lo dispuesto por la Ley Federal de Protección
              de Datos Personales en Posesión de los Particulares y demás
              normativa aplicable en México, TLÁLOCFLIX, en su carácter de
              responsable del tratamiento de datos personales, informa a los
              usuarios de la aplicación sobre el uso, protección y condiciones
              bajo las cuales se recaba y trata la información.
            </Text>

            <Text style={{ color: c.textMuted, lineHeight: 20 }}>
              Los datos personales que podrán recabarse para el funcionamiento
              de la aplicación incluyen correo electrónico, nombre (opcional) y
              preferencias de uso dentro de TLÁLOCFLIX. La información es
              proporcionada directamente por el titular al registrarse o iniciar
              sesión. TLÁLOCFLIX no solicita ni requiere datos personales
              sensibles para operar.
            </Text>

            <Text style={{ color: c.textMuted, lineHeight: 20 }}>
              Los datos personales serán tratados para finalidades relacionadas
              con la operación de la cuenta y la experiencia del usuario, tales
              como crear y administrar el acceso, permitir el inicio de sesión
              de forma segura, personalizar el contenido y recomendaciones, así
              como mejorar el rendimiento, estabilidad y funcionalidades de la
              aplicación. El tratamiento de datos se realizará conforme a los
              principios aplicables en México, incluyendo licitud,
              consentimiento, información, calidad, finalidad, lealtad,
              proporcionalidad y responsabilidad.
            </Text>

            <Text style={{ color: c.textMuted, lineHeight: 20 }}>
              TLÁLOCFLIX no transferirá datos personales a terceros sin el
              consentimiento del titular, salvo las excepciones previstas en la
              legislación aplicable. Para proteger la información, se aplican
              medidas de seguridad administrativas, técnicas y físicas
              orientadas a prevenir pérdida, daño, alteración, destrucción, uso,
              acceso o tratamiento no autorizado. Entre dichas medidas se
              incluyen el resguardo seguro de credenciales mediante técnicas de
              hash y el uso de mecanismos de autenticación por token.
            </Text>

            <Text style={{ color: c.textMuted, lineHeight: 20 }}>
              El titular de los datos personales podrá ejercer sus derechos de
              Acceso, Rectificación, Cancelación y Oposición (Derechos ARCO),
              así como solicitar la revocación de su consentimiento o la
              limitación del uso o divulgación de sus datos, mediante una
              solicitud enviada al correo de contacto: soporte@tlalokflix.com.
              La solicitud deberá indicar la petición de manera clara para su
              atención.
            </Text>

            <Text style={{ color: c.textMuted, lineHeight: 20 }}>
              Cualquier modificación al presente Aviso de Privacidad se dará a
              conocer a través de la propia aplicación. Al registrarse o
              utilizar TLÁLOCFLIX, el usuario reconoce haber puesto a su
              disposición este Aviso de Privacidad y acepta el tratamiento de
              sus datos personales conforme a las finalidades aquí descritas.
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 12,
                marginTop: 6,
              }}
            >
              Última actualización: 2026-02-16
            </Text>

            {/* Action button */}
            <Pressable
              onPress={() => router.back()}
              style={{
                marginTop: 4,
                backgroundColor: c.primary,
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#0b1220", fontWeight: "900" }}>
                Entendido
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
