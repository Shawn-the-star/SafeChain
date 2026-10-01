import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  SafeAreaView,
} from "react-native";

import { triggerSOS } from "../services/sosService";

const SOS_CODE = "2580";
const APP_CODE = "7391";

export default function CalculatorScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");

  // Responsive button sizing
  const horizontalPadding = Math.max(18, width * 0.055);
  const gap = Math.max(8, width * 0.025);
  const buttonSize =
    (width - horizontalPadding * 2 - gap * 3) / 4;

  const handleNumber = (number) => {
    if (display === "Error") {
      setDisplay(number);
      return;
    }

    if (display.length >= 12) return;

    // Prevent multiple decimal points
    if (number === "." && display.includes(".")) return;

    if (display === "0" && number !== ".") {
      setDisplay(number);
    } else {
      setDisplay(display + number);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
  };

  const calculateExpression = () => {
    try {
      if (!expression) return;

      const fullExpression = expression + display;

      // Only allow calculator characters
      if (!/^[0-9+\-*/. ]+$/.test(fullExpression)) {
        return;
      }

      const result = eval(fullExpression);

      if (typeof result === "number" && Number.isFinite(result)) {
        setDisplay(String(result));
        setExpression("");
      }
    } catch (error) {
      setDisplay("Error");
      setExpression("");
    }
  };

  const checkSecretCode = async () => {
    const enteredCode = display;

    // Hidden SOS code
    if (enteredCode === SOS_CODE) {
      try {
        await triggerSOS();

        Alert.alert(
          "SOS Activated",
          "Emergency SOS has been activated."
        );

        setDisplay("0");
        setExpression("");
      } catch (error) {
        console.log("SOS activation error:", error);

        Alert.alert(
          "SOS Error",
          "Unable to activate SOS."
        );
      }

      return;
    }

    // Hidden app access code
    if (enteredCode === APP_CODE) {
      setDisplay("0");
      setExpression("");

      navigation.replace("MainTabs");

      return;
    }

    calculateExpression();
  };

  const handleOperator = (operator) => {
    if (display === "Error") {
      setDisplay("0");
      setExpression("");
      return;
    }

    // If an operator was already entered,
    // replace it instead of creating something like 5++.
    if (expression) {
      const lastCharacter = expression.slice(-1);

      if ("+-*/".includes(lastCharacter)) {
        setExpression(
          expression.slice(0, -1) + operator
        );
        return;
      }
    }

    setExpression(display + operator);
    setDisplay("0");
  };

  const CalculatorButton = ({
    text,
    onPress,
    type = "number",
    flex = 1,
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.72}
        onPress={onPress}
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            marginRight: flex === 1 ? gap : 0,
          },
          type === "operator" && styles.operatorButton,
          type === "action" && styles.actionButton,
          type === "equals" && styles.equalsButton,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            {
              fontSize: Math.min(30, buttonSize * 0.38),
            },
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Calculator display */}
        <View style={styles.displayContainer}>
          {expression !== "" && (
            <Text
              style={styles.expression}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {expression}
            </Text>
          )}

          <Text
            style={styles.display}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.45}
          >
            {display}
          </Text>
        </View>

        {/* Calculator buttons */}
        <View
          style={[
            styles.buttonsContainer,
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          {/* Row 1 */}
          <View style={styles.row}>
            <CalculatorButton
              text="C"
              type="action"
              onPress={handleClear}
            />

            <CalculatorButton
              text="÷"
              type="operator"
              onPress={() => handleOperator("/")}
            />

            <CalculatorButton
              text="×"
              type="operator"
              onPress={() => handleOperator("*")}
            />

            <CalculatorButton
              text="−"
              type="operator"
              onPress={() => handleOperator("-")}
              flex={0}
            />
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <CalculatorButton
              text="7"
              onPress={() => handleNumber("7")}
            />

            <CalculatorButton
              text="8"
              onPress={() => handleNumber("8")}
            />

            <CalculatorButton
              text="9"
              onPress={() => handleNumber("9")}
            />

            <CalculatorButton
              text="+"
              type="operator"
              onPress={() => handleOperator("+")}
              flex={0}
            />
          </View>

          {/* Row 3 */}
          <View style={styles.row}>
            <CalculatorButton
              text="4"
              onPress={() => handleNumber("4")}
            />

            <CalculatorButton
              text="5"
              onPress={() => handleNumber("5")}
            />

            <CalculatorButton
              text="6"
              onPress={() => handleNumber("6")}
            />

            <CalculatorButton
              text="="
              type="equals"
              onPress={checkSecretCode}
              flex={0}
            />
          </View>

          {/* Row 4 */}
          <View style={styles.row}>
            <CalculatorButton
              text="1"
              onPress={() => handleNumber("1")}
            />

            <CalculatorButton
              text="2"
              onPress={() => handleNumber("2")}
            />

            <CalculatorButton
              text="3"
              onPress={() => handleNumber("3")}
            />

            <CalculatorButton
              text="."
              onPress={() => handleNumber(".")}
              flex={0}
            />
          </View>

          {/* Row 5 */}
          <View style={styles.row}>
            <TouchableOpacity
              activeOpacity={0.72}
              onPress={() => handleNumber("0")}
              style={[
                styles.zeroButton,
                {
                  width: buttonSize * 2 + gap,
                  height: buttonSize,
                  borderRadius: buttonSize / 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: Math.min(
                      30,
                      buttonSize * 0.38
                    ),
                  },
                ]}
              >
                0
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },

  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "flex-end",
  },

  displayContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingHorizontal: 25,
    paddingBottom: 28,
  },

  expression: {
    color: "#777",
    fontSize: 20,
    fontWeight: "400",
    marginBottom: 8,
  },

  display: {
    color: "#F5F5F5",
    fontSize: 64,
    fontWeight: "300",
    letterSpacing: -1,
  },

  buttonsContainer: {
    paddingBottom: 18,
  },

  row: {
    flexDirection: "row",
    marginBottom: 10,
  },

  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222222",
  },

  operatorButton: {
    backgroundColor: "#333333",
  },

  actionButton: {
    backgroundColor: "#454545",
  },

  equalsButton: {
    backgroundColor: "#454545",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "400",
  },

  zeroButton: {
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
  },
});