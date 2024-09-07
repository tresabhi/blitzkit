import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import {
  Button,
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

interface DatePickerProps {
  onDateChange?: (date: Date) => void;
  defaultDate?: Date;
}

export function DatePicker({
  onDateChange,
  defaultDate = new Date(),
}: DatePickerProps) {
  const [year, setYear] = useState(defaultDate.getFullYear());
  const [month, setMonth] = useState(defaultDate.getMonth());
  const [day, setDay] = useState(defaultDate.getDate());
  const [yearScroll, setYearScroll] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const date = new Date(year + yearOffset, month + monthOffset, day);

  const daysInLastMonth = new Date(
    year + yearOffset,
    month + monthOffset,
    0,
  ).getDate();
  const daysInMonth = new Date(
    year + yearOffset,
    month + monthOffset + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    year + yearOffset,
    month + monthOffset,
    1,
  ).getDay();
  const lastDayOfMonth = new Date(
    year + yearOffset,
    month + monthOffset,
    daysInMonth,
  ).getDay();

  return (
    <Flex direction="column" width="fit-content">
      <Flex justify="between" mb="2" align="center" py="2">
        <IconButton
          size="3"
          variant="ghost"
          onClick={() => {
            if (monthOffset === 0) {
              setYearOffset((state) => state - 1);
              setMonthOffset(11);
            } else {
              setMonthOffset((state) => state - 1);
            }
          }}
          ml="2"
        >
          <ChevronLeftIcon />
        </IconButton>

        <Flex align="center" gap="2">
          <IconButton
            size="3"
            variant="ghost"
            onClick={() => {
              setYear(defaultDate.getFullYear());
              setMonth(defaultDate.getMonth());
              setDay(defaultDate.getDate());
              setYearOffset(0);
              setMonthOffset(0);
            }}
          >
            <ReloadIcon />
          </IconButton>

          <Flex gap="1">
            <Text>
              {date.toLocaleString(undefined, {
                month: 'long',
              })}
            </Text>

            <Popover.Root onOpenChange={() => setYearScroll(0)}>
              <Popover.Trigger>
                <Link underline="always" href="#">
                  {date.getFullYear()}
                </Link>
              </Popover.Trigger>

              <Popover.Content side="right" align="center">
                <Flex direction="column" gap="1">
                  <IconButton
                    variant="ghost"
                    onClick={() => setYearScroll((state) => state + 1)}
                    mb="2"
                  >
                    <ChevronUpIcon />
                  </IconButton>

                  {times(YEAR_OPTIONS, (index) => {
                    const thisYear =
                      year +
                      yearOffset -
                      index +
                      Math.floor(YEAR_OPTIONS / 2) +
                      yearScroll;
                    const selected = year + yearOffset === thisYear;

                    return (
                      <Popover.Close key={thisYear}>
                        <Button
                          variant={selected ? 'solid' : 'soft'}
                          radius="large"
                          onClick={() => {
                            setYearOffset(thisYear - year);
                          }}
                        >
                          {thisYear}
                        </Button>
                      </Popover.Close>
                    );
                  })}

                  <IconButton
                    variant="ghost"
                    onClick={() => setYearScroll((state) => state - 1)}
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
          onClick={() => {
            if (monthOffset === 11) {
              setYearOffset((state) => state + 1);
              setMonthOffset(0);
            } else {
              setMonthOffset((state) => state + 1);
            }
          }}
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
          const selected =
            index === day - 1 && monthOffset === 0 && yearOffset === 0;

          return (
            <IconButton
              radius="large"
              key={index}
              variant={selected ? 'solid' : 'soft'}
              onClick={() => {
                const newYear =
                  year + yearOffset + Math.floor((month + monthOffset) / 12);
                const newMonth = (month + monthOffset) % 12;
                const newDay = index + 1;

                setYear(newYear);
                setMonth(newMonth);
                setDay(newDay);
                setYearOffset(0);
                setMonthOffset(0);

                onDateChange?.(new Date(newYear, newMonth, newDay));
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
    </Flex>
  );
}
