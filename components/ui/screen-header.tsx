import { IconButton } from "@/components/ui/icon-button";
import { ProgressiveBlurHeader } from "@/components/ui/progressive-blur";
import { cn } from "@/lib/utils";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ScreenHeaderVariant = "plain" | "floating" | "large";

export type ScreenHeaderProps = {
  variant?: ScreenHeaderVariant;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Used by large/progressive-blur variant to fade in as content scrolls */
  scrollY?: SharedValue<number>;
  barHeight?: number;
  /** Centred vs leading title in plain variant */
  titleAlign?: "center" | "left";
};

export function ScreenHeader({
  variant = "plain",
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  rightElement,
  children,
  className,
  style,
  scrollY,
  barHeight = 56,
  titleAlign = "center",
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // 1. FLOATING VARIANT: Glass buttons directly over full-bleed hero images
  if (variant === "floating") {
    return (
      <View
        pointerEvents="box-none"
        className={cn(
          "absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-5",
          className,
        )}
        style={[
          {
            paddingTop: insets.top + 8,
          },
          style,
        ]}
      >
        {showBackButton ? (
          <IconButton
            icon={ArrowLeft01Icon}
            accessibilityLabel="Go back"
            onPress={handleBack}
          />
        ) : (
          <View className="w-11" />
        )}

        {children}

        {rightElement ? rightElement : <View className="w-11" />}
      </View>
    );
  }

  // 2. LARGE VARIANT: Tab roots with ProgressiveBlurHeader
  if (variant === "large") {
    return (
      <ProgressiveBlurHeader
        barHeight={barHeight}
        scrollY={scrollY}
        style={style}
        contentStyle={styles.largeContent}
      >
        {children ? (
          children
        ) : (
          <View className="px-5 w-full flex-row items-center justify-between">
            <View>
              {title && (
                <Text className="text-2xl font-display text-secondary">
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text className="text-xs font-body text-text-gray mt-0.5">
                  {subtitle}
                </Text>
              )}
            </View>
            {rightElement}
          </View>
        )}
      </ProgressiveBlurHeader>
    );
  }

  // 3. PLAIN VARIANT: Standard form and list screens
  return (
    <View
      className={cn(
        "bg-white border-b border-gray-100 px-5 pb-3 z-10",
        className,
      )}
      style={[
        {
          paddingTop: insets.top + 4,
        },
        style,
      ]}
    >
      <View className="flex-row items-center justify-between min-h-[44px]">
        {showBackButton ? (
          <IconButton
            icon={ArrowLeft01Icon}
            accessibilityLabel="Go back"
            onPress={handleBack}
          />
        ) : titleAlign === "center" ? (
          <View className="w-11" />
        ) : null}

        {title ? (
          <View
            className={cn(
              "flex-1 mx-2",
              titleAlign === "center" ? "items-center" : "items-start",
            )}
          >
            <Text
              numberOfLines={1}
              className="text-[17px] font-title text-secondary"
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                numberOfLines={1}
                className="text-[11px] font-body text-text-gray mt-0.5"
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : children ? (
          <View className="flex-1 mx-2">{children}</View>
        ) : null}

        {rightElement ? (
          <View className="flex-row items-center">{rightElement}</View>
        ) : titleAlign === "center" && showBackButton ? (
          <View className="w-11" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  largeContent: {
    justifyContent: "center",
  },
});
