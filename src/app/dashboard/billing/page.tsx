'use client';

import React, { useState } from 'react';
import AdminLayout from 'layouts/admin';

import {
    Box, Flex, Heading, SimpleGrid, Text, Select,
    Tag, Badge, useColorModeValue, Icon
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import {
    MdAttachMoney, MdPeople, MdLightbulb, MdArrowDropUp,MdArrowDropDown,MdWarning,MdCheckCircle
} from 'react-icons/md';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const billingData = [
    {
        client: 'Client A',
        lob: 'Commercial',
        billingType: 'Capitation',
        data: {
            monthly: {
                periods: ['Jan', 'Feb', 'Mar'],
                facetsMembers: [9500, 9800, 9900],
                selfMembers: [9400, 9600, 9800],
                facetsAmount: [190000, 195000, 198000],
                selfAmount: [185000, 293000, 197000],
            },
            weekly: {
                periods: ['W1', 'W2', 'W3', 'W4'],
                facetsMembers: [2500, 2600, 2550, 2650],
                selfMembers: [2400, 2700, 2500, 2600],
                facetsAmount: [50000, 52000, 51000, 53000],
                selfAmount: [49000, 52500, 50500, 52000],
            },
        },
    },
    {
        client: 'Client B',
        lob: 'Medicare',
        billingType: 'Claims',
        data: {
            monthly: {
                periods: ['Jan', 'Feb', 'Mar'],
                facetsMembers: [8500, 8800, 8900],
                selfMembers: [8400, 8500, 8800],
                facetsAmount: [170000, 176000, 178000],
                selfAmount: [168000, 172000, 175000],
            },
            weekly: {
                periods: ['W1', 'W2', 'W3', 'W4'],
                facetsMembers: [2200, 2300, 2150, 2250],
                selfMembers: [2100, 2250, 2100, 2200],
                facetsAmount: [43000, 45000, 44000, 46000],
                selfAmount: [42000, 44000, 43000, 45000],
            },
        },
    },
    {
        client: 'Client C',
        lob: 'Medicaid',
        billingType: 'Capitation',
        data: {
            monthly: {
                periods: ['Jan', 'Feb', 'Mar'],
                facetsMembers: [7000, 7100, 7200],
                selfMembers: [7000, 7100, 7200],
                facetsAmount: [140000, 142000, 144000],
                selfAmount: [140000, 142000, 144000],
            },
            weekly: {
                periods: ['W1', 'W2', 'W3', 'W4'],
                facetsMembers: [1750, 1800, 1820, 1850],
                selfMembers: [1750, 1800, 1820, 1850],
                facetsAmount: [35000, 36000, 36400, 37000],
                selfAmount: [35000, 36000, 36400, 37000],
            },
        },
    },
    {
        client: 'Client D',
        lob: 'Exchange',
        billingType: 'Claims',
        data: {
            monthly: {
                periods: ['Jan', 'Feb', 'Mar'],
                facetsMembers: [6000, 6200, 6100],
                selfMembers: [5900, 6000, 6000],
                facetsAmount: [120000, 124000, 122000],
                selfAmount: [118000, 122000, 121000],
            },
            weekly: {
                periods: ['W1', 'W2', 'W3', 'W4'],
                facetsMembers: [1500, 1550, 1520, 1530],
                selfMembers: [1450, 1500, 1500, 1500],
                facetsAmount: [30000, 31000, 30500, 30600],
                selfAmount: [29000, 30500, 30000, 30300],
            },
        },
    },
];

const LineChart = ({ categories, series }: any) => {
    const options = {
        chart: { type: 'line', toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories },
        dataLabels: { enabled: false },
        legend: { position: 'top' },
        colors:['#FF922B', '#002677', '#00CFEA'],
        tooltip: { y: { formatter: (val: number) => `${val}` } },
    };
    return <Chart options={options} series={series} type="line" height={300} />;
};

const BillingPage: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [view, setView] = useState<'weekly' | 'monthly'>('monthly');
    const selected = billingData[selectedIndex];
    const boxBg = useColorModeValue('white', 'gray.800');
    const bg = useColorModeValue('secondaryGray.300', 'gray.800');

    const { periods, facetsMembers, selfMembers, facetsAmount, selfAmount } = selected.data[view];

    const totalFacetsMembers = facetsMembers.reduce((a, b) => a + b, 0);
    const totalSelfMembers = selfMembers.reduce((a, b) => a + b, 0);
    const totalFacetsAmount = facetsAmount.reduce((a, b) => a + b, 0);
    const totalSelfAmount = selfAmount.reduce((a, b) => a + b, 0);

    const percentMemberDiff = (
        ((totalFacetsMembers - totalSelfMembers) / totalFacetsMembers) *
        100
    ).toFixed(2);

    const percentAmountDiff = (
        ((totalFacetsAmount - totalSelfAmount) / totalFacetsAmount) *
        100
    ).toFixed(2);

    const isBalanced = Number(percentMemberDiff) < 2 && Number(percentAmountDiff) < 2;

    const memberDiffTrend = facetsMembers.map((f, i) => f - selfMembers[i]);
    const amountDiffTrend = facetsAmount.map((f, i) => f - selfAmount[i]);
    const membersBilledPercent = (totalSelfMembers / totalFacetsMembers) * 100;


    const notes =
        memberDiffTrend.every((d) => d === 0) && amountDiffTrend.every((d) => d === 0)
            ? 'Perfect alignment between self and facets billing.'
            : memberDiffTrend.slice(-1)[0] < memberDiffTrend[0]
                ? 'Difference is reducing – alignment improving.'
                : 'Recent spike in mismatch – review self billing logic.';

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px={6} bg={bg} minH="100vh">
            <Heading size="lg" mb={2}>Billing Overview</Heading>
            <Flex justify="space-between" align="center" mb={6}>
                <Text fontSize="md" color="gray.600">
                    Client: {selected.client} | LOB: {selected.lob} | Billing: {selected.billingType}
                </Text>
                <Select w="240px" value={selectedIndex} onChange={(e) => setSelectedIndex(Number(e.target.value))}>
                    {billingData.map((b, i) => (
                        <option key={i} value={i}>{b.client} - {b.lob}</option>
                    ))}
                </Select>
            </Flex>


            <Flex gap={4} mb={4}>
                <Tag colorScheme="blue">Billing Period: {view}</Tag>
                <Tag colorScheme={isBalanced ? 'green' : 'red'}>
                    {isBalanced ? 'Balanced' : 'Unbalanced'}
                </Tag>
                <Tag colorScheme="gray">Diff: {percentMemberDiff}% Members / {percentAmountDiff}% Amount</Tag>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={6}>
                <MiniStatistics name="Facets Members" value={totalFacetsMembers.toLocaleString()} startContent={<IconBox icon={<MdPeople />} w="56px" h="56px" bg={boxBg} />} />
                <MiniStatistics
                    name="Members Billed"
                    value={
                        <Flex align="center" gap={1}>
                            {totalSelfMembers.toLocaleString()}
                            <Flex align="center" fontSize="sm" color={membersBilledPercent <= 100 ? 'green.500' : 'orange.500'}>
                                <Icon as={membersBilledPercent <= 100 ? MdCheckCircle : MdWarning} />
                                {membersBilledPercent.toFixed(1)}%
                            </Flex>
                        </Flex>
                    }
                    startContent={<IconBox icon={<MdPeople />} w="56px" h="56px" bg={boxBg} />}
                />


                <MiniStatistics
                    name="Self-Billed Amount"
                    value={
                        <Flex align="center" gap={1}>
                            ₹{totalSelfAmount.toLocaleString()}
                            <Flex align="center" fontSize="sm" color={totalSelfAmount <= totalFacetsAmount ? 'green.500' : 'red.500'}>
                                <Icon as={totalSelfAmount >= totalFacetsAmount ? MdArrowDropUp : MdArrowDropDown} />
                                {percentAmountDiff}%
                            </Flex>
                        </Flex>
                    }
                    startContent={<IconBox icon={<MdAttachMoney />} w="56px" h="56px" bg={boxBg} />}
                />
                <MiniStatistics name="Facets Amount" value={`₹${totalFacetsAmount.toLocaleString()}`} startContent={<IconBox icon={<MdAttachMoney />} w="56px" h="56px" bg={boxBg} />} />
                     </SimpleGrid>



            <Box bg={boxBg} p={4} borderRadius="lg" mb={4} shadow="sm">
                <Flex align="center" gap={2} mb={1}>
                    <Icon as={MdLightbulb} color="yellow.400" boxSize={5} />
                    <Text fontWeight="semibold">Auto Insights:</Text>
                </Flex>
                <Text fontSize="sm" color="gray.600">{notes}</Text>
            </Box>


            <Flex justify="flex-end" mb={4}>
                <Select size="sm" w="150px" value={view} onChange={(e) => setView(e.target.value as any)}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                </Select>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={6}>
                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={4}>Billing Amount Trend</Heading>
                    <LineChart
                        categories={periods}
                        series={[
                            { name: 'Facets Amount', data: facetsAmount },
                            { name: 'Self Amount', data: selfAmount },
                        ]}
                    />
                </Box>

                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={4}>Billing Member Trend</Heading>
                    <LineChart
                        categories={periods}
                        series={[
                            { name: 'Facets Members', data: facetsMembers },
                            { name: 'Members Billed', data: selfMembers },
                        ]}
                    />
                </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={6}>
                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={4}>Difference Trend (Members)</Heading>
                    <LineChart
                        categories={periods}
                        series={[{ name: 'Member Diff', data: memberDiffTrend }]}
                    />
                </Box>

                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={4}>Difference Trend (Amount)</Heading>
                    <LineChart
                        categories={periods}
                        series={[{ name: 'Amount Diff', data: amountDiffTrend }]}
                    />
                </Box>
            </SimpleGrid>

            <Box bg={boxBg} p={6} borderRadius="xl" shadow="md" mb={10}>
                <Flex align="center" gap={2} mb={2}>
                    <Icon as={MdLightbulb}  boxSize={5} />
                    <Heading size="md">Auto Notes</Heading>
                </Flex>
                <Text>{notes}</Text>
            </Box>
        </Box>
    );
};

(BillingPage as any).getLayout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
export default BillingPage;
