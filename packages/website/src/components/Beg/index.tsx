import { Button, Em, Flex, Strong, Text } from "@radix-ui/themes";
import styles from "./index.module.css";

export function Beg() {
  return (
    <Flex align="center" gap="4" direction="column" className={styles.outer}>
      <Text size="3" className={styles.important}>
        <Flex gap="2" align="center">
          <img src="https://github.com/tresabhi.png" />
          <Em>We need your attention</Em>
        </Flex>
      </Text>

      <Flex direction="column" className={styles.center} gap="4">
        <Flex direction="column" gap="3">
          <Text color="tomato">
            We can no longer keep BlitzKit sustainable for <Strong>free</Strong>
            .
          </Text>

          <Text>
            We want to add tank modules, player statistics, rebalancing patch
            notes, bring back the Discord bot, and more.
          </Text>

          <Text>
            But paying out of pocket makes than impossible.{" "}
            <Strong>We are a non-profit</Strong>, so consider donating to make
            the above possible. 100% of your money goes back into BlitzKit.
          </Text>
        </Flex>

        <Flex gap="3">
          <Button size="3">$5</Button>
          <Button size="3">$10</Button>
          <Button size="3">$25</Button>
          <Button size="3">Custom</Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
