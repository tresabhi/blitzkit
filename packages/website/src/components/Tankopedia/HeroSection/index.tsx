import { assertSecret, TankType } from '@blitzkit/core';
import { CaretLeftIcon, MixIcon, UpdateIcon } from '@radix-ui/react-icons';
import { Box, Dialog, Flex, Heading, Link, Spinner } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { NAVBAR_HEIGHT } from '../../../constants/navbar';
import { awaitableModelDefinitions } from '../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../core/awaitables/provisionDefinitions';
import { awaitableTankDefinitions } from '../../../core/awaitables/tankDefinitions';
import { tankToDuelMember } from '../../../core/blitzkit/tankToDuelMember';
import { Var } from '../../../core/radix/var';
import { useFullScreen } from '../../../hooks/useFullScreen';
import { useLocale } from '../../../hooks/useLocale';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import type { MaybeSkeletonComponentProps } from '../../../types/maybeSkeletonComponentProps';
import type { ThicknessRange } from '../../Armor/components/StaticArmor';
import { classIcons } from '../../ClassIcon';
import { ScienceIcon } from '../../ScienceIcon';
import { TankSearch } from '../../TankSearch';
import { Options } from './components/Options';
import { TankSandbox } from './components/TankSandbox';

const [provisionDefinitions, modelDefinitions, tankDefinitions] =
  await Promise.all([
    awaitableProvisionDefinitions,
    awaitableModelDefinitions,
    awaitableTankDefinitions,
  ]);

export function HeroSection({ skeleton }: MaybeSkeletonComponentProps) {
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const revealed = TankopediaEphemeral.use((state) => state.revealed);
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);
  const { unwrap, strings } = useLocale();
  const canvas = useRef<HTMLCanvasElement>(null);
  const isFullScreen = useFullScreen();
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const antagonist = Duel.use((state) => state.antagonist.tank);
  const Icon = classIcons[protagonist.class];
  const treeColor =
    protagonist.type === TankType.COLLECTOR
      ? 'blue'
      : protagonist.type === TankType.PREMIUM
        ? 'amber'
        : undefined;
  const compareTanks =
    protagonist.id === antagonist.id
      ? [protagonist.id]
      : [protagonist.id, antagonist.id];
  const thicknessRange = useMemo(() => {
    const entries = Object.values(tankDefinitions.tanks);
    const filtered = entries.filter(
      (thisTank) => thisTank.tier === protagonist.tier,
    );
    const value =
      (filtered.reduce((accumulator, thisTank) => {
        return (
          accumulator +
          thisTank.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
            .penetration.near
        );
      }, 0) /
        filtered.length) *
      (3 / 4);

    return { value } satisfies ThicknessRange;
  }, [protagonist]);
  const duelStore = Duel.useStore();
  const mutateDuel = Duel.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const { shells } =
        duelStore.getState().antagonist.gun.gun_type!.value.base;

      times(3, (index) => {
        if (event.key === `${index + 1}` && shells.length > index) {
          mutateDuel((draft) => {
            draft.antagonist.shell = shells[index];
          });
          mutateTankopediaEphemeral((draft) => {
            draft.customShell = undefined;
          });
        }
      });
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Flex justify="center">
      <Flex
        direction={{ initial: 'column', md: 'row' }}
        style={{
          zIndex: isFullScreen ? 2 : undefined,
          backgroundColor: 'black',
        }}
        height={
          isFullScreen ? '100vh' : `calc(100vh - ${NAVBAR_HEIGHT}px - 8rem)`
        }
        maxHeight={isFullScreen ? undefined : '60rem'}
        maxWidth={isFullScreen ? undefined : '120rem'}
        flexGrow="1"
        width={isFullScreen ? '100vw' : undefined}
        position={isFullScreen ? 'fixed' : 'relative'}
        top={isFullScreen ? '0' : undefined}
        left={isFullScreen ? '0' : undefined}
      >
        <Box
          className="tank-sandbox-container"
          flexGrow="1"
          flexBasis="0"
          flexShrink="0"
          position="relative"
        >
          <Box position="absolute" width="100%" height="100%" overflow="hidden">
            <Box
              width="100%"
              height="100%"
              position="relative"
              left={disturbed ? '0' : { initial: '0', md: '12.5%' }}
              style={{ transitionDuration: '200ms' }}
            >
              {!revealed && (
                <Spinner
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: Var('space-6'),
                    height: Var('space-6'),
                  }}
                />
              )}

              {/* {skeleton && <TankSandboxLoader id={protagonist.id} />} */}

              <Suspense>
                <TankSandbox ref={canvas} thicknessRange={thicknessRange} />
              </Suspense>
            </Box>

            <Options
              skeleton={skeleton}
              canvas={canvas}
              thicknessRange={thicknessRange}
            />
          </Box>
        </Box>

        <Flex
          justify="center"
          position={{ initial: 'relative', md: 'absolute' }}
          left={{
            initial: '0',
            md: disturbed ? '3' : '5',
            lg: disturbed ? '7' : '9',
          }}
          py="4"
          top={{ initial: '8', md: '50%' }}
          style={{
            transform: 'translate(0, -50%)',
            transitionDuration: '200ms',
            userSelect: 'none',
          }}
          direction="column"
          align={{ initial: 'center', md: 'center' }}
          gap="1"
        >
          <Flex align="center" gap="3" width="100%" justify="start">
            <Heading
              color={treeColor}
              trim="end"
              size={
                disturbed
                  ? { initial: '6', lg: '7' }
                  : { initial: '7', lg: '8' }
              }
              style={{ transitionDuration: '200ms', position: 'relative' }}
            >
              <Icon width="1em" height="1em" />
            </Heading>

            <Heading
              weight="regular"
              size={
                disturbed
                  ? { initial: '7', lg: '8' }
                  : { initial: '8', lg: '9' }
              }
              style={{ transitionDuration: '200ms' }}
              wrap="nowrap"
              color={treeColor}
            >
              {unwrap(protagonist.name)}
            </Heading>
          </Flex>

          <Flex
            mb="4"
            gap="4"
            ml={disturbed ? '0' : '-2'}
            style={{ transitionDuration: '200ms' }}
          >
            <Link color="gray" underline="always" href="/tools/tankopedia">
              <Flex align="center" gap="1">
                <CaretLeftIcon />
                {strings.website.tools.tankopedia.meta.back}
              </Flex>
            </Link>

            <Link
              color="gray"
              underline="always"
              href={`/tools/compare?tanks=${compareTanks.join('%2C')}`}
            >
              <Flex align="center" gap="1">
                <MixIcon />
                {strings.website.tools.tankopedia.meta.compare}
              </Flex>
            </Link>

            <Dialog.Root open={showSwapDialog} onOpenChange={setShowSwapDialog}>
              <Dialog.Trigger>
                <Link
                  color="gray"
                  underline="always"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setShowSwapDialog(true);
                  }}
                >
                  <Flex align="center" gap="1">
                    <UpdateIcon />
                    {strings.website.tools.tankopedia.meta.swap.button}
                  </Flex>
                </Link>
              </Dialog.Trigger>

              <Dialog.Content>
                <Dialog.Title>
                  {strings.website.tools.tankopedia.meta.swap.title}
                </Dialog.Title>

                <TankSearch
                  compact
                  onSelect={(tank) => {
                    const model = modelDefinitions.models[tank.id];

                    setShowSwapDialog(false);
                    mutateTankopediaEphemeral((draft) => {
                      draft.model = modelDefinitions.models[tank.id];
                    });
                    mutateDuel((draft) => {
                      draft.protagonist = tankToDuelMember(
                        tank,
                        model,
                        provisionDefinitions,
                      );
                    });

                    window.history.replaceState(
                      null,
                      '',
                      `/tools/tankopedia/${tank.id}`,
                    );
                  }}
                />
              </Dialog.Content>
            </Dialog.Root>

            {assertSecret(import.meta.env.PUBLIC_PROMOTE_OPENTEST) ===
              'true' && (
              <Link
                color="jade"
                href={`https://${
                  assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH) ===
                  'opentest'
                    ? ''
                    : 'opentest.'
                }blitzkit.app/tools/tankopedia/${protagonist.id}`}
              >
                <Flex align="center" gap="1">
                  <ScienceIcon width="1.25em" height="1.25em" />
                  {assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH) ===
                  'opentest'
                    ? strings.website.tools.tankopedia.meta.vanilla
                    : strings.website.tools.tankopedia.meta.opentest}
                </Flex>
              </Link>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
