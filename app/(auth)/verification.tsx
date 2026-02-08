import { Button } from "@/components/ui/button";
import { useForgotPassword, useVerifyOTP } from "@/hooks/useAuthMutations";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
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
          // Navigate to reset password with resetToken
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
          // Clear code on error
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
      <View className="items-center mb-8">
        <Text className="text-[#32343E] font-sen-bold text-[14px]">
          {email || "example@gmail.com"}
        </Text>
      </View>

      <View className="flex-row justify-between px-2 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className={`w-[65px] h-[65px] bg-[#F0F5FA] rounded-[10px] justify-center items-center ${
              code[i] ? "border-2 border-primary" : "border border-transparent"
            }`}
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

      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-[#32343E] font-sen text-[14px] opacity-60">
          I didn&apos;t receive a code?
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleResend}
            disabled={timer > 0 || resendMutation.isPending}
          >
            <Text
              className={`font-sen-bold text-[14px] ${
                timer > 0 || resendMutation.isPending
                  ? "text-[#A0A5BA]"
                  : "text-primary underline"
              }`}
            >
              Resend Code
            </Text>
          </TouchableOpacity>
          {timer > 0 && (
            <Text className="text-[#32343E] font-sen text-[14px] ml-1">
              ({timer}s)
            </Text>
          )}
        </View>
      </View>

      <Button
        onPress={handleVerify}
        disabled={!isCodeComplete || verifyOTPMutation.isPending}
        className="h-[62px] bg-primary"
      >
        {verifyOTPMutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white text-[14px] font-sen-bold uppercase tracking-wider">
            VERIFY
          </Text>
        )}
      </Button>
    </AuthLayout>
  );
}
