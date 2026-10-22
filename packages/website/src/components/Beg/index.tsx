import { Flex, Heading, Text } from "@radix-ui/themes";
import styles from "./index.module.css";

export function Beg() {
  return (
    <Flex justify="center" className={styles.outer}>
      <Flex direction="column" className={styles.center} gap="4">
        <Flex direction="column">
          <Heading>We want to add the following features:</Heading>

          <Text>
            <ul>
              <li>Tank modules</li>
              <li>Player statistics</li>
              <li>Tank change logs over updates</li>
              <li>Multiple game versions</li>
              <li>Bring back the Discord bot</li>
              <li>And many unannounced features</li>
            </ul>
          </Text>

          <Text>
            But we can no longer keep updating BlitzKit sustainably for free.
            So, we ask you to donate. 100% of your funds go back into
            maintaining BlitzKit. We are a non-profit.
          </Text>
        </Flex>

        <Flex gap="3">asd</Flex>
      </Flex>
    </Flex>
  );
}
