import { Button } from "@/components/ui/button";
import { useForgotPassword, useVerifyOTP } from "@/hooks/useAuthMutations";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import AuthLayout from "../../components/layout/AuthLayout";

export default function Verification() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(50);
  const inputs = useRef<(TextInput | null)[]>([]);

  const verifyOTPMutation = useVerifyOTP();
  const resendMutation = useForgotPassword();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join("");

    if (otp.length !== 4) {
      Alert.alert("Invalid Code", "Please enter the complete 4-digit code");
      return;
    }

    verifyOTPMutation.mutate(
      { email: email || "", otp },
      {
        onSuccess: (response) => {
          router.push({
            pathname: "/(auth)/reset-password",
            params: { resetToken: response.data.resetToken },
          });
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message ||
            "Invalid or expired code. Please try again.";
          Alert.alert("Verification Failed", message);
          setCode(["", "", "", ""]);
          inputs.current[0]?.focus();
        },
      },
    );
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;

    resendMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setTimer(50);
          Alert.alert("Code Sent", "A new verification code has been sent");
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message || "Failed to resend code";
          Alert.alert("Error", message);
        },
      },
    );
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <AuthLayout
      title="Verification"
      subtitle="We have sent a code to your email"
      showBackButton={false}
    >
      {/* Email Badge */}
      <View className="items-center mb-8">
        <View
          className="flex-row items-center bg-[#F6F8FA] px-4 py-2.5 rounded-2xl"
          style={{ borderWidth: 1, borderColor: "#F0F0F0" }}
        >
          <View className="w-7 h-7 bg-white rounded-lg items-center justify-center mr-2.5">
            <Mail color="#FF7622" size={14} />
          </View>
          <Text className="text-secondary font-sen-bold text-sm">
            {email || "example@gmail.com"}
          </Text>
        </View>
      </View>

      {/* OTP Input */}
      <View className="flex-row justify-between px-2 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className={`w-[65px] h-[65px] bg-[#F6F8FA] rounded-2xl justify-center items-center ${
              code[i] ? "" : ""
            }`}
            style={{
              borderWidth: code[i] ? 2 : 1,
              borderColor: code[i] ? "#FF7622" : "#F0F0F0",
              shadowColor: code[i] ? "#FF7622" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: code[i] ? 0.15 : 0,
              shadowRadius: 4,
              elevation: code[i] ? 3 : 0,
            }}
          >
            <TextInput
              ref={(ref) => {
                inputs.current[i] = ref;
              }}
              className="text-[26px] font-sen-extra-bold text-[#1E1E2E] w-full h-full text-center"
              maxLength={1}
              keyboardType="number-pad"
              value={code[i]}
              onChangeText={(text) => handleCodeChange(text, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              selectTextOnFocus
              editable={!verifyOTPMutation.isPending}
            />
          </View>
        ))}
      </View>

      {/* Resend */}
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-text-gray font-sen text-sm">
          Didn&apos;t receive a code?
        </Text>
        <View className="flex-row items-center">
          <Pressable
            onPress={handleResend}
            disabled={timer > 0 || resendMutation.isPending}
            className={`px-3 py-1.5 rounded-xl ${
              timer > 0 ? "bg-[#F6F8FA]" : "bg-[#FFF5EE]"
            }`}
            style={
              timer === 0
                ? { borderWidth: 1, borderColor: "#FFE5D3" }
                : undefined
            }
          >
            <Text
              className={`font-sen-bold text-sm ${
                timer > 0 || resendMutation.isPending
                  ? "text-text-gray"
                  : "text-primary"
              }`}
            >
              {timer > 0 ? `Resend (${timer}s)` : "Resend Code"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Verify Button */}
      <Button
        onPress={handleVerify}
        disabled={!isCodeComplete || verifyOTPMutation.isPending}
        className="h-[56px] bg-primary rounded-2xl"
        style={{
          shadowColor: "#FF7622",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isCodeComplete ? 0.3 : 0,
          shadowRadius: 8,
          elevation: isCodeComplete ? 6 : 0,
        }}
      >
        {verifyOTPMutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white text-sm font-sen-bold uppercase tracking-wider">
            VERIFY
          </Text>
        )}
      </Button>
    </AuthLayout>
  );
}
