import { createContext, useCallback, useContext, useEffect, useRef, type ComponentRef } from 'react';
import { Keyboard, Platform, type KeyboardEvent } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/**
 * Smooth, Expo-Go-compatible keyboard utilities.
 *
 * Everything here uses only React Native's `Keyboard` events + Reanimated, so it
 * works in Expo Go on Android edge-to-edge and iOS **without** any custom native
 * module / dev build (no `react-native-keyboard-controller`).
 */

/**
 * Animates the keyboard height so screens can glide content (inputs + action
 * buttons) above the keyboard. Uses `keyboardWillShow`/`keyboardWillHide` on iOS
 * and `keyboardDidShow`/`keyboardDidHide` on Android.
 *
 * @param extraOffset Base bottom padding kept when the keyboard is hidden.
 */
export function useAnimatedKeyboardHeight(extraOffset = 0) {
  const height = useSharedValue(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const animateTo = (toValue: number, duration?: number) => {
      const safeDuration = duration && duration > 0 ? duration : 220;
      height.value = withTiming(toValue, {
        duration: safeDuration,
        easing: Easing.out(Easing.ease),
      });
    };

    const showSub = Keyboard.addListener(showEvent, (event: KeyboardEvent) => {
      animateTo(event.endCoordinates?.height ?? 0, event.duration);
    });
    const hideSub = Keyboard.addListener(hideEvent, (event: KeyboardEvent) => {
      animateTo(0, event.duration);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [height]);

  /** Animated `paddingBottom` equal to the keyboard height (+ `extraOffset`). */
  const paddingStyle = useAnimatedStyle(() => ({
    paddingBottom: height.value + extraOffset,
  }));

  /** Animated upward lift (negative translation) equal to the keyboard height. */
  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -height.value }],
  }));

  /** Animated spacer height equal to the keyboard height on Android (iOS handles insets natively). */
  const keyboardSpacerStyle = useAnimatedStyle(() => ({
    height: Platform.OS === 'android' ? height.value : 0,
  }));

  return { height, paddingStyle, liftStyle, keyboardSpacerStyle };
}

// ---------------------------------------------------------------------------
// Keyboard-aware scrolling (keeps the focused TextInput visible on Android)
// ---------------------------------------------------------------------------

interface KeyboardScrollResponder {
  scrollResponderScrollNativeHandleToKeyboard?: (
    nodeHandle: number,
    additionalOffset?: number,
    preventNegativeScrollOffset?: boolean
  ) => void;
}

/**
 * Scroll the enclosing scroll view so the given input (native tag) sits above
 * the keyboard. `null` is provided outside a `<Screen />`.
 */
export type SetFocusedInput = (target: number | null) => void;

export const KeyboardScrollContext = createContext<SetFocusedInput | null>(null);

/** Register/scroll the focused input's native tag (used by `TextField`). */
export function useKeyboardScrollTarget(): SetFocusedInput | null {
  return useContext(KeyboardScrollContext);
}

/**
 * Scrollable-screen helper: exposes a `scrollRef` to attach to the ScrollView and
 * a `setFocusedInput` callback to publish from an input's `onFocus`. On Android
 * (where the keyboard height is only known once fully shown) the focused input is
 * re-scrolled on `keyboardDidShow`.
 */
export function useKeyboardAwareScroll() {
  const scrollRef = useRef<ComponentRef<typeof Animated.ScrollView>>(null);
  const focusedRef = useRef<number | null>(null);

  const scrollToFocused = useCallback(() => {
    const target = focusedRef.current;
    if (target == null) return;
    const responder = scrollRef.current?.getScrollResponder() as unknown as
      | KeyboardScrollResponder
      | undefined;
    responder?.scrollResponderScrollNativeHandleToKeyboard?.(target, 96, true);
  }, []);

  const setFocusedInput = useCallback<SetFocusedInput>(
    (target) => {
      focusedRef.current = target;
      if (target != null) scrollToFocused();
    },
    [scrollToFocused]
  );

  useEffect(() => {
    if (Platform.OS === 'ios') return;
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      requestAnimationFrame(scrollToFocused);
    });
    return () => sub.remove();
  }, [scrollToFocused]);

  return { scrollRef, setFocusedInput };
}
