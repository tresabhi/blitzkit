import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Card,
  ChevronDownIcon,
  Flex,
  Grid,
  IconButton,
  Link,
  Popover,
  Text,
} from '@radix-ui/themes';
import { times } from 'lodash';
import { useState } from 'react';

const DAY_TITLES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const YEAR_OPTIONS = 7;

export function DatePicker() {
  const initialDate = new Date();

  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [day, setDay] = useState(initialDate.getDate());
  const [yearOffset, setYearOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const date = new Date(year + yearOffset, month + monthOffset, day);

  const daysInLastMonth = new Date(year, month + monthOffset, 0).getDate();
  const daysInMonth = new Date(year, month + monthOffset + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month + monthOffset, 1).getDay();
  const lastDayOfMonth = new Date(
    year,
    month + monthOffset,
    daysInMonth,
  ).getDay();

  return (
    <Card
      style={{
        width: 'fit-content',
      }}
    >
      <Flex justify="between" mb="2" align="center" py="2">
        <IconButton
          size="3"
          variant="ghost"
          onClick={() => setMonthOffset((state) => state - 1)}
          ml="2"
        >
          <ChevronLeftIcon />
        </IconButton>

        <Flex align="center" gap="2">
          <IconButton
            size="3"
            variant="ghost"
            onClick={() => {
              setYear(initialDate.getFullYear());
              setMonth(initialDate.getMonth());
              setDay(initialDate.getDate());
              setYearOffset(0);
              setMonthOffset(0);
            }}
          >
            <ReloadIcon />
          </IconButton>

          <Flex gap="1">
            <Text>{date.toLocaleString(undefined, { month: 'long' })} </Text>

            <Popover.Root onOpenChange={() => setYearOffset(0)}>
              <Popover.Trigger>
                <Link underline="always" href="#">
                  {date.getFullYear()}
                </Link>
              </Popover.Trigger>

              <Popover.Content side="right" align="center">
                <Flex direction="column" gap="1">
                  <IconButton
                    variant="ghost"
                    onClick={() => setYearOffset((state) => state + 1)}
                    mb="2"
                  >
                    <ChevronUpIcon />
                  </IconButton>

                  {times(YEAR_OPTIONS, (index) => {
                    const thisYear =
                      year - index + Math.floor(YEAR_OPTIONS / 2) + yearOffset;

                    return (
                      <Button
                        variant={year === thisYear ? 'solid' : 'soft'}
                        radius="large"
                        onClick={() => setYear(thisYear)}
                      >
                        {thisYear}
                      </Button>
                    );
                  })}

                  <IconButton
                    variant="ghost"
                    onClick={() => setYearOffset((state) => state - 1)}
                    mt="2"
                  >
                    <ChevronDownIcon />
                  </IconButton>
                </Flex>
              </Popover.Content>
            </Popover.Root>
          </Flex>
        </Flex>

        <IconButton
          size="3"
          variant="ghost"
          onClick={() => setMonthOffset((state) => state + 1)}
          mr="2"
        >
          <ChevronRightIcon />
        </IconButton>
      </Flex>

      <Flex mb="1">
        {times(7, (index) => (
          <Text
            style={{
              flex: 1,
            }}
            size="2"
            align="center"
            key={index}
            color="gray"
          >
            {DAY_TITLES[index]}
          </Text>
        ))}
      </Flex>

      <Grid columns="7" gap="1" width="fit-content">
        {times(firstDayOfMonth, (index) => (
          <IconButton radius="large" key={index} disabled>
            {daysInLastMonth - firstDayOfMonth + index + 1}
          </IconButton>
        ))}

        {times(daysInMonth, (index) => {
          const selected = index === day - 1 && monthOffset === 0;

          return (
            <IconButton
              radius="large"
              key={index}
              variant={selected ? 'solid' : 'soft'}
              onClick={() => {
                setYear(year + yearOffset);
                setMonth((month + monthOffset) % 12);
                setDay(index + 1);
                setYearOffset(0);
                setMonthOffset(0);
              }}
            >
              {index + 1}
            </IconButton>
          );
        })}

        {times(6 - lastDayOfMonth, (index) => (
          <IconButton radius="large" key={index} disabled>
            {index + 1}
          </IconButton>
        ))}
      </Grid>

      {/* {`${day} ${month} ${year}`} */}
    </Card>
  );
}
