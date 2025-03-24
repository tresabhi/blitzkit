import { Card, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useEffect, useState } from 'react';
import {
  lastModuleSelect,
  moduleSelectEvent,
  type ModuleSelectEventData,
} from '../../../core/blitzkit/moduleSelect';

export function DissectorModuleCard() {
  const [moduleSelection, setModuleSelection] = useState(lastModuleSelect);

  useEffect(() => {
    function handleModuleSelectEvent(event: ModuleSelectEventData) {
      setModuleSelection(event);
    }

    return moduleSelectEvent.on(handleModuleSelectEvent);
  }, []);

  if (!moduleSelection.selected) return null;

  return (
    <group position={[0, 1, 0]}>
      <Html position={moduleSelection.position}>
        <Card>
          <Text>{moduleSelection.module}</Text>
        </Card>
      </Html>
    </group>
  );
}
