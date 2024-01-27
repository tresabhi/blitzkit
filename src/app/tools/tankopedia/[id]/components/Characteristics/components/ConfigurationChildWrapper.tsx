import { ReactNode } from 'react';
import * as styles from '../../../../page.css';

interface ConfigurationChildWrapperProps {
  children: ReactNode;
}

export function ConfigurationChildWrapper({
  children,
}: ConfigurationChildWrapperProps) {
  return <div className={styles.configurationChild}>{children}</div>;
}
